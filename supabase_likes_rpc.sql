-- SQL RPC functions for emoji likes feature
-- Run this in your Supabase SQL Editor

-- Function to increment likes count on an emoji
CREATE OR REPLACE FUNCTION increment_likes(emoji_id BIGINT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE emojis 
  SET likes_count = likes_count + 1 
  WHERE id = emoji_id;
END;
$$;

-- Function to decrement likes count on an emoji
CREATE OR REPLACE FUNCTION decrement_likes(emoji_id BIGINT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE emojis 
  SET likes_count = GREATEST(likes_count - 1, 0) 
  WHERE id = emoji_id;
END;
$$;

