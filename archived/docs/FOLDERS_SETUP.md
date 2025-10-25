# Folders Feature Setup Guide

## Overview

The folders feature has been implemented to allow users to organize their emojis into custom categories (tabs/folders). Each user has their own separate folders and emoji-to-folder assignments.

## What's New

### Database Schema
- **`folders` table**: Stores user-specific folders/categories
- **`emoji_folders` table**: Junction table for user-specific emoji-to-folder assignments

### API Endpoints
- `GET /api/folders` - Fetch all user folders
- `POST /api/folders` - Create a new folder
- `PUT /api/folders` - Rename a folder
- `DELETE /api/folders?id=<folder_id>` - Delete a folder
- `PATCH /api/emojis/[id]/folder` - Assign/unassign emoji to folder

### Frontend Changes
- Folders are now persisted to Supabase database (no more localStorage)
- All folder operations (create, rename, delete) sync with the database
- Emoji-to-folder assignments are user-specific and persisted

## Setup Instructions

### Step 1: Create Database Tables

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_folders_schema.sql` into the SQL Editor
4. Run the SQL script

This will create:
- The `folders` table
- The `emoji_folders` table
- Necessary indexes for performance
- Row Level Security (RLS) policies

### Step 2: Verify Tables

After running the SQL script, verify the tables were created:

```sql
-- Check folders table
SELECT * FROM folders LIMIT 1;

-- Check emoji_folders table
SELECT * FROM emoji_folders LIMIT 1;
```

### Step 3: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in with your Clerk account

3. Test folder operations:
   - Click "Add folder" button to create a new folder
   - Create a folder (e.g., "Animals")
   - Generate or select an emoji
   - Assign it to your folder
   - Try renaming the folder (hover over folder tab, click the three dots)
   - Try deleting the folder

### Step 4: Verify Database Persistence

After creating folders and assigning emojis:

1. Refresh the page - your folders and assignments should persist
2. Sign out and sign in again - your folders should still be there
3. Clear browser cache - folders should still be there (no localStorage!)

## Features

### User-Specific Folders
- Each user has their own separate set of folders
- Folders are not shared between users

### User-Specific Assignments
- Each user can organize emojis differently
- The same emoji can be in different folders for different users
- Emoji assignments are private to each user

### Cascade Deletion
- When a folder is deleted, the emoji-folder assignments are automatically removed
- Emojis themselves are not deleted, they just return to the "All" tab

## Troubleshooting

### Folders not showing up
- Check browser console for errors
- Verify you're signed in with Clerk
- Check Supabase logs for API errors

### Cannot create folders
- Verify the `folders` table exists in Supabase
- Check that RLS policies are properly set
- Verify your Clerk authentication is working

### Emojis not staying in folders
- Check the `emoji_folders` table exists
- Verify the foreign key constraints are properly set
- Check browser console for API errors

## Database Schema Details

### folders table
```sql
id          UUID        PRIMARY KEY
name        TEXT        NOT NULL
user_id     TEXT        NOT NULL
created_at  TIMESTAMP   DEFAULT NOW()
```

### emoji_folders table
```sql
id          UUID        PRIMARY KEY
emoji_id    BIGINT      REFERENCES emojis(id) ON DELETE CASCADE
folder_id   UUID        REFERENCES folders(id) ON DELETE CASCADE
user_id     TEXT        NOT NULL
created_at  TIMESTAMP   DEFAULT NOW()
UNIQUE(emoji_id, user_id)
```

## Migration Notes

**Important**: This implementation starts fresh with Supabase. Any folders previously stored in localStorage will not be automatically migrated. Users will need to recreate their folders.

If you need to migrate localStorage data, you would need to:
1. Read folders from localStorage
2. For each folder, call POST /api/folders
3. For each emoji assignment, call PATCH /api/emojis/[id]/folder

## Next Steps

- Consider adding folder colors or icons
- Add folder sorting/reordering
- Add bulk emoji operations (move multiple emojis at once)
- Add folder sharing between users
- Add folder templates or presets

