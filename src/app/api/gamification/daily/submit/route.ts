import { NextResponse } from 'next/server';
import { submitChallengeAttempt, getCanonicalDateString } from '@/lib/gamification/repository';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, answers, timeTakenSeconds } = body;
    const challengeDate = body.challengeDate || getCanonicalDateString();

    if (!userId || userId === 'guest' || userId.startsWith('guest_') || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Authentication required. Only logged in users can play and submit daily questions.' },
        { status: 401 }
      );
    }

    const result = await submitChallengeAttempt(
      userId,
      challengeDate,
      answers,
      Number(timeTakenSeconds) || 180
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to submit challenge attempt:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit challenge attempt' },
      { status: 500 }
    );
  }
}
