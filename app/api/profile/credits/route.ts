import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

/**
 * Checks if the last credit reset was before today (UTC)
 */
function shouldResetCredits(lastResetDate: string): boolean {
  const lastReset = new Date(lastResetDate);
  const now = new Date();
  
  // Convert both dates to UTC and compare only the date part
  const lastResetUTC = new Date(Date.UTC(
    lastReset.getUTCFullYear(),
    lastReset.getUTCMonth(),
    lastReset.getUTCDate()
  ));
  
  const nowUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  
  return lastResetUTC < nowUTC;
}

export async function GET() {
  try {
    // Get authenticated user ID from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user profile from Supabase
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, credits, tier, last_credit_reset')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    let currentCredits = profile.credits;

    // Daily refresh logic for free tier users
    if (profile.tier === 'free' && shouldResetCredits(profile.last_credit_reset)) {
      // Reset credits to 3 for free tier users
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          credits: 3,
          last_credit_reset: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select('credits')
        .single();

      if (updateError) {
        console.error('Error resetting daily credits:', updateError);
        // If update fails, return current credits anyway
      } else {
        currentCredits = updatedProfile.credits;
        console.log(`✅ Daily credits reset for user: ${userId}`);
      }
    }

    return NextResponse.json({
      success: true,
      credits: currentCredits,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

