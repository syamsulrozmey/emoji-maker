import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/profile/credits
 * Returns current credit balance for authenticated user
 * No daily reset - credits are one-time allocations
 */
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
      .select('user_id, credits, tier, subscription_status')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get most recent tier from transactions
    const { data: latestTransaction } = await supabase
      .from('stripe_transactions')
      .select('tier_purchased')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      credits: profile.credits,
      tier: latestTransaction?.tier_purchased || profile.tier || null,
      subscription_status: profile.subscription_status,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

