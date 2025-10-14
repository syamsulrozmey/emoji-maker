import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// PATCH - Assign/unassign emoji to folder for current user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const emojiId = parseInt(id);

    if (isNaN(emojiId)) {
      return NextResponse.json(
        { error: 'Invalid emoji ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { folderId } = body;

    // If folderId is null, remove the emoji from any folder
    if (folderId === null) {
      const { error } = await supabase
        .from('emoji_folders')
        .delete()
        .eq('emoji_id', emojiId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing emoji from folder:', error);
        return NextResponse.json(
          { error: 'Failed to remove emoji from folder' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        folderId: null,
      });
    }

    // Verify folder belongs to user
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single();

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found or unauthorized' },
        { status: 404 }
      );
    }

    // Upsert emoji-folder assignment
    // First, delete any existing assignment for this emoji and user
    await supabase
      .from('emoji_folders')
      .delete()
      .eq('emoji_id', emojiId)
      .eq('user_id', userId);

    // Then insert the new assignment
    const { data: assignment, error: insertError } = await supabase
      .from('emoji_folders')
      .insert({
        emoji_id: emojiId,
        folder_id: folderId,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error assigning emoji to folder:', insertError);
      return NextResponse.json(
        { error: 'Failed to assign emoji to folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      folderId: assignment.folder_id,
    });
  } catch (error) {
    console.error('Error updating emoji folder:', error);
    return NextResponse.json(
      { error: 'Failed to update emoji folder' },
      { status: 500 }
    );
  }
}

