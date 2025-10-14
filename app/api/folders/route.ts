import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all user folders
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch folders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      folders: folders || [],
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

// POST - Create new folder
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        name: name.trim(),
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      return NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      folder,
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

// PUT - Rename folder
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name } = body;

    if (!id || !name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder ID and name are required' },
        { status: 400 }
      );
    }

    // Update folder only if it belongs to the user
    const { data: folder, error } = await supabase
      .from('folders')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error renaming folder:', error);
      return NextResponse.json(
        { error: 'Failed to rename folder' },
        { status: 500 }
      );
    }

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      folder,
    });
  } catch (error) {
    console.error('Error renaming folder:', error);
    return NextResponse.json(
      { error: 'Failed to rename folder' },
      { status: 500 }
    );
  }
}

// DELETE - Delete folder
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Delete folder only if it belongs to the user
    // CASCADE will automatically delete emoji_folders entries
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting folder:', error);
      return NextResponse.json(
        { error: 'Failed to delete folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}

