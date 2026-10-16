import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || (!serviceKey && !anonKey)) return null;

  return createClient(url, serviceKey || anonKey!, {
    auth: { persistSession: false },
  });
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

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client unavailable' }, { status: 500 });
    }

    // Admin Action: sync all users from auth.users into public.profiles
    if (action === 'sync_all') {
      const authHeader = request.headers.get('authorization') || '';
      const providedKey = authHeader.replace(/^Bearer\s+/i, '').trim();
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!serviceRoleKey && !providedKey) {
        return NextResponse.json(
          { error: 'Service role key required to sync all profiles across auth.users.' },
          { status: 401 }
        );
      }

      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey || providedKey,
        { auth: { persistSession: false } }
      );

      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 100,
      });

      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const users = usersData?.users || [];
      const updatedProfiles: any[] = [];

      for (const u of users) {
        const meta = u.user_metadata || {};
        const metaName = (meta.full_name || meta.name || u.email?.split('@')[0] || '').trim();
        const metaRole = (meta.role || '').trim();
        const metaCompany = (meta.company || '').trim();
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

        const { error: upsertError } = await adminClient
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

    const cleanRecord = {
      id: userId,
      email: email || '',
      full_name: (fullName || email?.split('@')[0] || '').trim(),
      role: (role || '').trim(),
      company: (company || '').trim(),
      pm_stage: pmStage || null,
      previous_role: previousRole || null,
      years_of_experience: typeof yearsOfExperience === 'number' ? yearsOfExperience : null,
      avatar_url: '', // strip fake unsplash
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(cleanRecord, { onConflict: 'id' });

    if (error) {
      console.warn('Profile sync notice:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, profile: cleanRecord });
  } catch (err: any) {
    console.error('profile-sync error:', err);
    return NextResponse.json({ error: err?.message || 'Sync error' }, { status: 500 });
  }
}
