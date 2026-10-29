import { NextResponse } from 'next/server';
import { saveChallengeProgress, getCanonicalDateString } from '@/lib/gamification/repository';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, challengeId, questionId, selectedOptionId } = body;
    const challengeDate = body.challengeDate || getCanonicalDateString();

    if (!userId || userId === 'guest' || userId.startsWith('guest_') || !challengeId || !questionId || !selectedOptionId) {
      return NextResponse.json(
        { error: 'Authentication required. Only logged in users can save daily challenge progress.' },
        { status: 401 }
      );
    }

    const attempt = await saveChallengeProgress(
      userId,
      challengeId,
      challengeDate,
      questionId,
      selectedOptionId
    );

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (error: any) {
    console.error('Failed to save challenge progress:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to autosave progress' },
      { status: 500 }
    );
  }
}
