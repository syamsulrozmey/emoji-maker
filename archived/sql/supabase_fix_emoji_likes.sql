-- Fix for missing emoji_likes table
-- This is the CRITICAL missing table causing the like feature to fail
-- Run this in your Supabase SQL Editor

-- Create the emoji_likes table
CREATE TABLE IF NOT EXISTS emoji_likes (
  user_id TEXT REFERENCES profiles(user_id),
  emoji_id BIGINT REFERENCES emojis(id),
  PRIMARY KEY (user_id, emoji_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emoji_likes_user ON emoji_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_emoji_likes_emoji ON emoji_likes(emoji_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ emoji_likes table created successfully!';
END $$;

