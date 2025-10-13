import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to like emojis' },
        { status: 401 }
      );
    }

    const { emojiId } = await request.json();

    if (!emojiId) {
      return NextResponse.json(
        { error: 'Emoji ID is required' },
        { status: 400 }
      );
    }

    // Check if user has already liked this emoji
    const { data: existingLike, error: checkError } = await supabase
      .from('emoji_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('emoji_id', emojiId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Error checking existing like:', checkError);
      throw checkError;
    }

    let isLiked = false;

    if (existingLike) {
      // User has already liked - UNLIKE
      // 1. Delete from emoji_likes table
      const { error: deleteError } = await supabase
        .from('emoji_likes')
        .delete()
        .eq('user_id', userId)
        .eq('emoji_id', emojiId);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        throw deleteError;
      }

      // 2. Decrement likes_count in emojis table
      const { error: decrementError } = await supabase.rpc('decrement_likes', {
        emoji_id: emojiId
      });

      if (decrementError) {
        console.error('Error decrementing likes:', decrementError);
        console.warn('RPC function decrement_likes not found. Please create it in Supabase.');
      }

      isLiked = false;
    } else {
      // User hasn't liked - LIKE
      // 1. Insert into emoji_likes table
      const { error: insertError } = await supabase
        .from('emoji_likes')
        .insert({
          user_id: userId,
          emoji_id: emojiId,
        });

      if (insertError) {
        console.error('Error adding like:', insertError);
        throw insertError;
      }

      // 2. Increment likes_count in emojis table
      const { error: incrementError } = await supabase.rpc('increment_likes', {
        emoji_id: emojiId
      });

      if (incrementError) {
        console.error('Error incrementing likes:', incrementError);
        console.warn('RPC function increment_likes not found. Please create it in Supabase.');
      }

      isLiked = true;
    }

    // Fetch updated emoji data
    const { data: emojiData, error: fetchError } = await supabase
      .from('emojis')
      .select('likes_count')
      .eq('id', emojiId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated emoji:', fetchError);
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: emojiData?.likes_count || 0,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

