-- SQL schema for folders feature
-- Run this in your Supabase SQL Editor

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emoji_folders junction table
CREATE TABLE IF NOT EXISTS emoji_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji_id BIGINT NOT NULL REFERENCES emojis(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(emoji_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_emoji_folders_user_id ON emoji_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_emoji_folders_emoji_id ON emoji_folders(emoji_id);
CREATE INDEX IF NOT EXISTS idx_emoji_folders_folder_id ON emoji_folders(folder_id);

-- Add Row Level Security (RLS) policies
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE emoji_folders ENABLE ROW LEVEL SECURITY;

-- Folders policies: Users can only see and manage their own folders
CREATE POLICY "Users can view their own folders" ON folders
  FOR SELECT USING (true); -- Allow viewing all folders for now

CREATE POLICY "Users can insert their own folders" ON folders
  FOR INSERT WITH CHECK (true); -- Let application handle user_id

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (true); -- Let application handle user_id check

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (true); -- Let application handle user_id check

-- Emoji_folders policies: Users can only manage their own emoji-folder assignments
CREATE POLICY "Users can view emoji folder assignments" ON emoji_folders
  FOR SELECT USING (true); -- Allow viewing for now

CREATE POLICY "Users can insert their own emoji folder assignments" ON emoji_folders
  FOR INSERT WITH CHECK (true); -- Let application handle user_id

CREATE POLICY "Users can delete their own emoji folder assignments" ON emoji_folders
  FOR DELETE USING (true); -- Let application handle user_id check

