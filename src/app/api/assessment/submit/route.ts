import { NextResponse } from 'next/server';
import { AssessmentLevelId } from '@/types/assessment';
import { submitAssessmentAttempt } from '@/lib/assessment/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      attemptId,
      userId,
      levelId = 'beginner',
      answers = {},
      timeSpentSeconds = 0,
    } = body;

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { error: 'Authentication required to submit assessment' },
        { status: 401 }
      );
    }

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });
    }

    const completed = await submitAssessmentAttempt({
      attemptId,
      userId,
      levelId: levelId as AssessmentLevelId,
      answers,
      timeSpentSeconds,
    });

    return NextResponse.json({
      success: true,
      attempt: completed,
    });
  } catch (error: any) {
    console.error('Assessment submit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to score and submit assessment' },
      { status: 500 }
    );
  }
}
