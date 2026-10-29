import { NextResponse } from 'next/server';
import { getArenaLeaderboard } from '@/lib/gamification/repository';
import { LeaderboardLeague, LeaderboardTimeframe } from '@/types/gamification';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = (searchParams.get('league') || 'intermediate') as LeaderboardLeague;
    const timeframe = (searchParams.get('timeframe') || 'weekly') as LeaderboardTimeframe;
    const userId = searchParams.get('userId') || undefined;

    const leaderboard = await getArenaLeaderboard(league, timeframe, userId);

    return NextResponse.json({
      success: true,
      ...leaderboard,
    });
  } catch (error: any) {
    console.error('Failed to fetch arena leaderboard:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load leaderboard' },
      { status: 500 }
    );
  }
}
