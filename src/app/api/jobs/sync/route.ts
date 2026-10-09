import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  domain: string;
  salaryRange: string;
  description: string;
  skills: string[];
  applyUrl: string;
  source: string;
  featured?: boolean;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function isPmRole(title: string): boolean {
  const t = title.toLowerCase();
  return (
    (t.includes('product') && (t.includes('manager') || t.includes('owner') || t.includes('lead') || t.includes('director') || t.includes('head') || t.includes('vp') || t.includes('designer') === false)) ||
    t.includes('technical pm') ||
    t.includes('apm ') ||
    t.startsWith('apm') ||
    t.includes('group pm')
  );
}

function inferLevel(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('director') || t.includes('vp') || t.includes('head of')) {
    return 'Director / VP';
  }
  if (t.includes('senior') || t.includes('lead') || t.includes('staff') || t.includes('principal') || t.includes('sr.')) {
    return 'Senior PM';
  }
  if (t.includes('associate') || t.includes('junior') || t.includes('apm') || t.includes('intern')) {
    return 'Associate PM';
  }
  return 'Product Manager';
}

function inferDomain(title: string, desc: string, tags: string[] = []): string {
  const combined = (title + ' ' + desc + ' ' + tags.join(' ')).toLowerCase();
  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('llm') || combined.includes('agent')) {
    return 'AI & ML';
  }
  if (combined.includes('fintech') || combined.includes('payment') || combined.includes('banking') || combined.includes('crypto')) {
    return 'Fintech';
  }
  if (combined.includes('health') || combined.includes('med') || combined.includes('care')) {
    return 'HealthTech';
  }
  if (combined.includes('ecommerce') || combined.includes('commerce') || combined.includes('marketplace') || combined.includes('retail')) {
    return 'E-commerce';
  }
  if (combined.includes('growth') || combined.includes('plg') || combined.includes('acquisition')) {
    return 'Growth';
  }
  return 'B2B SaaS';
}

function inferSkills(domain: string, level: string): string[] {
  const base = ['Product Strategy', 'Roadmapping'];
  if (domain === 'AI & ML') base.push('AI Product Design', 'Model Evaluation');
  else if (domain === 'Fintech') base.push('Payments Infrastructure', 'Regulatory Compliance');
  else if (domain === 'Growth') base.push('A/B Testing', 'Funnel Optimization');
  else base.push('Metrics & Analytics', 'Discovery');

  if (level === 'Director / VP') base.push('Org Leadership', 'Portfolio Strategy');
  return base.slice(0, 4);
}

export async function GET(req: Request) {
  return handleSync(req);
}

export async function POST(req: Request) {
  return handleSync(req);
}

async function handleSync(req: Request) {
  const collectedJobs: RawJob[] = [];

  // 1. Fetch from Arbeitnow API
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'User-Agent': 'PMVerse-JobSync/1.0' },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        for (const item of data.data) {
          if (isPmRole(item.title || '')) {
            const desc = stripHtml(item.description || '');
            const domain = inferDomain(item.title, desc, item.tags || []);
            const level = inferLevel(item.title);
            collectedJobs.push({
              id: `an-${item.slug || Math.random().toString(36).slice(2, 9)}`,
              title: item.title,
              company: item.company_name || 'Tech Company',
              location: item.location || (item.remote ? 'Remote' : 'Global'),
              type: item.remote ? 'Remote' : 'Hybrid',
              level,
              domain,
              salaryRange: level === 'Director / VP' ? '$190k–$250k' : level === 'Senior PM' ? '$150k–$190k' : '$110k–$145k',
              description: desc || 'Product management opportunity with cross-functional team leadership and customer roadmap delivery.',
              skills: inferSkills(domain, level),
              applyUrl: item.url || '#',
              source: 'Arbeitnow',
              featured: false,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching from Arbeitnow:', err);
  }

  // 2. Fetch from RemoteOK API
  try {
    const res = await fetch('https://remoteok.com/api?tag=product-manager', {
      headers: { 'User-Agent': 'PMVerse-JobSync/1.0' },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // First element is disclaimer metadata
        const items = data.slice(1);
        for (const item of items) {
          const title = item.position || '';
          if (isPmRole(title)) {
            const desc = stripHtml(item.description || '');
            const domain = inferDomain(title, desc, item.tags || []);
            const level = inferLevel(title);
            const salMin = item.salary_min ? `$${Math.round(item.salary_min / 1000)}k` : null;
            const salMax = item.salary_max ? `$${Math.round(item.salary_max / 1000)}k` : null;
            const salary = salMin && salMax ? `${salMin}–${salMax}` : level === 'Senior PM' ? '$150k–$195k' : '$120k–$160k';

            collectedJobs.push({
              id: `rok-${item.id || item.slug || Math.random().toString(36).slice(2, 9)}`,
              title,
              company: item.company || 'Remote Squad',
              location: item.location || 'Remote (Worldwide)',
              type: 'Remote',
              level,
              domain,
              salaryRange: salary,
              description: desc || 'Remote product management leadership role focusing on user research, roadmapping, and metrics.',
              skills: inferSkills(domain, level),
              applyUrl: item.apply_url || item.url || `https://remoteok.com/l/${item.id}`,
              source: 'RemoteOK',
              featured: false,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching from RemoteOK:', err);
  }

  // 3. Fetch from Jobicy API
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=30&tag=product', {
      headers: { 'User-Agent': 'PMVerse-JobSync/1.0' },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.jobs)) {
        for (const item of data.jobs) {
          const title = item.jobTitle || '';
          if (isPmRole(title)) {
            const desc = stripHtml(item.jobDescription || item.jobExcerpt || '');
            const domain = inferDomain(title, desc, []);
            const level = inferLevel(title);

            collectedJobs.push({
              id: `jby-${item.id || Math.random().toString(36).slice(2, 9)}`,
              title,
              company: item.companyName || 'Product Team',
              location: item.jobGeo || 'Remote',
              type: 'Remote',
              level,
              domain,
              salaryRange: level === 'Director / VP' ? '$185k–$240k' : level === 'Senior PM' ? '$140k–$185k' : '$115k–$150k',
              description: desc || 'Execute product roadmaps, partner with design and engineering to build delightful customer experiences.',
              skills: inferSkills(domain, level),
              applyUrl: item.url || '#',
              source: 'Jobicy',
              featured: false,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching from Jobicy:', err);
  }

  // Deduplicate by normalized Title + Company
  const seen = new Set<string>();
  const uniqueJobs: RawJob[] = [];
  for (const job of collectedJobs) {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }

  // Upsert to Supabase if available
  let syncedToDbCount = 0;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      for (const j of uniqueJobs) {
        const { error } = await supabase.from('job_listings').upsert({
          id: j.id,
          title: j.title,
          company: j.company,
          logo: '💼',
          level: j.level,
          domain: j.domain,
          location: j.location,
          type: j.type,
          salary_range: j.salaryRange,
          description: j.description,
          skills: j.skills,
          apply_url: j.applyUrl,
          featured: false,
          created_at: new Date().toISOString(),
        });
        if (!error) {
          syncedToDbCount++;
        }
      }
    } catch (e) {
      console.warn('Supabase bulk upsert error:', e);
    }
  }

  return NextResponse.json({
    success: true,
    totalFound: uniqueJobs.length,
    syncedToDbCount,
    jobs: uniqueJobs,
    sources: ['Arbeitnow', 'RemoteOK', 'Jobicy'],
    timestamp: new Date().toISOString(),
  });
}
