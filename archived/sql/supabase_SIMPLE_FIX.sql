-- SIMPLE FIX: Just create the missing emoji_likes table
-- Copy this ENTIRE file and paste into Supabase SQL Editor

CREATE TABLE IF NOT EXISTS emoji_likes (
  user_id TEXT REFERENCES profiles(user_id),
  emoji_id BIGINT REFERENCES emojis(id),
  PRIMARY KEY (user_id, emoji_id)
);

CREATE INDEX IF NOT EXISTS idx_emoji_likes_user ON emoji_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_emoji_likes_emoji ON emoji_likes(emoji_id);

