import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase client unavailable' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: 'Profile sync service is healthy and connected to Supabase.' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      fullName,
      role,
      company,
      pmStage,
      previousRole,
      yearsOfExperience,
      action,
    } = body;

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client unavailable' }, { status: 500 });
    }

    // Admin Action: sync all users from auth.users into public.profiles
    if (action === 'sync_all') {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });

      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const users = usersData?.users || [];
      const updatedProfiles: any[] = [];

      for (const u of users) {
        const meta = u.user_metadata || {};
        const metaName = (meta.full_name || meta.name || u.email?.split('@')[0] || '').trim();
        const rawRole = (meta.role || '').trim();
        const metaRole = rawRole === 'Product Manager' && !meta.role ? '' : rawRole;
        const rawCo = (meta.company || '').trim();
        const metaCompany =
          rawCo === 'Tech Company' || rawCo === 'Independent PM' || rawCo === 'Tech Squad' ? '' : rawCo;
        const metaStage = meta.pm_stage || null;
        const metaPrev = meta.previous_role || null;
        const metaYears = typeof meta.years_of_experience === 'number' ? meta.years_of_experience : null;

        const updateRecord = {
          id: u.id,
          email: u.email || '',
          full_name: metaName,
          role: metaRole,
          company: metaCompany,
          pm_stage: metaStage,
          previous_role: metaPrev,
          years_of_experience: metaYears,
          avatar_url: '', // strip fake unsplash
          updated_at: new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(updateRecord, { onConflict: 'id' });

        if (!upsertError) {
          updatedProfiles.push(updateRecord);
        }
      }

      return NextResponse.json({
        success: true,
        totalUsers: users.length,
        syncedCount: updatedProfiles.length,
        updatedProfiles,
      });
    }

    // Single user signup sync
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const cleanName = (fullName || email?.split('@')[0] || '').trim();
    const cleanRole = (role || '').trim();
    const cleanCompany = (company || '').trim();
    const cleanStage = pmStage || null;
    const cleanPrev = previousRole || null;
    const cleanYears = typeof yearsOfExperience === 'number' ? yearsOfExperience : null;

    const cleanRecord = {
      id: userId,
      email: email || '',
      full_name: cleanName,
      role: cleanRole,
      company: cleanCompany,
      pm_stage: cleanStage,
      previous_role: cleanPrev,
      years_of_experience: cleanYears,
      avatar_url: '',
      updated_at: new Date().toISOString(),
    };

    // 1. Upsert into public.profiles database table
    const { error: dbError } = await supabase.from('profiles').upsert(cleanRecord, { onConflict: 'id' });

    if (dbError) {
      console.warn('Profile DB upsert notice:', dbError.message);
    }

    // 2. Also update auth user metadata via Supabase Admin API
    try {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: cleanName,
          name: cleanName,
          role: cleanRole,
          company: cleanCompany,
          pm_stage: cleanStage,
          previous_role: cleanPrev,
          years_of_experience: cleanYears,
        },
      });
    } catch (authMetaErr: any) {
      console.warn('Auth user_metadata admin update notice:', authMetaErr?.message);
    }

    return NextResponse.json({ success: true, profile: cleanRecord });
  } catch (err: any) {
    console.error('profile-sync error:', err);
    return NextResponse.json({ error: err?.message || 'Sync error' }, { status: 500 });
  }
}
