/**
 * Profile Sync Utility
 * 
 * This utility ensures that all authenticated users have a profile in Supabase.
 * It's used as a fallback mechanism to catch users who signed up when the webhook
 * was misconfigured or failed to deliver.
 */

export interface ProfileSyncResult {
  success: boolean;
  profile?: {
    user_id: string;
    credits: number;
    tier: string;
  };
  created?: boolean;
  error?: string;
}

/**
 * Syncs the current user's profile with Supabase.
 * If the profile doesn't exist, it creates one with default values.
 * 
 * @returns Promise<ProfileSyncResult> - Result of the sync operation
 */
export async function syncUserProfile(): Promise<ProfileSyncResult> {
  try {
    const response = await fetch('/api/profile/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Profile sync failed:', data);
      return {
        success: false,
        error: data.error || 'Failed to sync profile',
      };
    }

    if (data.created) {
      console.log('Profile created successfully:', data.profile);
    } else {
      console.log('Profile already exists:', data.profile);
    }

    return data;
  } catch (error) {
    console.error('Error syncing profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Hook-friendly wrapper for profile sync.
 * Can be called in useEffect or component initialization.
 */
export async function ensureUserProfile(): Promise<boolean> {
  const result = await syncUserProfile();
  return result.success;
}

