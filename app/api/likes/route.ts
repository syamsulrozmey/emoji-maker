import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/lib/ensure-profile';

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

    // Ensure user profile exists (required for foreign key constraint)
    try {
      await ensureUserProfile(userId);
    } catch (profileError) {
      console.error('Failed to ensure user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify user profile' },
        { status: 500 }
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
        return NextResponse.json(
          { error: `Failed to remove like: ${deleteError.message}` },
          { status: 500 }
        );
      }

      // 2. Decrement likes_count in emojis table
      // Try RPC function first, fallback to fetching and updating manually
      const { error: rpcError } = await supabase.rpc('decrement_likes', {
        emoji_id: emojiId
      });

      if (rpcError) {
        console.warn('RPC decrement_likes not available, using manual update:', rpcError.message);
        // Fallback: Fetch current count, decrement, and update
        const { data: currentEmoji } = await supabase
          .from('emojis')
          .select('likes_count')
          .eq('id', emojiId)
          .single();
        
        if (currentEmoji) {
          const newCount = Math.max((currentEmoji.likes_count || 0) - 1, 0);
          await supabase
            .from('emojis')
            .update({ likes_count: newCount })
            .eq('id', emojiId);
        }
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
        return NextResponse.json(
          { error: `Failed to add like: ${insertError.message}` },
          { status: 500 }
        );
      }

      // 2. Increment likes_count in emojis table
      // Try RPC function first, fallback to fetching and updating manually
      const { error: rpcError } = await supabase.rpc('increment_likes', {
        emoji_id: emojiId
      });

      if (rpcError) {
        console.warn('RPC increment_likes not available, using manual update:', rpcError.message);
        // Fallback: Fetch current count, increment, and update
        const { data: currentEmoji } = await supabase
          .from('emojis')
          .select('likes_count')
          .eq('id', emojiId)
          .single();
        
        if (currentEmoji) {
          const newCount = (currentEmoji.likes_count || 0) + 1;
          await supabase
            .from('emojis')
            .update({ likes_count: newCount })
            .eq('id', emojiId);
        }
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

