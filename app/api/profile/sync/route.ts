import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Get authenticated user ID from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user profile exists in Supabase
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('user_id, credits, tier')
      .eq('user_id', userId)
      .single();

    // If profile exists, return it
    if (existingProfile && !checkError) {
      return NextResponse.json({
        success: true,
        profile: existingProfile,
        created: false,
      });
    }

    // If profile doesn't exist (PGRST116 is "not found" error), create it
    if (checkError && checkError.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          credits: 3,
          tier: 'free',
          last_credit_reset: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return NextResponse.json(
          { error: 'Failed to create profile', details: insertError.message },
          { status: 500 }
        );
      }

      console.log(`Profile created for user: ${userId}`);
      
      return NextResponse.json({
        success: true,
        profile: newProfile,
        created: true,
      });
    }

    // Handle other database errors
    console.error('Error checking profile:', checkError);
    return NextResponse.json(
      { error: 'Database error', details: checkError?.message },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in profile sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

