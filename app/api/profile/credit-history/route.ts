import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCreditHistory } from '@/lib/credits';

/**
 * GET /api/profile/credit-history
 * Returns all credit allocations for the authenticated user
 * Useful for showing purchase history and credit breakdown
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

    // Fetch credit history
    const history = await getCreditHistory(userId);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit history' },
      { status: 500 }
    );
  }
}

