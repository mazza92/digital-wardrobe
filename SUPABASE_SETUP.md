# Supabase Setup Guide

To enable the User Account features, you need to configure your Supabase project.

## 1. Environment Variables

Add the following to your `.env.local` (for local development) and `.env.production` (for deployment):

```bash
VITE_SUPABASE_URL=https://ycxfqhuwtlujuumgejlo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 2. Database Schema

Run the following SQL in your Supabase **SQL Editor** to create the necessary tables.

### Profiles Table
Stores user preferences and extra data.

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  marketing_opt_in boolean default false,
  preferences jsonb default '{}'::jsonb,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Users can view their own profile."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );
```

### Favorites Table
Stores user's saved items.

```sql
create table favorites (
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

-- Set up Row Level Security (RLS)
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
```

## 3. Auto-Create Profile Trigger (Optional but Recommended)

This trigger automatically creates a profile entry when a new user signs up via Auth.

```sql
-- inserts a row into public.profiles
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, marketing_opt_in, preferences)
  values (
    new.id, 
    new.email, 
    (new.raw_user_meta_data->>'marketing_opt_in')::boolean,
    '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

