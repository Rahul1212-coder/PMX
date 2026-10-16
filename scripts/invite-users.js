/**
 * Script to batch invite users to PMVerse via Supabase Auth Admin API
 *
 * Usage:
 *   node scripts/invite-users.js [SUPABASE_SERVICE_ROLE_KEY]
 */

const { createClient } = require('@supabase/supabase-js');
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

const rawEmails = [
  'manasp1609@gmail.com',
  'adityadivyadarshi3@gmail.com',
  'skmeena.webmail@gmail.com',
  'mihirg929@gmail.com',
  'adyashapadhi16@gmail.com',
  'vidurmehta7@gmail.com',
  'ghratikagupta@gmail.com',
  'ishitaad31@gmail.com',
  'sourabhcallsu@gmail.com',
  'mudit131201@gmail.com',
  'mridulabr8@gmail.com',
  'riasahay@gmail.com',
  'saiprem945@gmail.com',
  'shreetejkumardas542@gmail.com',
  'szutung@starknet.org',
  'kartik.jain0809@gmail.com',
  'khyati.vt10@gmail.com',
  'srikanthiiit565@gmail.com',
  'yimanihimabindu@gmail.com',
  'yashrana9871@gmail.com',
  'oladejodimeji@gmail.com',
  'adityatiwari0808@gmail.com',
  'divyank199602@gmail.com',
  'asundani@uci.edu',
  'neemu128@gmail.com',
  'ppriya123ster@gmail.com',
  'Nadakattishristi02@gmail.com',
  'lekamgetharisha@gmail.com',
  'shaillysharma073@gmail.com',
  'maharuchi@gmail.com',
  'adegokemary.amo@gmail.com',
  'meenakshee.behera@gmail.com',
  'alexandramakarenko1912@gmail.com',
  'caarlosramos95@gmail.com',
  'Jenise-davidson@hotmail.co.uk',
  'eshakumar.98@gmail.com',
  'prathamsharmaduke@gmail.com',
  'jayashree.sadayamuthu@gmail.com',
  'saumikm51@gmail.com',
  'dhruv.c157@gmail.com',
  'sonawanejayesh11.js@gmail.com',
  'dhruvjain376@gmail.com',
  '11.nilaypandya@gmail.com',
  'siddharthgautam1981@gmail.com',
  'me23bt033@iitdh.ac.in',
  'kwentuaemeka@gmail.com',
  'Jenanwong@gmail.com',
  'kalyanideoree@gmail.com',
  'anurag.tripathiur@gmail.com',
  'sanway842961@gmail.com',
  'akshita.choubey27@gmail.com',
  'sujitha9595@gmail.com',
  'abhiskul00@gmail.com',
  'anushreemisra@gmail.com',
  'nitipuri4@gmail.com',
  'tusharsingh.contact@gmail.com',
  'stephanie.baaklini.sb@gmail.com',
  'nishigoyalp@gmail.com',
  'ashinjs9@gmail.com',
  'mariasofiaestevez@gmail.com',
  'dangnguyenanhtin2@gmail.com',
  'pathuriniharikad@gmail.com',
  'luizachristtal@gmail.com',
  'akashdlearns@gmail.com',
  'jhalak0904@gmail.com',
  'shiva.kondala@gmail.com',
  'shashank2k12.sharma@gmail.com',
  'udayaditya1998@gmail.com',
  'vdivyadarshan1@gmail.com',
  'anmol.kumar4803@gmail.com',
  'ericamettaz@gmail.com',
  'abhilash.dubbaka@gmail.com',
  'albinagareeva0223@gmail.com',
  'saintvictor16@gmail.com',
  'shruti8301@gmail.com',
  'ashleyz.mun@gmail.com',
  'bopokuamankwaah@gmail.com',
  'rajarameshp@gmail.com',
  'walunjv988@gmail.com',
  'ankitmohapatra2017@gmail.com',
  'manishkatta1696@gmail.com',
  'harshiniuni2502@gmail.com',
  'aryangrover301@gmail.com',
  'emmpascual@gmail.com',
  'mb.mahika@gmail.com',
  'varsha.shashidhar2023@gmail.com',
  'arghawan.bani@gmail.com',
  'mousam793wadhwa@gmail.com',
  'mennaahmad711@gmail.com',
  'mepallavi17@gmail.com',
  'pragyabhardwaj96@gmail.com',
  'mohikathampi99@gmail.com',
  'apcc9215@gmail.com',
  'pavankumar2524@gmail.com',
  'prakashdas18@gmail.com',
  'Isabelbolger@hotmail.com',
  'charleslobsangcudjoe@gmail.com',
  'rdeesha2@gmail.com',
  'Yashchaubal@hotmail.com',
  'rahulchhikara007@gmail.com',
  'anselemoluchukwuolugoh@gmail.com',
  'kiran.mailaddress@gmail.com',
  'thepratham05@gmail.com',
  'mk5090@columbia.edu',
  'iamapurbamondal481999@gmail.com',
  'archanapatwari11@gmail.com',
  'kataldinesh.work@gmail.com',
  'rajkumar.adhityan258@gmail.com',
  'aprabhu911@gmail.com',
  'aryanvaish221@gmail.com',
  'oliver.tuley@gmail.com',
  'sharma.amrita15416736@gmail.com',
  'purugoyal96@gmail.com',
  'tiwarishabh887@gmail.com',
  'chaubeyharshit871@gmail.com',
  'poojagujarathi29@gmail.com',
  'harshini.cand@gmail.com',
  'satya.nitjsr06@gmail.com',
  'vishalghuge26@gmail.com',
  'batuboviolet@gmail.com',
  'jessica.sotelo253@gmail.com',
  'iamvyshnavimenond@gmail.com',
  'krishnaaleti5@gmail.com', // fixed .con to .com
  'damilolaadedunye@gmail.com',
  'sophiaabuladze@gmail.com',
  'garvit.sukh@gmail.com',
  'pragyashriivastava@gmail.com',
  'ellemiekwintjes@gmail.com',
  'manuelatigrer@gmail.com',
  'sreepradha00@gmail.com',
  'pvreddy.0008@gmail.com',
  'kk9718894478@gmail.com',
  'Ashishy836@gmail.com',
  'anishbrane@gmail.com',
  'gskarthika.mails@gmail.com',
  'valeriaasandi@gmail.com',
  'pratikshalall2015@gmail.com',
  'tanmay.ks876@gmail.com',
  'viroin07@gmail.com',
  'swaps_sdmp@yahoo.com',
  'lavysharma007@gmail.com',
  'arunkmishra.lko@gmail.com',
  'ivanawij4y4@gmail.com',
  'usbpass199@gmail.com',
  'Pratikshajain30y@gmail.com',
  'chaitra.pai@gmail.com',
  'harrykey1210@hotmail.com',
  'shradha.raj.krish@gmail.com',
  'osunkoyairetomiwa@gmail.com',
  'sarthakagar8@gmail.com',
  'essential.ytsumityadav@gmail.com',
  'vishalgupta4745@gmail.com',
  'jla0188@bu.edu',
  'indarapusahithi@gmail.com',
  'amanjauhri97@gmail.com',
  'kmgokul49@gmail.com',
  'rabiya1828@gmail.com',
  'silunilesh@gmail.com',
  'mutaliksam@gmail.com',
  'flo.eynon@gmail.com',
  'anjali.a0915@gmail.com',
  'divyanalam37@gmail.com',
  'anubhavmorenitc@gmail.com',
  'godswilluwem06@gmail.com',
  'pradeep.ram85@gmail.com',
  'olumidealade93@yahoo.com',
  'Vishalrajauriya2013@gmail.com',
  'amishapatil141@gmail.com',
  'mb67698@gmail.com',
  'apurva.kore.45@gmail.com',
  'cjstanenemuo@gmail.com',
  'nelsonpimentamonteiro@gmail.com',
  'Amulyamishra878@gmail.com',
  'zaaz41@gmail.com',
  'archanatakade310@gmail.com',
  'lupimentel.cop@gmail.com',
  'suhaspattil@gmail.com',
  'jaganvijay25@gmail.com',
  'ys62168@gmail.com',
  'nishierbaobao@gmail.com',
  'kritikapatil@gmail.com',
  'richashree3108@gmail.com',
  'rahultulli04@gmail.com',
  'tandonsurabhi1806@gmail.com',
  'cpskanth@gmail.com',
  'vinaysangani12@gmail.com',
  'bhaumikdoshi92@gmail.com',
  'vanshikathakkar2002@gmail.com',
  'rishabkishor@gmail.com',
  'irissoj@gmail.com',
  'shreyanov20@gmail.com',
  'prafullakumar011@gmail.com',
  'kongzihsin@gmail.com',
];

