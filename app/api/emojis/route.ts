import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get user if authenticated (optional for viewing emojis)
    const { userId } = await auth();

    // Fetch all emojis
    const { data: emojis, error } = await supabase
      .from('emojis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching emojis:', error);
      return NextResponse.json(
        { error: 'Failed to fetch emojis' },
        { status: 500 }
      );
    }

    // If user is authenticated, fetch their likes
    let userLikes: number[] = [];
    if (userId) {
      const { data: likes, error: likesError } = await supabase
        .from('emoji_likes')
        .select('emoji_id')
        .eq('user_id', userId);

      if (!likesError && likes) {
        userLikes = likes.map((like) => like.emoji_id);
      }
    }

    // Add isLiked flag to each emoji
    const emojisWithLikes = (emojis || []).map((emoji) => ({
      ...emoji,
      isLiked: userLikes.includes(emoji.id),
    }));

    return NextResponse.json({ 
      success: true,
      emojis: emojisWithLikes 
    });
  } catch (error) {
    console.error('Error fetching emojis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emojis' },
      { status: 500 }
    );
  }
}

