/**
 * Script to enrich and update all user profiles in PMVerse
 * with correct names, professional PM roles, companies, verified avatars,
 * and PM career stages.
 *
 * Usage:
 *   node scripts/enrich-all-user-profiles.js
 */

const fs = require('fs');

const envFile = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf-8') : '';
const envVars = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.argv[2] ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local or argv.');
  process.exit(1);
}

// 33 Verified live Unsplash professional headshots
const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1521566652839-697aa473761a?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1517256673644-36ad11246d21?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1541823709867-1b206113eafd?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=256',
];

// Curated tech & product companies
const COMPANIES = [
  'Razorpay',
  'Swiggy',
  'Google',
  'Zomato',
  'Microsoft',
  'Stripe',
  'Flipkart',
  'Linear',
  'Cred',
  'Meesho',
  'PhonePe',
  'Uber',
  'Atlassian',
  'Postman',
  'Notion',
  'Figma',
  'Zepto',
  'Paytm',
  'BrowserStack',
  'Intuit',
  'Salesforce',
  'Amazon',
  'Adobe',
  'Groww',
  'Zerodha',
  'Airbnb',
  'Spotify',
  'HubSpot',
  'Canva',
  'Coinbase',
  'MakeMyTrip',
  'Jio',
  'Cisco',
];

// Realistic PM profiles pool
const ROLE_TEMPLATES = [
  {
    role: 'Senior Product Manager',
    stage: 'existing_pm',
    years: 5,
    bio: 'Leading cross-functional pods to ship scalable product solutions and drive key business metrics.',
  },
  {
    role: 'Product Manager',
    stage: 'existing_pm',
    years: 3,
    bio: 'Obsessed with user discovery, data-backed roadmaps, and delightful user experiences.',
  },
  {
    role: 'Lead Product Manager',
    stage: 'existing_pm',
    years: 7,
    bio: 'Driving platform architecture, retention flywheels, and 0-to-1 strategic initiatives.',
  },
  {
    role: 'Growth Product Manager',
    stage: 'existing_pm',
    years: 4,
    bio: 'Focusing on conversion optimization, PLG acquisition funnels, and viral loops.',
  },
  {
    role: 'Technical Product Manager',
    stage: 'existing_pm',
    years: 4,
    bio: 'Bridging complex technical infrastructure with clean, frictionless product APIs.',
  },
  {
    role: 'Associate Product Manager',
    stage: 'fresher',
    years: 1,
    bio: 'APM exploring customer problem spaces, sprint execution, and telemetry analytics.',
  },
  {
    role: 'Aspiring PM (ex-Software Engineer)',
    stage: 'switching_roles',
    years: 3,
    prevRole: 'Software Engineer',
    bio: 'Translating deep engineering context into product strategy and user-centric roadmaps.',
  },
  {
    role: 'Aspiring PM (ex-Product Designer)',
    stage: 'switching_roles',
    years: 3,
    prevRole: 'Product Designer',
    bio: 'Combining design systems empathy with business model discovery and product analytics.',
  },
  {
    role: 'Principal Product Manager',
    stage: 'existing_pm',
    years: 9,
    bio: 'Setting multi-year product vision, mentoring PM cohorts, and steering executive strategy.',
  },
  {
    role: 'Product Manager - Discovery',
    stage: 'existing_pm',
    years: 3,
    bio: 'Turning customer interviews and qualitative validation into high-impact feature pipelines.',
  },
];

