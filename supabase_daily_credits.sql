-- Add daily credit reset tracking to profiles table
-- Run this migration in your Supabase SQL Editor

-- Add last_credit_reset column to track when credits were last refreshed
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_credit_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Update existing users to have the current timestamp
UPDATE profiles 
SET last_credit_reset = CURRENT_TIMESTAMP 
WHERE last_credit_reset IS NULL;

