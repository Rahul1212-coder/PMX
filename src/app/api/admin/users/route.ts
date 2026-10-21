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

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const stageFilter = (searchParams.get('stage') || 'all').toLowerCase();
    const statusFilter = (searchParams.get('status') || 'all').toLowerCase();
    const sortBy = searchParams.get('sortBy') || 'last_active';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // 1. Fetch all users from auth.users
    const { data: authData, error: authErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }
    const users = authData?.users || [];

    // 2. Fetch all profiles
    const { data: profiles, error: profErr } = await admin.from('profiles').select('*');
    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    // 3. Fetch latest quiz results per user
    const { data: quizResults } = await admin
      .from('quiz_results')
      .select('user_id, score_percentage, archetype, created_at')
      .order('created_at', { ascending: false });

    const quizMap = new Map<string, { score: number; archetype: string; date: string }>();
    (quizResults || []).forEach((q) => {
      if (q.user_id && !quizMap.has(q.user_id)) {
        quizMap.set(q.user_id, {
          score: q.score_percentage,
          archetype: q.archetype,
          date: q.created_at,
        });
      }
    });

    // 4. Fetch resume evals count per user
    const { data: savedJobs } = await admin.from('saved_jobs').select('user_id, job_id');
    const resumeCountMap = new Map<string, number>();
    (savedJobs || []).forEach((j) => {
      if (typeof j.job_id === 'string' && j.job_id.startsWith('resume_eval_')) {
        resumeCountMap.set(j.user_id, (resumeCountMap.get(j.user_id) || 0) + 1);
      }
    });

    // Profile lookup map
    const profMap = new Map<string, any>();
    (profiles || []).forEach((p) => profMap.set(p.id, p));

    // 5. Merge into unified user activity objects
    let enrichedUsers = users.map((u) => {
      const p = profMap.get(u.id);
      const quiz = quizMap.get(u.id);
      const resumeCount = Math.max(
        resumeCountMap.get(u.id) || 0,
        Number(u.user_metadata?.resume_eval_count || 0)
      );

      const fullName = (p?.full_name || u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Anonymous').trim();
      const role = (p?.role || u.user_metadata?.role || '').trim();
      const company = (p?.company || u.user_metadata?.company || '').trim();
      const pmStage = p?.pm_stage || u.user_metadata?.pm_stage || null;
      const yearsOfExperience = p?.years_of_experience ?? u.user_metadata?.years_of_experience ?? null;
      const avatarUrl = p?.avatar_url || u.user_metadata?.avatar_url || '';
      const bio = p?.bio || u.user_metadata?.bio || '';

      const isActive = Boolean(u.last_sign_in_at);
      const diagnosticScore = quiz ? quiz.score : (p?.pm_fit_score ?? null);
      const diagnosticArchetype = quiz ? quiz.archetype : null;

      return {
        id: u.id,
        email: u.email || '',
        fullName,
        role: role || (isActive ? 'Product Manager' : '—'),
        company: company || '—',
        pmStage: pmStage || 'pending',
        previousRole: p?.previous_role || u.user_metadata?.previous_role || '',
        yearsOfExperience,
        avatarUrl,
        bio,
        isActive,
        status: isActive ? 'active' : 'pending',
        diagnosticScore,
        diagnosticArchetype,
        resumeAuditsCount: resumeCount,
        lastSignInAt: u.last_sign_in_at || null,
        createdAt: u.created_at || null,
        updatedAt: p?.updated_at || null,
      };
    });

    // 6. Apply search filter
    if (query) {
      enrichedUsers = enrichedUsers.filter((u) => {
        return (
          u.fullName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query) ||
          u.company.toLowerCase().includes(query)
        );
      });
    }

    // 7. Apply stage filter
    if (stageFilter && stageFilter !== 'all') {
      enrichedUsers = enrichedUsers.filter((u) => u.pmStage === stageFilter);
    }

    // 8. Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      enrichedUsers = enrichedUsers.filter((u) => u.status === statusFilter);
    }

    // 9. Apply Sorting
    enrichedUsers.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'last_active') {
        const timeA = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
        const timeB = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'created_at') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'score') {
        const scoreA = a.diagnosticScore ?? -1;
        const scoreB = b.diagnosticScore ?? -1;
        comparison = scoreA - scoreB;
      } else if (sortBy === 'name') {
        comparison = a.fullName.localeCompare(b.fullName);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return NextResponse.json({
      success: true,
      totalCount: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