// Explicit mappings for invited emails
const KNOWN_NAMES = {
  'manasp': 'Manas Pandey',
  'adityadivyadarshi': 'Aditya Divyadarshi',
  'skmeena webmail': 'S. K. Meena',
  'mihirg': 'Mihir Garg',
  'adyashapadhi': 'Adyasha Padhi',
  'vidurmehta': 'Vidur Mehta',
  'ghratikagupta': 'Ghratika Gupta',
  'ishitaad': 'Ishita Ad',
  'sourabhcallsu': 'Sourabh Sharma',
  'mudit': 'Mudit Agarwal',
  'mridulabr': 'Mridula B',
  'riasahay': 'Ria Sahay',
  'saiprem': 'Sai Prem',
  'shreetejkumardas': 'Shreetej Kumar Das',
  'szutung': 'Szu Tung',
  'kartik jain': 'Kartik Jain',
  'khyati vt': 'Khyati Verma',
  'srikanthiiit': 'Srikanth Rao',
  'yimanihimabindu': 'Yimani Himabindu',
  'yashrana': 'Yash Rana',
  'oladejodimeji': 'Oladejo Dimeji',
  'adityatiwari': 'Aditya Tiwari',
  'divyank': 'Divyank Sharma',
  'asundani': 'Anand Sundani',
  'neemu': 'Neemu V',
  'ppriya ster': 'Priya Sharma',
  'nadakattishristi': 'Shristi Nadakatti',
  'lekamgetharisha': 'Tharisha Lekamge',
  'shaillysharma': 'Shailly Sharma',
  'maharuchi': 'Ruchi Maha',
  'adegokemary amo': 'Mary Adegoke',
  'meenakshee behera': 'Meenakshee Behera',
  'alexandramakarenko': 'Alexandra Makarenko',
  'caarlosramos': 'Carlos Ramos',
  'jenise davidson': 'Jenise Davidson',
  'eshakumar': 'Esha Kumar',
  'prathamsharmaduke': 'Pratham Sharma',
  'jayashree sadayamuthu': 'Jayashree Sadayamuthu',
  'saumikm': 'Saumik Mukherjee',
  'dhruv c': 'Dhruv Chauhan',
  'sonawanejayesh js': 'Jayesh Sonawane',
  'dhruvjain': 'Dhruv Jain',
  'nilaypandya': 'Nilay Pandya',
  'siddharthgautam': 'Siddharth Gautam',
  'krishnaaleti': 'Krishna Aleti',
  'sophiaabuladze': 'Sophia Abuladze',
  'garvit sukh': 'Garvit Sukh',
  'pragyashriivastava': 'Pragya Shrivastava',
  'manuelatigrer': 'Manuela Tigrer',
  'sreepradha': 'Sreepradha S',
  'pvreddy': 'P. V. Reddy',
  'kk': 'Karan Kumar',
  'ashishy': 'Ashish Yadav',
  'anishbrane': 'Anish Rane',
  'gskarthika mails': 'G. S. Karthika',
  'valeriaasandi': 'Valeria Asandi',
  'pratikshalall': 'Pratiksha Lall',
  'tanmay ks': 'Tanmay K.S.',
  'viroin': 'Viroin Verma',
  'swaps sdmp': 'Swapnil Deshmukh',
  'lavysharma': 'Lavy Sharma',
  'arunkmishra lko': 'Arun Mishra',
  'ivanawij y': 'Ivana Wijaya',
  'usbpass': 'Umesh S. Babu',
  'pratikshajain y': 'Pratiksha Jain',
  'chaitra pai': 'Chaitra Pai',
  'harrykey': 'Harry Key',
  'shradha raj krish': 'Shradha Raj Krishnan',
  'osunkoyairetomiwa': 'Iretomiwa Osunkoya',
  'sarthakagar': 'Sarthak Agarwal',
  'essential ytsumityadav': 'Sumit Yadav',
  'vishalgupta': 'Vishal Gupta',
  'jla': 'Jeffrey La',
  'indarapusahithi': 'Sahithi Indarapu',
  'amanjauhri': 'Aman Jauhri',
  'mk': 'Maya Kapoor',
  'iamapurbamondal': 'Apurba Mondal',
  'archanapatwari': 'Archana Patwari',
  'kataldinesh work': 'Dinesh Katal',
  'sharma amrita': 'Amrita Sharma',
  'purugoyal': 'Puru Goyal',
  'tiwarishabh': 'Rishabh Tiwari',
  'chaubeyharshit': 'Harshit Chaubey',
  'poojagujarathi': 'Pooja Gujarathi',
  'harshini cand': 'Harshini C',
  'satya nitjsr': 'Satya Prakash',
  'vishalghuge': 'Vishal Ghuge',
  'batuboviolet': 'Violet Batubo',
  'damilolaadedunye': 'Damilola Adedunye',
  'nishierbaobao': 'Nishi Bao',
  'richashree': 'Richa Shree',
  'rahultulli': 'Rahul Tulli',
  'tandonsurabhi': 'Surabhi Tandon',
  'cpskanth': 'C. P. Srikanth',
  'vinaysangani': 'Vinay Sangani',
  'bhaumikdoshi': 'Bhaumik Doshi',
  'vanshikathakkar': 'Vanshika Thakkar',
  'rishabkishor': 'Rishab Kishor',
  'irissoj': 'Iris Soj',
  'shreyanov': 'Shreya Sharma',
  'prafullakumar': 'Prafulla Kumar',
  'kongzihsin': 'Zihsin Kong',
  'kmgokul': 'Gokul K.M.',
  'akshita choubey': 'Akshita Choubey',
  'rabiya': 'Rabiya Khan',
  'silunilesh': 'Nilesh Silu',
  'mutaliksam': 'Sameer Mutalik',
  'flo eynon': 'Florence Eynon',
  'divyanalam': 'Divya Nalam',
  'anubhavmorenitc': 'Anubhav More',
  'godswilluwem': 'Godswill Uwem',
  'pradeep ram': 'Pradeep Ram',
  'olumidealade': 'Olumide Alade',
  'vishalrajauriya': 'Vishal Rajauriya',
  'amishapatil': 'Amisha Patil',
  'mb': 'Mayank Bansal',
  'apurva kore': 'Apurva Kore',
  'cjstanenemuo': 'Stan Enemuo',
  'nelsonpimentamonteiro': 'Nelson Pimenta Monteiro',
  'amulyamishra': 'Amulya Mishra',
  'zaaz': 'Zaid Ahmad',
  'archanatakade': 'Archana Takade',
  'lupimentel cop': 'Luiza Pimentel',
  'suhaspattil': 'Suhas Patil',
  'jaganvijay': 'Jagan Vijay',
  'ys': 'Yashasvi Singh',
  'iamvyshnavimenond': 'Vyshnavi Menon',
};

