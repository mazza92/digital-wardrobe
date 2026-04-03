-- Migration: Add 'name' field to user_profiles table
-- Run this in Supabase SQL Editor

-- Add name column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update the trigger function to include name from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, marketing_opt_in, preferences)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'name',
    (NEW.raw_user_meta_data->>'marketing_opt_in')::boolean,
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger 'on_auth_user_created' should already exist from previous migration
-- If it doesn't exist, run:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
