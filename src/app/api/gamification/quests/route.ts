import { NextResponse } from 'next/server';
import { getWeeklyQuestsWithProgress } from '@/lib/gamification/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';

    const quests = await getWeeklyQuestsWithProgress(userId);

    return NextResponse.json({
      success: true,
      quests,
    });
  } catch (error: any) {
    console.error('Failed to fetch weekly quests:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load weekly quests' },
      { status: 500 }
    );
  }
}
