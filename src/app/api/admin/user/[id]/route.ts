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

    // 3. Fetch all legacy quiz results for this user
    const { data: quizHistory } = await admin
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 4. Fetch 3-Level Assessment attempts
    let assessmentAttempts: any[] = [];
    try {
      const { data } = await admin
        .from('assessment_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      assessmentAttempts = data || [];
    } catch {
      assessmentAttempts = [];
    }

    // 5. Fetch Weekly Challenge submissions
    let challengeSubmissions: any[] = [];
    try {
      const { data } = await admin
        .from('challenge_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      challengeSubmissions = data || [];
    } catch {
      challengeSubmissions = [];
    }

    // 6. Fetch saved jobs / resume evaluations
    const { data: savedJobs } = await admin
      .from('saved_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 7. Circle memberships
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
      assessmentAttempts: assessmentAttempts || [],
      challengeSubmissions: challengeSubmissions || [],
      savedJobs: savedJobs || [],
      circleMemberships: circleMemberships || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin client unconfigured' }, { status: 500 });
    }

    const body = await request.json();
    const {
      fullName,
      role,
      company,
      pmStage,
      yearsOfExperience,
      previousRole,
      bio,
      avatarUrl,
    } = body;

    // 1. Prepare profile updates for public.profiles
    const profileUpdate: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (fullName !== undefined) profileUpdate.full_name = fullName;
    if (role !== undefined) profileUpdate.role = role;
    if (company !== undefined) profileUpdate.company = company;
    if (pmStage !== undefined) profileUpdate.pm_stage = pmStage;
    if (yearsOfExperience !== undefined) {
      profileUpdate.years_of_experience =
        yearsOfExperience === '' || yearsOfExperience === null ? null : Number(yearsOfExperience);
    }
    if (previousRole !== undefined) profileUpdate.previous_role = previousRole;
    if (bio !== undefined) profileUpdate.bio = bio;
    if (avatarUrl !== undefined) profileUpdate.avatar_url = avatarUrl;

    // Check if profile exists; if so update, else upsert
    const { data: existingProf } = await admin.from('profiles').select('id').eq('id', userId).single();
    let updatedProfile = null;

    if (existingProf) {
      const { data: profData, error: profErr } = await admin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)
        .select()
        .single();
      if (profErr) {
        console.warn('Error updating public.profiles in admin:', profErr);
      } else {
        updatedProfile = profData;
      }
    } else {
      const { data: profData, error: profErr } = await admin
        .from('profiles')
        .insert({ id: userId, ...profileUpdate })
        .select()
        .single();
      if (!profErr) {
        updatedProfile = profData;
      }
    }

    // 2. Also update auth.users raw_user_meta_data so auth session metadata is synced
    try {
      const { data: userData } = await admin.auth.admin.getUserById(userId);
      if (userData?.user) {
        const currentMeta = userData.user.user_metadata || {};
        const newMeta = {
          ...currentMeta,
          ...(fullName !== undefined ? { full_name: fullName, name: fullName } : {}),
          ...(role !== undefined ? { role } : {}),
          ...(company !== undefined ? { company } : {}),
          ...(pmStage !== undefined ? { pm_stage: pmStage } : {}),
          ...(yearsOfExperience !== undefined
            ? { years_of_experience: yearsOfExperience === '' || yearsOfExperience === null ? null : Number(yearsOfExperience) }
            : {}),
          ...(previousRole !== undefined ? { previous_role: previousRole } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
        };

        await admin.auth.admin.updateUserById(userId, {
          user_metadata: newMeta,
        });
      }
    } catch (metaErr) {
      console.warn('Could not update user_metadata in auth:', metaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'User profile successfully updated',
      profile: updatedProfile || profileUpdate,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update user profile' }, { status: 500 });
  }
}
