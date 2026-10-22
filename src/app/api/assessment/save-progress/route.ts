import { NextResponse } from 'next/server';
import { AssessmentLevelId } from '@/types/assessment';
import { saveAttemptProgress } from '@/lib/assessment/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      attemptId,
      userId = 'guest',
      levelId = 'beginner',
      answers = {},
      markedForReview = [],
      timeSpentSeconds = 0,
    } = body;

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });
    }

    const saved = await saveAttemptProgress({
      attemptId,
      userId,
      levelId: levelId as AssessmentLevelId,
      answers,
      markedForReview,
      timeSpentSeconds,
    });

    return NextResponse.json({ success: true, attempt: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to autosave assessment progress' },
      { status: 500 }
    );
  }
}
