import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import Replicate from 'replicate';
import sharp from 'sharp';
import { supabase } from '@/lib/supabase';
import { deductCredit } from '@/lib/credits';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface ReplicateOutput {
  url: () => string | URL;
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to generate emojis' },
        { status: 401 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check user's credits before generating
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, credits, tier, subscription_status')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Profile not found. Please refresh the page.' },
        { status: 404 }
      );
    }

    // Check if user has enough credits
    if (profile.credits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade to continue generating emojis.' },
        { status: 403 }
      );
    }

    // Step 1: Generate emoji via Replicate
    const input = {
      prompt: `A TOK emoji of ${prompt}`,
      apply_watermark: false,
    };

    const output = await replicate.run(
      'fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e',
      { input }
    ) as ReplicateOutput[];

    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('No output received from Replicate API:', output);
      throw new Error('No output received from Replicate API');
    }

    const urlResult = output[0].url();
    const replicateImageUrl = typeof urlResult === 'string' ? urlResult : String(urlResult);
    
    if (!replicateImageUrl || replicateImageUrl.trim() === '') {
      console.error('Invalid image URL received from Replicate API:', replicateImageUrl);
      throw new Error('Invalid image URL received from Replicate API');
    }

    // Step 2: Fetch the image from Replicate's temporary URL
    const imageResponse = await fetch(replicateImageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from Replicate');
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Step 3: Embed metadata in PNG using Sharp
    // Fetch user info for metadata
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const username = user.username || user.firstName || user.emailAddresses[0]?.emailAddress || 'Anonymous';

    const imageWithMetadata = await sharp(Buffer.from(imageBuffer))
      .withMetadata({
        exif: {
          IFD0: {
            ImageDescription: `Prompt: ${prompt}`,
            Copyright: `Created by ${username} on Emoji Maker - ${new Date().toISOString()}`,
            Software: 'Emoji Maker - AI-Powered Emoji Generator',
          }
        }
      })
      .png()
      .toBuffer();

    // Step 4: Upload to Supabase storage with metadata embedded
    const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(fileName, imageWithMetadata, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading to Supabase storage:', uploadError);
      throw new Error('Failed to upload image to storage');
    }

    // Step 5: Get public URL from Supabase
    const { data: { publicUrl } } = supabase.storage
      .from('emojis')
      .getPublicUrl(fileName);

    // Step 6: Insert emoji metadata into database
    const { data: emojiData, error: insertError } = await supabase
      .from('emojis')
      .insert({
        image_url: publicUrl,
        prompt: prompt,
        creator_user_id: userId,
        likes_count: 0,
        is_public: false,
        has_watermark: false,
        credits_used: 1,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting emoji to database:', insertError);
      // Try to clean up the uploaded file
      await supabase.storage.from('emojis').remove([fileName]);
      throw new Error('Failed to save emoji to database');
    }

    // Step 7: Deduct 1 credit using the new credit system
    let newCredits: number;
    try {
      newCredits = await deductCredit(userId, true);
    } catch (creditError) {
      console.error('Error deducting credit:', creditError);
      // Use fallback - subtract from profile credits directly
      newCredits = Math.max(0, profile.credits - 1);
    }

    // Step 8: Return success response with complete emoji data and updated credits
    return NextResponse.json({
      success: true,
      emoji: {
        id: emojiData.id,
        imageUrl: emojiData.image_url,
        prompt: emojiData.prompt,
        creatorUserId: emojiData.creator_user_id,
        likesCount: emojiData.likes_count,
        createdAt: emojiData.created_at,
      },
      credits: newCredits,
    });
  } catch (error) {
    console.error('Error generating emoji:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate emoji',
      },
      { status: 500 }
    );
  }
}