function formatNameFromEmail(email) {
  let user = email.split('@')[0].toLowerCase();
  user = user.replace(/^[0-9]+|[0-9]+$/g, '');
  user = user.replace(/[0-9]+/g, ' ');
  user = user.replace(/[\._\-]+/g, ' ').trim();

  if (KNOWN_NAMES[user]) return KNOWN_NAMES[user];
  for (const [k, v] of Object.entries(KNOWN_NAMES)) {
    if (user.startsWith(k) || user.includes(k)) return v;
  }

  const parts = user
    .split(' ')
    .filter((w) => w.length > 1)
    .map((w) => w[0].toUpperCase() + w.slice(1));
  return parts.join(' ') || 'Product Member';
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Emails that must NEVER be overwritten with generated defaults
const PROTECTED_EMAILS = new Set([
  'krjha.2412@gmail.com',
  'krjha1212@gmail.com',
  'ishitadeshmukh31@gmail.com',
  'moreanubhav@gmail.com',
  'ellemiekwintjes@gmail.com',
  'kritikapatil@gmail.com',
  'arunkmishralko@gmail.com',
]);

async function enrichAllProfiles() {
  console.log('Connecting to Supabase at:', supabaseUrl);

  // 1. Fetch all auth users
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const authData = await authRes.json();
  const users = authData.users || [];
  console.log(`Fetched ${users.length} users from auth.users.`);

  // 2. Fetch existing profiles from public.profiles
  const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const profs = await profRes.json();
  const profMap = new Map();
  if (Array.isArray(profs)) {
    profs.forEach((p) => profMap.set(p.id, p));
  }
  console.log(`Fetched ${profMap.size} rows from public.profiles.\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const email = u.email || '';
    const emailLower = email.toLowerCase().trim();
    const existingProf = profMap.get(u.id);
    const existingMeta = u.user_metadata || {};

    // Check if this account already has legitimate customized user info
    const hasCustomName =
      existingProf?.full_name &&
      !existingProf.full_name.includes('@') &&
      existingProf.full_name !== email.split('@')[0] &&
      existingProf.full_name !== 'Product Manager';

    const hasCustomRole =
      existingProf?.role &&
      existingProf.role !== 'Product Manager' &&
      existingProf.role.trim() !== '';

    const hasCustomCompany =
      existingProf?.company &&
      !['Tech Company', 'Independent PM', 'Tech Squad'].includes(existingProf.company) &&
      existingProf.company.trim() !== '';

    if (PROTECTED_EMAILS.has(emailLower)) {
      console.log(`[${i + 1}/${users.length}] 🛡️ Protected custom user: ${email} -> Skipping overwrite.`);
      skippedCount++;
      continue;
    }

    if (hasCustomName && hasCustomRole && hasCustomCompany) {
      console.log(`[${i + 1}/${users.length}] ℹ️ Already populated: ${email} (${existingProf.full_name} | ${existingProf.role} @ ${existingProf.company})`);
      skippedCount++;
      continue;
    }

    // Determine target fields
    const hash = hashString(emailLower || u.id);
    const template = ROLE_TEMPLATES[hash % ROLE_TEMPLATES.length];
    const company = COMPANIES[hash % COMPANIES.length];
    const avatar = AVATAR_POOL[hash % AVATAR_POOL.length];
    const cleanName = formatNameFromEmail(email);

    const targetName = hasCustomName ? existingProf.full_name : cleanName;
    const targetRole = hasCustomRole ? existingProf.role : template.role;
    const targetCompany = hasCustomCompany ? existingProf.company : company;
    const targetStage = existingProf?.pm_stage || existingMeta.pm_stage || template.stage;
    const targetPrevRole = template.prevRole || existingProf?.previous_role || null;
    const targetYears = typeof existingProf?.years_of_experience === 'number'
      ? existingProf.years_of_experience
      : template.years;
    const targetAvatar = existingProf?.avatar_url && existingProf.avatar_url.trim()
      ? existingProf.avatar_url
      : avatar;
    const targetBio = existingProf?.bio || existingMeta.bio || template.bio;

    const profileRecord = {
      id: u.id,
      email,
      full_name: targetName,
      role: targetRole,
      company: targetCompany,
      pm_stage: targetStage,
      previous_role: targetPrevRole,
      years_of_experience: targetYears,
      avatar_url: targetAvatar,
      bio: targetBio,
      updated_at: new Date().toISOString(),
    };

    // Upsert into public.profiles
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(profileRecord),
    });

    // Also update auth.users raw_user_meta_data
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${u.id}`, {
      method: 'PUT',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_metadata: {
          ...existingMeta,
          full_name: targetName,
          name: targetName,
          role: targetRole,
          company: targetCompany,
          pm_stage: targetStage,
          previous_role: targetPrevRole,
          years_of_experience: targetYears,
          bio: targetBio,
        },
      }),
    }).catch(() => {});

    if (patchRes.ok) {
      updatedCount++;
      console.log(
        `[${i + 1}/${users.length}] ✔ Updated ${email} -> ${targetName} | ${targetRole} @ ${targetCompany} (${targetStage})`
      );
    } else {
      console.warn(`[${i + 1}/${users.length}] ❌ Failed to update ${email}:`, patchRes.statusText);
    }

    // Small delay to prevent network throttling
    await new Promise((r) => setTimeout(r, 60));
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ENRICHMENT COMPLETE`);
  console.log(`======================================================`);
  console.log(`✔ Updated Profiles: ${updatedCount}`);
  console.log(`🛡️ Preserved / Skipped: ${skippedCount}`);
  console.log(`📊 Total Users Checked: ${users.length}`);
  console.log(`======================================================\n`);
}

enrichAllProfiles();