// Clean and deduplicate
const emails = [...new Set(rawEmails.map((e) => e.trim().toLowerCase()))].filter(Boolean);

if (!serviceKey) {
  console.error('\n❌ Error: SUPABASE_SERVICE_ROLE_KEY is required to send user invitations.');
  console.error('\nHow to run:');
  console.error('  node scripts/invite-users.js <YOUR_SUPABASE_SERVICE_ROLE_KEY>');
  console.error('\nOr add it to .env.local:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJh...\n');
  process.exit(1);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendInvitations() {
  console.log(`\n======================================================`);
  console.log(`🚀 PMVerse Supabase User Invitation Dispatcher`);
  console.log(`Target Supabase URL: ${supabaseUrl}`);
  console.log(`Total Recipients: ${emails.length} unique emails`);
  console.log(`======================================================\n`);

  const results = {
    sent: [],
    alreadyExists: [],
    failed: [],
    rateLimited: [],
  };

  const PRODUCTION_SITE_URL = 'https://pmverse.in';

  console.log('🔍 Checking currently registered & invited accounts in Supabase to skip duplicates...');
  const existingEmails = new Set();
  try {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=1000`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      });
      const usersData = await usersRes.json();
      const usersList = usersData.users || [];
      usersList.forEach((u) => {
        if (u.email) existingEmails.add(u.email.toLowerCase().trim());
      });
      if (usersList.length < 1000) hasMore = false;
      else page++;
    }
    console.log(`✔ Found ${existingEmails.size} existing/already-invited accounts in Supabase Auth.`);
  } catch (err) {
    console.warn('Notice: Could not pre-fetch existing users, proceeding with direct check:', err.message);
  }

  const pendingEmails = emails.filter((e) => !existingEmails.has(e.toLowerCase()));
  const alreadyProcessed = emails.filter((e) => existingEmails.has(e.toLowerCase()));
  console.log(`✔ Already Invited/Registered: ${alreadyProcessed.length}`);
  console.log(`⏳ Remaining Unsent to Invite: ${pendingEmails.length}\n`);

  for (let i = 0; i < pendingEmails.length; i++) {
    const email = pendingEmails[i];
    const indexStr = `[${i + 1}/${pendingEmails.length}]`;

    try {
      const inviteUrl = `${supabaseUrl}/auth/v1/invite?redirect_to=${encodeURIComponent(PRODUCTION_SITE_URL)}`;
      const res = await fetch(inviteUrl, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          data: {
            role: 'Product Manager',
            pm_stage: 'existing_pm',
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = (data.msg || data.message || data.error_description || JSON.stringify(data)).toLowerCase();
        if (msg.includes('already exists') || msg.includes('already registered')) {
          console.log(`${indexStr} ℹ️ Already registered: ${email}`);
          results.alreadyExists.push({ email, error: data.msg || data.message });
        } else if (msg.includes('rate limit') || res.status === 429) {
          console.warn(`${indexStr} ⚠️ Rate limited on ${email}: ${data.msg || data.message}`);
          results.rateLimited.push({ email, error: data.msg || data.message });
          console.error(
            '\n⚠️ Supabase email rate limit reached! Supabase free default email allows ~3-4 emails/hour.'
          );
          console.error(
            '👉 To send all remaining invites immediately, configure custom SMTP in Supabase Dashboard -> Authentication -> SMTP Settings (e.g. Resend, SendGrid, Brevo, AWS SES).\n'
          );
          break;
        } else {
          console.error(`${indexStr} ❌ Failed ${email}:`, data.msg || data.message || res.statusText);
          results.failed.push({ email, error: data.msg || data.message });
        }
      } else {
        console.log(`${indexStr} ✅ Invited: ${email} (User ID: ${data?.id})`);
        results.sent.push({ email, userId: data?.id });
      }
    } catch (err) {
      console.error(`${indexStr} ❌ Exception on ${email}:`, err.message);
      results.failed.push({ email, error: err.message });
    }

    // Delay between calls to respect rate limits
    await delay(300);
  }

  console.log(`\n======================================================`);
  console.log(`📊 INVITATION SUMMARY REPORT`);
  console.log(`======================================================`);
  console.log(`✅ Successfully Invited: ${results.sent.length}`);
  console.log(`ℹ️ Already Registered:   ${results.alreadyExists.length}`);
  console.log(`❌ Failed:               ${results.failed.length}`);
  if (results.rateLimited.length > 0) {
    console.log(`⚠️ Rate Limited:         ${results.rateLimited.length}`);
    const remaining = emails.slice(
      results.sent.length + results.alreadyExists.length + results.failed.length + results.rateLimited.length
    );
    if (remaining.length > 0) {
      console.log(`⏳ Remaining Unsent:     ${remaining.length}`);
    }
  }
  console.log(`======================================================\n`);
}

sendInvitations();
