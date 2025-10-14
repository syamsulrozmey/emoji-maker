import { supabase } from './supabase';

export interface Profile {
  user_id: string;
  credits: number;
  tier: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Ensures a user profile exists in Supabase.
 * If the profile doesn't exist, creates one with default values.
 * This function is designed to be used in server-side code (middleware, API routes).
 * 
 * @param userId - The Clerk user ID
 * @returns Promise<Profile> - The user's profile (existing or newly created)
 * @throws Error if database operations fail
 */
export async function ensureUserProfile(userId: string): Promise<Profile> {
  try {
    // Check if user profile exists in Supabase
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If profile exists, return it
    if (existingProfile && !checkError) {
      return existingProfile;
    }

    // If profile doesn't exist (PGRST116 is "not found" error), create it
    if (checkError && checkError.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          credits: 3,
          tier: 'free',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }

      if (!newProfile) {
        throw new Error('Profile creation returned no data');
      }

      console.log(`✅ Profile created for user: ${userId}`);
      return newProfile;
    }

    // Handle other database errors
    console.error('Error checking profile:', checkError);
    throw new Error(`Database error: ${checkError?.message || 'Unknown error'}`);
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    throw error;
  }
}

