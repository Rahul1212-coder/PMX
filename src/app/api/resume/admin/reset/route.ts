import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, targetEmail, targetUserId } = body;

    if (!isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    if (!targetEmail && !targetUserId) {
      return NextResponse.json({ error: 'targetEmail or targetUserId is required.' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin client unavailable.' }, { status: 500 });
    }

    let resolvedUserId = targetUserId;
    let resolvedEmail = targetEmail;

    // Lookup user by email if targetUserId not provided
    if (!resolvedUserId && targetEmail) {
      const { data: users, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) {
        return NextResponse.json({ error: listErr.message }, { status: 500 });
      }
      const matched = users?.users?.find(
        (u) => u.email?.toLowerCase() === targetEmail.trim().toLowerCase()
      );
      if (!matched) {
        return NextResponse.json({ error: `User with email "${targetEmail}" was not found.` }, { status: 404 });
      }
      resolvedUserId = matched.id;
      resolvedEmail = matched.email;
    }

    // 1. Reset user_metadata in Supabase Auth
    const { data: userRecord, error: getErr } = await admin.auth.admin.getUserById(resolvedUserId);
    if (getErr || !userRecord?.user) {
      return NextResponse.json({ error: 'Failed to retrieve user record.' }, { status: 404 });
    }

    const meta = userRecord.user.user_metadata || {};
    const updatedMeta = { ...meta };
    delete updatedMeta.resume_eval_count;
    delete updatedMeta.resume_analyses_count;
    delete updatedMeta.resume_usage_count;
    delete updatedMeta.resume_eval_history;

    const { error: updateErr } = await admin.auth.admin.updateUserById(resolvedUserId, {
      user_metadata: updatedMeta,
    });

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 2. Delete audit records from saved_jobs
    const { error: deleteSavedErr } = await admin
      .from('saved_jobs')
      .delete()
      .eq('user_id', resolvedUserId)
      .like('job_id', 'resume_eval_%');

    if (deleteSavedErr) {
      console.warn('Notice deleting from saved_jobs:', deleteSavedErr.message);
    }

    // 3. Delete from resume_usage if exists
    try {
      await admin.from('resume_usage').delete().eq('user_id', resolvedUserId);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Resume evaluation count successfully reset for ${resolvedEmail || resolvedUserId}.`,
      userId: resolvedUserId,
      email: resolvedEmail,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
