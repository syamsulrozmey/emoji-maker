import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    [key: string]: any;
  };
};

export async function POST(req: NextRequest) {
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: ClerkWebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const userId = evt.data.id;

    try {
      // Check if user already exists in profiles table
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      // If user doesn't exist, create a new profile
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            credits: 3,
            tier: 'free',
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        }

        console.log(`Created profile for user: ${userId}`);
      } else {
        console.log(`Profile already exists for user: ${userId}`);
      }

      return NextResponse.json(
        { success: true, message: 'User profile created' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error handling user.created event:', error);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }
  }

  // Return success for other event types
  return NextResponse.json(
    { success: true, message: 'Webhook received' },
    { status: 200 }
  );
}

