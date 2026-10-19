/**
 * Script to synchronize all users from auth.users (raw_user_meta_data)
 * directly into public.profiles in Supabase.
 *
 * Usage:
 *   node scripts/sync-user-profiles.js [SUPABASE_SERVICE_ROLE_KEY]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.argv[2] ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('\n❌ Error: SUPABASE_SERVICE_ROLE_KEY is required to update all users in public.profiles.');
  console.error('Usage: node scripts/sync-user-profiles.js <YOUR_SERVICE_ROLE_KEY>\n');
  console.error('Or copy and run this SQL query directly in your Supabase Dashboard SQL Editor:');
  console.log(`
--------------------------------------------------------------------------------
UPDATE public.profiles p
SET
  full_name = COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), NULLIF(u.raw_user_meta_data->>'name', ''), p.full_name),
  role = COALESCE(NULLIF(u.raw_user_meta_data->>'role', ''), p.role),
  company = COALESCE(NULLIF(u.raw_user_meta_data->>'company', ''), p.company),
  pm_stage = COALESCE(NULLIF(u.raw_user_meta_data->>'pm_stage', ''), p.pm_stage),
  previous_role = COALESCE(NULLIF(u.raw_user_meta_data->>'previous_role', ''), p.previous_role),
  avatar_url = CASE
    WHEN p.avatar_url LIKE '%photo-1535713875002%' OR p.avatar_url LIKE '%photo-1534528741775%' THEN ''
    ELSE p.avatar_url
  END,
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id;
--------------------------------------------------------------------------------
`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function syncAll() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  console.log('Fetching users from auth.users...');

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error('Error fetching auth users:', error.message);
    process.exit(1);
  }

  const users = data.users || [];
  console.log(`Found ${users.length} registered users in auth.users.`);

  let updatedCount = 0;
  for (const u of users) {
    const meta = u.user_metadata || {};
    const metaName = (meta.full_name || meta.name || u.email?.split('@')[0] || '').trim();
    const metaRole = (meta.role || '').trim();
    const rawCo = (meta.company || '').trim();
    const metaCompany = rawCo === 'Tech Company' || rawCo === 'Independent PM' || rawCo === 'Tech Squad' ? '' : rawCo;
    const metaStage = meta.pm_stage || null;
    const metaPrev = meta.previous_role || null;
    const metaYears = typeof meta.years_of_experience === 'number' ? meta.years_of_experience : null;

    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
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
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      console.warn(`Failed to update ${u.email}:`, upsertError.message);
    } else {
      updatedCount++;
      console.log(`✔ Synced: ${u.email} -> ${metaName} | ${metaRole} | ${metaCompany}`);
    }
  }

  console.log(`\n🎉 Successfully synced ${updatedCount} / ${users.length} user profiles with their real data!`);
}

syncAll();
