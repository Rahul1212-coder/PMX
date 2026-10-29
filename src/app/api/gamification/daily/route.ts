import { NextResponse } from 'next/server';
import { getDailyChallenge, getCanonicalDateString } from '@/lib/gamification/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || getCanonicalDateString();
    const userId = searchParams.get('userId') || undefined;

    const { challenge, userAttempt } = await getDailyChallenge(dateStr, userId);

    return NextResponse.json({
      success: true,
      challenge,
      userAttempt,
    });
  } catch (error: any) {
    console.error('Failed to fetch daily challenge:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load daily challenge' },
      { status: 500 }
    );
  }
}
