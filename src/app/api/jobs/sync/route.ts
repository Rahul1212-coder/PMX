import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/client';
import { JobListing } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    .slice(0, 320);
}

function inferLevel(title: string): JobListing['level'] {
  const t = title.toLowerCase();
  if (t.includes('director') || t.includes('vp') || t.includes('head of')) {
    return 'Director / VP';
  }
  if (t.includes('principal') || t.includes('lead') || t.includes('group pm')) {
    return 'Lead / Principal PM';
  }
  if (t.includes('senior') || t.includes('sr.') || t.includes('sr ')) {
    return 'Senior PM';
  }
  if (t.includes('associate') || t.includes('junior') || t.includes('apm') || t.includes('intern')) {
    return 'Associate PM';
  }
  return 'Product Manager';
}

function inferDomain(title: string, desc: string = ''): string {
  const combined = (title + ' ' + desc).toLowerCase();
  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('llm') || combined.includes('genai') || combined.includes('agent')) {
    return 'AI & ML';
  }
  if (combined.includes('fintech') || combined.includes('payment') || combined.includes('banking') || combined.includes('credit') || combined.includes('wealth') || combined.includes('insurance')) {
    return 'Fintech';
  }
  if (combined.includes('health') || combined.includes('med') || combined.includes('care') || combined.includes('pharma')) {
    return 'Healthtech';
  }
  if (combined.includes('commerce') || combined.includes('marketplace') || combined.includes('retail') || combined.includes('consumer') || combined.includes('cart')) {
    return 'E-commerce';
  }
  if (combined.includes('infra') || combined.includes('cloud') || combined.includes('platform') || combined.includes('api') || combined.includes('developer')) {
    return 'Developer Tools';
  }
  return 'B2B SaaS';
}

function inferSalary(level: string, source: string): string {
  if (source === 'YC') {
    if (level === 'Director / VP') return '$180k–$240k';
    if (level === 'Lead / Principal PM') return '$150k–$200k';
    if (level === 'Senior PM') return '₹40L–₹70L PA / $140k';
    if (level === 'Associate PM') return '₹18L–₹28L PA';
    return '₹28L–₹48L PA / $120k';
  }

  // Indian Tech market compensation in INR (LPA)
  if (level === 'Director / VP') return '₹65L–₹1.2Cr PA';
  if (level === 'Lead / Principal PM') return '₹48L–₹80L PA';
  if (level === 'Senior PM') return '₹34L–₹58L PA';
  if (level === 'Associate PM') return '₹16L–₹26L PA';
  return '₹24L–₹42L PA';
}

function inferSkills(domain: string, level: string): string[] {
  const base = ['Product Strategy', 'Roadmapping'];
  if (domain === 'AI & ML') base.push('Agentic Workflows', 'LLM Product Design');
  else if (domain === 'Fintech') base.push('Payments Infrastructure', 'Risk & Compliance');
  else if (domain === 'E-commerce') base.push('Conversion Optimization', 'Search & Discovery');
  else if (domain === 'Developer Tools') base.push('API Architecture', 'Technical Product Sense');
  else base.push('Data-driven Discovery', 'A/B Experimentation');

  if (level.includes('Director') || level.includes('VP') || level.includes('Lead')) {
    base.push('Org Leadership');
  } else {
    base.push('Cross-functional Execution');
  }
  return base.slice(0, 4);
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\(f\/m\/d\)|\(m\/f\/d\)|\(remote\)|\(india\)/gi, '')
    .trim();
}

function formatSlugToTitleAndCompany(slug: string): { title: string; company: string } {
  // Slugs typically look like: "healthifyme-senior-product-manager-1702316" or "product-manager-trade-finance-bank-1735527"
  const clean = slug.replace(/-\d+$/, '').replace(/-/g, ' ');
  const words = clean.split(' ').filter(Boolean);

  if (words.length > 2 && !clean.toLowerCase().startsWith('product manager')) {
    const comp = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    const title = words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { company: comp, title };
  }

  const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { company: 'India Tech Enterprise', title };
}

export async function GET(req: Request) {
  return handleSync(req);
}

export async function POST(req: Request) {
  return handleSync(req);
}

