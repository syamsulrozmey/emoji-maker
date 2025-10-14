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

    // If user is authenticated, fetch their likes and folder assignments
    let userLikes: number[] = [];
    let emojiToFolderMap: Record<number, string> = {};
    
    if (userId) {
      // Fetch likes
      const { data: likes, error: likesError } = await supabase
        .from('emoji_likes')
        .select('emoji_id')
        .eq('user_id', userId);

      if (!likesError && likes) {
        userLikes = likes.map((like) => like.emoji_id);
      }

      // Fetch folder assignments for this user
      const { data: assignments, error: assignmentsError } = await supabase
        .from('emoji_folders')
        .select('emoji_id, folder_id')
        .eq('user_id', userId);

      if (!assignmentsError && assignments) {
        emojiToFolderMap = assignments.reduce((acc, assignment) => {
          acc[assignment.emoji_id] = assignment.folder_id;
          return acc;
        }, {} as Record<number, string>);
      }
    }

    // Add isLiked flag and folder_id to each emoji
    const emojisWithMetadata = (emojis || []).map((emoji) => ({
      ...emoji,
      isLiked: userLikes.includes(emoji.id),
      folder_id: emojiToFolderMap[emoji.id] || null,
    }));

    return NextResponse.json({ 
      success: true,
      emojis: emojisWithMetadata 
    });
  } catch (error) {
    console.error('Error fetching emojis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emojis' },
      { status: 500 }
    );
  }
}

