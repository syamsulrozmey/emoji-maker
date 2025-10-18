# Middleware Profile Sync Implementation

## Overview
Successfully replaced the unreliable Clerk webhook approach with server-side middleware that automatically creates user profiles in Supabase after authentication.

## What Was Changed

### ✅ New Files Created

#### `lib/ensure-profile.ts`
- Server-side helper function `ensureUserProfile(userId: string)`
- Checks if user profile exists in Supabase `profiles` table
- Creates profile with default values if it doesn't exist (`credits: 3`, `tier: 'free'`)
- Returns the profile data or throws an error
- Reusable in middleware and API routes

### ✅ Files Modified

#### `middleware.ts`
**Before:** Only handled Clerk authentication
**After:** 
- Authenticates with Clerk
- Automatically checks/creates user profile in Supabase
- Runs on every protected route (automatic, no client code needed)
- Gracefully handles errors without blocking requests

#### `app/page.tsx`
**Before:** Client-side profile sync with `syncUserProfile()` on mount
**After:** 
- Removed client-side profile sync code
- Removed `profileSynced` state
- Simplified to just fetch data when authenticated
- Profile creation now handled automatically by middleware

### ✅ Files Removed

#### `app/api/webhooks/clerk/route.ts`
- Deleted webhook handler (no longer needed)
- Middleware approach is more reliable

### ✅ Files Unchanged (Still Available)

#### `app/api/profile/sync/route.ts`
- Kept as fallback/manual sync endpoint
- Can be used for debugging or manual profile creation

#### `lib/profile-sync.ts`
- Client-side utility still exists
- Not actively used but available if needed

## How It Works

### Flow Diagram
```
User Signs In/Up with Clerk
         ↓
    Middleware runs
         ↓
  Clerk authenticates user
         ↓
  Get userId from Clerk
         ↓
  Call ensureUserProfile(userId)
         ↓
  Check if profile exists in Supabase
         ↓
    ┌─────┴─────┐
    ↓           ↓
 EXISTS    DOESN'T EXIST
    ↓           ↓
 Return    Create profile
 profile   (credits: 3, tier: 'free')
    ↓           ↓
    └─────┬─────┘
          ↓
   Continue to page/API
```

### Key Benefits

1. **Automatic**: Runs on every authenticated request
2. **Server-side**: No client dependency, more reliable
3. **Early**: Profile created before page loads
4. **Transparent**: User doesn't see any loading/sync steps
5. **Fail-safe**: Errors don't block the request

## Testing Instructions

### Test 1: New User Signup
1. Sign up a new user via Clerk
2. After successful signup, user should be redirected to home page
3. Check Supabase `profiles` table - new row should exist with:
   - `user_id`: Clerk user ID
   - `credits`: 3
   - `tier`: 'free'
4. User should immediately see credits (3) in the header
5. User should be able to generate emojis right away

### Test 2: Existing User Login
1. Sign in with an existing user
2. Should load normally without creating duplicate profiles
3. Check Supabase - no duplicate rows
4. Credits should display correctly from existing profile

### Test 3: Profile in API Routes
1. After login, try generating an emoji
2. Should work immediately (profile already exists)
3. Credits should decrement correctly

### Verification Queries

**Check if profile was created:**
```sql
SELECT * FROM profiles WHERE user_id = 'YOUR_CLERK_USER_ID';
```

**Check profile timestamps:**
```sql
SELECT user_id, credits, tier, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

## Troubleshooting

### Issue: Profile not created on signup
- Check server console for errors from `ensureUserProfile()`
- Verify Supabase credentials in `.env.local`
- Check Supabase connection (test with `/api/profile/sync`)

### Issue: Middleware errors
- Check middleware logs in terminal
- Verify `lib/ensure-profile.ts` imports correctly
- Check Supabase table permissions

### Issue: Duplicate profiles
- Shouldn't happen (check prevents duplicates)
- If it does, check for race conditions in async code

## Rollback Plan

If something goes wrong, you can rollback by:

1. Restore webhook handler: `git checkout origin/main -- app/api/webhooks/clerk/route.ts`
2. Restore old middleware: `git checkout origin/main -- middleware.ts`
3. Restore old page.tsx: `git checkout origin/main -- app/page.tsx`
4. Delete `lib/ensure-profile.ts`

## Next Steps

This implementation fulfills **Requirement #1** from `requirements/backend_instructions.md`:
- ✅ Get userId from Clerk after successful signin
- ✅ Check if userId exists in `profiles` table
- ✅ Create user if doesn't exist
- ✅ Proceed with user_id for functions like generate emojis

The profile sync is now fully automatic and reliable!

