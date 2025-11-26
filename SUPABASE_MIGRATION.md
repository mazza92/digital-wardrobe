-- Safe Migration Script: Add User Accounts without breaking existing data

-- 1. Update Profiles Table (Existing table is for Influencer profiles, we need User profiles)
-- Strategy: We will keep the existing 'profiles' table for admin/influencer profiles 
-- and create a NEW table 'user_profiles' for regular users to avoid conflict and confusing nullable columns.
-- Or better: Modify 'profiles' to be hybrid. But looking at the columns (heroImage, bio), it's strictly for public profiles.
-- Best approach: Create 'user_profiles' for the new Auth system.

create table if not exists user_profiles (
  id uuid references auth.users not null primary key,
  email text,
  marketing_opt_in boolean default false,
  preferences jsonb default '{}'::jsonb,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on user_profiles
alter table user_profiles enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Users can view their own profile." on user_profiles;
drop policy if exists "Users can insert their own profile." on user_profiles;
drop policy if exists "Users can update their own profile." on user_profiles;
drop policy if exists "Users can manage own profile" on user_profiles;

-- Create a single permissive policy for all operations
-- This ensures INSERT, UPDATE, SELECT, and DELETE all work correctly
create policy "Users can manage own profile"
  on user_profiles for all
  using ( auth.uid() = id )
  with check ( auth.uid() = id );


-- 2. Create Favorites Table (This table does not exist in your structure, so we can create it safely)
create table if not exists favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  outfit_id text,
  product_name text,
  brand text,
  image_url text,
  price text,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Ensure a user can't favorite the same product twice
  unique(user_id, product_id)
);

-- Enable RLS on favorites
alter table favorites enable row level security;

create policy "Users can view their own favorites."
  on favorites for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own favorites."
  on favorites for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own favorites."
  on favorites for delete
  using ( auth.uid() = user_id );


-- 3. Create Auto-Profile Trigger
-- We use 'user_profiles' instead of 'profiles' to keep things clean.

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_profiles (id, email, marketing_opt_in, preferences)
  values (
    new.id, 
    new.email, 
    (new.raw_user_meta_data->>'marketing_opt_in')::boolean,
    '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

