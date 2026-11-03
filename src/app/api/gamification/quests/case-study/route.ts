import { NextResponse } from 'next/server';
import { recordCaseStudySubmission } from '@/lib/gamification/repository';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { error: 'Valid userId required' },
        { status: 400 }
      );
    }

    await recordCaseStudySubmission(userId);

    return NextResponse.json({
      success: true,
      message: 'Weekly Case Study submission recorded for Strategic Teardown quest',
    });
  } catch (error: any) {
    console.error('Failed to record case study submission for quest:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record case study submission' },
      { status: 500 }
    );
  }
}
