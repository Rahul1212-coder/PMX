import { NextResponse } from 'next/server';
import {
  getUserGamificationProfile,
  getUserAchievements,
} from '@/lib/gamification/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'guest') {
      return NextResponse.json({
        success: true,
        profile: null,
        achievements: [],
      });
    }

    const [profile, achievements] = await Promise.all([
      getUserGamificationProfile(userId),
      getUserAchievements(userId),
    ]);

    return NextResponse.json({
      success: true,
      profile,
      achievements,
    });
  } catch (error: any) {
    console.error('Failed to fetch user gamification status:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load user gamification status' },
      { status: 500 }
    );
  }
}
