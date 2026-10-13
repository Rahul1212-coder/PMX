import { NextResponse } from 'next/server';
import { rewriteResumeBullet } from '@/lib/resume/openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalBullet, goal = 'impact', targetRole, targetJobContext, metricAnswers } = body;

    if (!originalBullet || typeof originalBullet !== 'string' || originalBullet.trim().length < 5) {
      return NextResponse.json(
        { error: 'Original resume bullet text is required for rewriting.' },
        { status: 400 }
      );
    }

    const result = await rewriteResumeBullet({
      originalBullet: originalBullet.trim(),
      goal,
      targetRole,
      targetJobContext,
      metricAnswers,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('API rewrite-bullet error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to rewrite resume bullet.' },
      { status: 500 }
    );
  }
}
