import { NextResponse } from 'next/server';
import { claimQuestReward } from '@/lib/gamification/repository';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, questId } = body;

    if (!userId || !questId) {
      return NextResponse.json(
        { error: 'Missing userId or questId parameters' },
        { status: 400 }
      );
    }

    const result = await claimQuestReward(userId, questId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to claim quest reward:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to claim quest reward' },
      { status: 400 }
    );
  }
}
