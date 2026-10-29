import { NextResponse } from 'next/server';
import { CURATED_DAILY_CHALLENGES } from '@/lib/gamification/questionBank';
import { isAuthorizedAdmin } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('adminEmail');

    if (!isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      challenges: CURATED_DAILY_CHALLENGES,
      totalCount: CURATED_DAILY_CHALLENGES.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, challenge } = body;

    if (!isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    if (!challenge || !challenge.challengeDate || !challenge.title || !Array.isArray(challenge.questions)) {
      return NextResponse.json({ error: 'Invalid challenge payload' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (admin) {
      await admin.from('daily_challenges').upsert({
        id: challenge.id || `dc_${challenge.challengeDate.replace(/-/g, '')}`,
        challenge_date: challenge.challengeDate,
        title: challenge.title,
        theme: challenge.theme || 'General Product Management',
        description: challenge.description || '',
        difficulty: challenge.difficulty || 'intermediate',
        publication_status: challenge.publicationStatus || 'published',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Challenge saved and scheduled',
      challenge,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save challenge' }, { status: 500 });
  }
}
