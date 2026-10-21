import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin client unconfigured' }, { status: 500 });
    }

    // 1. Fetch user from auth.users
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'User not found in auth' }, { status: 404 });
    }
    const user = userData.user;

    // 2. Fetch public profile
    const { data: profile } = await admin.from('profiles').select('*').eq('id', userId).single();

    // 3. Fetch all quiz results for this user
    const { data: quizHistory } = await admin
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 4. Fetch saved jobs / resume evaluations
    const { data: savedJobs } = await admin
      .from('saved_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 5. Circle memberships
    let circleMemberships: any[] = [];
    try {
      const { data } = await admin
        .from('circle_members')
        .select('*, circles(*)')
        .eq('user_id', userId);
      circleMemberships = data || [];
    } catch {
      circleMemberships = [];
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        emailConfirmedAt: user.email_confirmed_at,
        metadata: user.user_metadata,
      },
      profile: profile || null,
      quizHistory: quizHistory || [],
      savedJobs: savedJobs || [],
      circleMemberships: circleMemberships || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
