import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { isAuthorizedAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin client unconfigured' }, { status: 500 });
    }

    // Optional admin email header verification if provided
    const userEmailHeader = request.headers.get('x-admin-email');
    if (userEmailHeader && !isAuthorizedAdmin(userEmailHeader)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    // 1. Fetch all auth users
    const { data: authData, error: authErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }
    const users = authData?.users || [];

    // 2. Fetch public profiles
    const { data: profiles, error: profErr } = await admin.from('profiles').select('*');
    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    // 3. Fetch quiz results
    const { data: quizResults } = await admin
      .from('quiz_results')
      .select('*')
      .order('created_at', { ascending: false });

    // 4. Fetch saved jobs / resume evals
    const { data: savedJobs } = await admin.from('saved_jobs').select('*');

    // Aggregate User Stats
    const totalUsers = users.length;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let activeUsersCount = 0;
    let pendingUsersCount = 0;
    let activeTodayCount = 0;
    let active7DaysCount = 0;

    users.forEach((u) => {
      if (u.last_sign_in_at) {
        activeUsersCount++;
        const lastSignIn = new Date(u.last_sign_in_at);
        if (lastSignIn >= oneDayAgo) activeTodayCount++;
        if (lastSignIn >= sevenDaysAgo) active7DaysCount++;
      } else {
        pendingUsersCount++;
      }
    });

    // Stage Distribution
    const stageDistribution: Record<string, number> = {
      existing_pm: 0,
      switching_roles: 0,
      fresher: 0,
      pending: 0,
    };

    (profiles || []).forEach((p) => {
      const stage = p.pm_stage || 'pending';
      stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
    });

    // Quiz Benchmark Stats
    const totalQuizzes = quizResults?.length || 0;
    let totalScoreSum = 0;
    const archetypeBreakdown: Record<string, number> = {};

    (quizResults || []).forEach((q) => {
      totalScoreSum += q.score_percentage || 0;
      if (q.archetype) {
        archetypeBreakdown[q.archetype] = (archetypeBreakdown[q.archetype] || 0) + 1;
      }
    });

    const averageQuizScore = totalQuizzes > 0 ? Math.round(totalScoreSum / totalQuizzes) : 0;

    // Resume Activity Count
    const resumeEvalsFromJobs = (savedJobs || []).filter((j) =>
      typeof j.job_id === 'string' && j.job_id.startsWith('resume_eval_')
    ).length;

    let resumeEvalsFromMeta = 0;
    users.forEach((u) => {
      const count = Number(u.user_metadata?.resume_eval_count || 0);
      resumeEvalsFromMeta += count;
    });
    const totalResumeAudits = Math.max(resumeEvalsFromJobs, resumeEvalsFromMeta);

    // Build Chronological Recent Activity Feed (up to 25 items)
    const activities: Array<{
      id: string;
      type: 'signup' | 'login' | 'quiz' | 'resume';
      title: string;
      description: string;
      timestamp: string;
      userEmail?: string;
    }> = [];

    // Recent logins / signups
    users.forEach((u) => {
      if (u.last_sign_in_at) {
        activities.push({
          id: `login-${u.id}-${u.last_sign_in_at}`,
          type: 'login',
          title: 'User Signed In',
          description: `${u.email} authenticated on PMVerse`,
          timestamp: u.last_sign_in_at,
          userEmail: u.email,
        });
      }
      if (u.created_at) {
        activities.push({
          id: `signup-${u.id}-${u.created_at}`,
          type: 'signup',
          title: 'New Account Registered / Invited',
          description: `${u.email} registered on PMVerse`,
          timestamp: u.created_at,
          userEmail: u.email,
        });
      }
    });

    // Recent quiz results
    const userMap = new Map<string, string>();
    users.forEach((u) => {
      if (u.id && u.email) userMap.set(u.id, u.email);
    });

    (quizResults || []).forEach((q) => {
      const email = userMap.get(q.user_id) || 'Unknown User';
      activities.push({
        id: `quiz-${q.id}`,
        type: 'quiz',
        title: 'Diagnostic Benchmark Completed',
        description: `${email} scored ${q.score_percentage}/100 (${q.archetype || 'Completed'})`,
        timestamp: q.created_at,
        userEmail: email,
      });
    });

    // Recent resume evals
    (savedJobs || []).forEach((j) => {
      if (typeof j.job_id === 'string' && j.job_id.startsWith('resume_eval_')) {
        const email = userMap.get(j.user_id) || 'Candidate';
        activities.push({
          id: `resume-${j.user_id}-${j.created_at}`,
          type: 'resume',
          title: 'Resume Intelligence Audit',
          description: `${email} ran an AI semantic resume evaluation`,
          timestamp: j.created_at,
          userEmail: email,
        });
      }
    });

    // Sort activities descending by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      kpis: {
        totalUsers,
        activeUsers: activeUsersCount,
        pendingUsers: pendingUsersCount,
        activeToday: activeTodayCount,
        activeLast7Days: active7DaysCount,
        totalProfiles: profiles?.length || 0,
        totalDiagnosticTests: totalQuizzes,
        averageDiagnosticScore: averageQuizScore,
        totalResumeAudits,
      },
      stageDistribution,
      archetypeBreakdown,
      recentActivities: activities.slice(0, 30),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
