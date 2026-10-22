import { NextResponse } from 'next/server';
import { AssessmentLevelId } from '@/types/assessment';
import { ASSESSMENT_LEVEL_CONFIGS } from '@/data/threeLevelQuestions';
import {
  getPublicQuestionsForLevel,
  getLevelsWithUserProgress,
} from '@/lib/assessment/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const levelId = (searchParams.get('levelId') || 'beginner') as AssessmentLevelId;
    const userId = searchParams.get('userId') || undefined;

    if (!ASSESSMENT_LEVEL_CONFIGS[levelId]) {
      return NextResponse.json({ error: 'Invalid assessment level ID' }, { status: 400 });
    }

    // Check unlock status
    const { progress } = await getLevelsWithUserProgress(userId);
    const levelProg = progress[levelId];

    if (!levelProg || !levelProg.isUnlocked) {
      return NextResponse.json(
        {
          error: `Level "${levelId}" is locked. Complete the prerequisite level with at least 70% to unlock.`,
          isLocked: true,
        },
        { status: 403 }
      );
    }

    const questions = await getPublicQuestionsForLevel(levelId);
    const levelConfig = ASSESSMENT_LEVEL_CONFIGS[levelId];

    return NextResponse.json({
      success: true,
      levelId,
      levelConfig,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assessment questions' },
      { status: 500 }
    );
  }
}
