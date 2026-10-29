import { NextResponse } from 'next/server';
import { getUserAttempts } from '@/lib/assessment/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { error: 'Authentication required to view assessment history' },
        { status: 401 }
      );
    }

    const attempts = await getUserAttempts(userId);
    return NextResponse.json({ success: true, attempts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assessment history' },
      { status: 500 }
    );
  }
}
