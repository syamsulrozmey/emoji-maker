-- RPC Functions for likes
-- Copy this ENTIRE file and paste into Supabase SQL Editor

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