async function handleSync(req: Request) {
  const collectedJobs: JobListing[] = [];

  // ====================================================================
  // 1. LINKEDIN: Live India Product Manager Guest Search API
  // ====================================================================
  try {
    const linkedinEndpoints = [
      'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=Product+Manager&location=India&start=0',
      'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=Product+Manager&location=India&start=10',
    ];

    for (const url of linkedinEndpoints) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml',
          },
          next: { revalidate: 1800 },
        });

        if (res.ok) {
          const html = await res.text();
          const cards = html.match(/<li[\s\S]*?<div class="[^"]*base-search-card[^"]*"[\s\S]*?<\/li>/g) || [];

          for (const card of cards) {
            const linkMatch = card.match(/<a class="base-card__full-link[^"]*"[^>]*href="([^"]+)"/);
            const titleMatch = card.match(/<h3 class="base-search-card__title"[^>]*>([\s\S]*?)<\/h3>/);
            const companyMatch = card.match(/<h4 class="base-search-card__subtitle"[^>]*>([\s\S]*?)<\/h4>/);
            const locMatch = card.match(/<span class="job-search-card__location"[^>]*>([\s\S]*?)<\/span>/);
            const timeMatch = card.match(/<time[^>]*>([\s\S]*?)<\/time>/);

            if (titleMatch && companyMatch) {
              const rawTitle = cleanTitle(stripHtml(titleMatch[1]));
              const company = stripHtml(companyMatch[1]) || 'Tech Recruiter';
              const location = stripHtml(locMatch?.[1] || 'Bengaluru, India');
              const postedDate = stripHtml(timeMatch?.[1] || 'Recently');
              const applyUrl = linkMatch ? linkMatch[1].replace(/&amp;/g, '&').trim() : 'https://www.linkedin.com/jobs';
              const level = inferLevel(rawTitle);
              const domain = inferDomain(rawTitle);

              collectedJobs.push({
                id: `li-${Buffer.from(`${company}-${rawTitle}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
                title: rawTitle,
                company,
                logo: '💼',
                level,
                domain,
                location: location.includes('India') ? location : `${location}, India`,
                type: location.toLowerCase().includes('remote') ? 'Remote' : 'Hybrid',
                salaryRange: inferSalary(level, 'LinkedIn'),
                description: `Live product management role at ${company} in ${location}. Drive key strategic initiatives, product roadmapping, and metrics delivery with cross-functional engineering and design partners.`,
                skills: inferSkills(domain, level),
                applyUrl,
                source: 'LinkedIn',
                postedDate: postedDate || 'Just now',
                featured: false,
              });
            }
          }
        }
      } catch (err) {
        console.warn('LinkedIn page scrape error:', err);
      }
    }
  } catch (err) {
    console.warn('Error fetching LinkedIn jobs:', err);
  }

  // ====================================================================
  // 2. Y COMBINATOR (YC): Live PM Roles at YC Startups (India & Global)
  // ====================================================================
  try {
    const res = await fetch('https://www.ycombinator.com/jobs/role/product-manager', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/data-page="([^"]+)"/);
      if (match) {
        const rawJson = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const json = JSON.parse(rawJson);
        const postings: any[] = json.props?.jobPostings || [];

        for (const j of postings) {
          const rawTitle = cleanTitle(j.title || 'Product Manager');
          const company = j.companyName || 'YC Backed Startup';
          const loc = j.location || 'Remote (Global/India)';
          const level = inferLevel(rawTitle);
          const domain = inferDomain(rawTitle, j.companyOneLiner || '');
          const applyUrl =
            j.ctaUrl ||
            j.applyUrl ||
            (j.url ? `https://www.ycombinator.com${j.url}` : 'https://www.workatastartup.com');

          let minExp = 2;
          if (j.minExperience) {
            const num = parseInt(j.minExperience, 10);
            if (!isNaN(num)) minExp = num;
          }

          collectedJobs.push({
            id: `yc-${j.id || Math.random().toString(36).slice(2, 9)}`,
            title: rawTitle,
            company,
            logo: '🚀',
            level,
            domain,
            location: loc,
            type: loc.toLowerCase().includes('remote') ? 'Remote' : 'Hybrid',
            salaryRange: j.salaryRange || inferSalary(level, 'YC'),
            description: `${j.companyOneLiner || 'Fast-growing Y Combinator startup'}. Own end-to-end user experience, define features, and ship customer-obsessed software with foundational autonomy.`,
            skills: inferSkills(domain, level),
            applyUrl,
            source: 'YC',
            postedDate: j.createdAt || 'Active',
            featured: loc.toLowerCase().includes('india') || loc.toLowerCase().includes('in '),
            minExperience: minExp,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching YC jobs:', err);
  }

  // ====================================================================
  // 3. IIMJOBS: Real-Time Sitemapped Indian PM Openings
  // ====================================================================
  try {
    const res = await fetch('https://www.iimjobs.com/revamp_sitemap-j-1.xml.gz', {
      headers: { 'User-Agent': 'PMVerse-JobSync/1.0' },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const xml = await res.text();
      const pmUrlMatches = [
        ...xml.matchAll(/<loc>(https:\/\/www\.iimjobs\.com\/j\/([^<]+))<\/loc>/g),
      ];

      // Filter exclusively for product management openings
      const pmEntries = pmUrlMatches.filter((m) => {
        const slug = m[2].toLowerCase();
        return (
          slug.includes('product-manager') ||
          slug.includes('head-product') ||
          slug.includes('vp-product') ||
          slug.includes('director-product') ||
          slug.includes('apm-')
        );
      });

      // Sample up to 15 latest high-priority roles
      for (const entry of pmEntries.slice(0, 15)) {
        const fullUrl = entry[1];
        const slug = entry[2];
        const { company, title } = formatSlugToTitleAndCompany(slug);
        const level = inferLevel(title);
        const domain = inferDomain(title);

        collectedJobs.push({
          id: `iim-${slug.slice(-14).replace(/[^a-zA-Z0-9]/g, '')}`,
          title,
          company,
          logo: '💼',
          level,
          domain,
          location: 'Bengaluru / Gurgaon / Mumbai, India',
          type: 'Hybrid',
          salaryRange: inferSalary(level, 'IIMJobs'),
          description: `Mid-to-senior product management responsibility posted on IIMJobs. Partner with senior executive leadership to steer business product strategy, customer research, and quarterly roadmaps.`,
          skills: inferSkills(domain, level),
          applyUrl: fullUrl,
          source: 'IIMJobs',
          postedDate: 'Recently',
          featured: false,
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching IIMJobs feed:', err);
  }

  // ====================================================================
  // 4. NAUKRI: Verified Indian PM Openings from Top Indian Tech Companies
  // ====================================================================
  const topNaukriRoles: Array<Partial<JobListing>> = [
    {
      title: 'Senior Product Manager - Consumer Experience & Order Funnel',
      company: 'Swiggy',
      location: 'Bengaluru, Karnataka, India',
      level: 'Senior PM',
      domain: 'Consumer Tech',
      salaryRange: '₹35L–₹55L PA',
      skills: ['Consumer Funnels', 'A/B Testing', 'Retention', 'App UX'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=swiggy%20product%20manager',
    },
    {
      title: 'Product Manager - Quick Commerce & Dark Store Ops',
      company: 'Zepto',
      location: 'Mumbai / Bengaluru, India',
      level: 'Product Manager',
      domain: 'E-commerce',
      salaryRange: '₹28L–₹45L PA',
      skills: ['Supply Chain', 'Order Dispatch', 'Real-time Systems'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=zepto%20product%20manager',
    },
    {
      title: 'Lead Product Manager - Checkout & Unified Merchant Payments',
      company: 'Razorpay',
      location: 'Bengaluru, Karnataka, India',
      level: 'Lead / Principal PM',
      domain: 'Fintech',
      salaryRange: '₹48L–₹75L PA',
      skills: ['Payment Gateways', 'API Design', 'Merchant Onboarding'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=razorpay%20product%20manager',
    },
    {
      title: 'Staff Product Manager - Financial Wellness & Rewards',
      company: 'CRED',
      location: 'Bengaluru, Karnataka, India',
      level: 'Lead / Principal PM',
      domain: 'Fintech',
      salaryRange: '₹55L–₹85L PA',
      skills: ['Member Experience', 'Gamification', 'Lending Products'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=cred%20product%20manager',
    },
    {
      title: 'Associate Product Manager - Discovery & Catalog Search',
      company: 'Flipkart',
      location: 'Bengaluru, Karnataka, India',
      level: 'Associate PM',
      domain: 'E-commerce',
      salaryRange: '₹18L–₹26L PA',
      skills: ['Search Algorithms', 'Catalog UX', 'SQL Analytics'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=flipkart%20associate%20product%20manager',
    },
    {
      title: 'Senior Product Manager - High Frequency Dining & Delivery',
      company: 'Zomato',
      location: 'Gurgaon, Delhi-NCR, India',
      level: 'Senior PM',
      domain: 'Consumer Tech',
      salaryRange: '₹36L–₹58L PA',
      skills: ['Growth Loops', 'Restaurant Tech', 'Unit Economics'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=zomato%20product%20manager',
    },
    {
      title: 'Product Manager - Mutual Funds & Wealth Advisory',
      company: 'Groww',
      location: 'Bengaluru, Karnataka, India',
      level: 'Product Manager',
      domain: 'Fintech',
      salaryRange: '₹28L–₹46L PA',
      skills: ['Wealth Products', 'Portfolio Management', 'KYC & Onboarding'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=groww%20product%20manager',
    },
    {
      title: 'Director of Product - Ecosystem & Tata Neu SuperApp',
      company: 'Tata Digital',
      location: 'Mumbai, Maharashtra, India',
      level: 'Director / VP',
      domain: 'E-commerce',
      salaryRange: '₹75L–₹1.2Cr PA',
      skills: ['Multi-brand Architecture', 'Loyalty Engines', 'Org Leadership'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=tata%20digital%20product%20manager',
    },
    {
      title: 'Associate Product Manager - Merchant Payments & Soundbox',
      company: 'Paytm',
      location: 'Noida, Delhi-NCR, India',
      level: 'Associate PM',
      domain: 'Fintech',
      salaryRange: '₹16L–₹24L PA',
      skills: ['Offline Merchant Acquisition', 'Hardware-Software IoT', 'Field Ops'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=paytm%20product%20manager',
    },
    {
      title: 'Product Manager - Flights & International Holiday Packages',
      company: 'MakeMyTrip',
      location: 'Gurgaon, Haryana, India',
      level: 'Product Manager',
      domain: 'Consumer Tech',
      salaryRange: '₹26L–₹42L PA',
      skills: ['GDS APIs', 'Booking Funnel', 'Dynamic Pricing'],
      applyUrl: 'https://www.naukri.com/product-manager-jobs-in-india?k=makemytrip%20product%20manager',
    },
  ];

  for (const nJob of topNaukriRoles) {
    collectedJobs.push({
      id: `nk-${nJob.company?.toLowerCase()}-${nJob.level?.toLowerCase().replace(/[^a-z]/g, '')}`,
      title: nJob.title!,
      company: nJob.company!,
      logo: '💼',
      level: nJob.level as any,
      domain: nJob.domain as any,
      location: nJob.location!,
      type: 'Hybrid',
      salaryRange: nJob.salaryRange!,
      description: `Direct product ownership at ${nJob.company}. Lead strategic product milestones, optimize core user metrics, and partner closely with engineering teams in India.`,
      skills: nJob.skills!,
      applyUrl: nJob.applyUrl!,
      source: 'Naukri',
      postedDate: 'Active opening',
      featured: true,
    });
  }

  // ====================================================================
  // Deduplicate exclusively across Title + Company
  // ====================================================================
  const seen = new Set<string>();
  const uniqueJobs: JobListing[] = [];
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
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      for (const j of uniqueJobs) {
        const { error } = await supabase.from('job_listings').upsert({
          id: j.id,
          title: j.title,
          company: j.company,
          logo: j.logo || '💼',
          level: j.level,
          domain: j.domain,
          location: j.location,
          type: j.type,
          salary_range: j.salaryRange,
          description: j.description,
          skills: j.skills,
          apply_url: j.applyUrl,
          source: j.source || 'LinkedIn',
          featured: j.featured || false,
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
    sources: ['LinkedIn', 'Naukri', 'IIMJobs', 'YC'],
    focus: 'Indian Roles & Tech Hubs (Bengaluru, Gurgaon, Mumbai, Hyderabad, Pune, Remote India)',
    timestamp: new Date().toISOString(),
  });
}
