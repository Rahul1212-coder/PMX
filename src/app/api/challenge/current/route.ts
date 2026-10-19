import { NextResponse } from 'next/server';
import { getAiClient, getAiModel } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { WeeklyChallenge } from '@/types';

// Cache file path
const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'challenges_cache.json');

// Reference start: Monday Oct 12, 2026 is Challenge #23
const REF_DATE = new Date('2026-10-12T00:00:00.000Z');
const REF_CHALLENGE_NUM = 23;

/**
 * Calculates current week Monday-Sunday boundaries, ISO week identifier, and days remaining.
 */
function getWeekBoundaries(now = new Date()) {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  // ISO Year & Week number
  const target = new Date(monday.valueOf());
  const dayNr = (monday.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = monday.getUTCFullYear();
  const weekIdentifier = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

  // Challenge number incremental based on weeks elapsed since ref date
  const weeksElapsed = Math.floor((monday.getTime() - REF_DATE.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const challengeNumber = Math.max(1, REF_CHALLENGE_NUM + weeksElapsed);

  const daysRemaining = Math.max(1, Math.ceil((sunday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    monday,
    sunday,
    weekIdentifier,
    challengeNumber,
    daysRemaining,
  };
}

/**
 * Read from disk cache safely
 */
function readCache(): Record<string, WeeklyChallenge> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

/**
 * Write to disk cache safely
 */
function writeCache(data: Record<string, WeeklyChallenge>) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write challenges cache:', err);
  }
}

/**
 * High quality curated fallback pool if OpenAI is unreachable or offline
 */
const CURATED_CHALLENGES = [
  {
    title: 'Improve onboarding for a music streaming app.',
    scenario:
      'A freemium music streaming app with 2M monthly downloads observes that 30% of new signups drop off before listening to a single track. Analytics indicate users get fatigued during mandatory onboarding genre/artist pickers and permission dialogs.',
    targetObjectives: [
      'Increase Day-1 first song completion rate from 70% to 85%.',
      'Reduce time-to-first-song from 3.2 minutes to under 45 seconds.',
      'Maintain Day-7 active listening retention above 42%.',
    ],
    constraints: [
      'Cannot require credit card or upfront payment.',
      '3-sprint engineering budget across iOS and Android.',
      'Must preserve user privacy and notification consent rates.',
    ],
    domain: 'Streaming & Consumer Media',
  },
  {
    title: 'Revive Onboarding Engagement in B2B SaaS Collaboration',
    scenario:
      'A workplace team collaboration SaaS observes a 38% drop-off rate during team workspace setup. New invited members abandon before creating their first project board due to cognitive overload and complex role permissions.',
    targetObjectives: [
      'Reduce team workspace abandonment from 38% to under 18%.',
      'Increase Day-1 core action completion (first shared document/board) to 65%.',
      'Achieve 45%+ Week-2 team retention across new signups.',
    ],
    constraints: [
      'Must respect enterprise security SSO and zero-trust permission rules.',
      '4-week cross-functional engineering sprint window.',
      'Zero increase in customer support onboarding ticket volume.',
    ],
    domain: 'B2B SaaS',
  },
  {
    title: 'De-risk 1-Tap Checkout in Quick-Commerce App',
    scenario:
      'A 15-minute grocery delivery app notices that 22% of orders are cancelled or abandoned at the final payment confirmation sheet when substituting out-of-stock inventory in real-time.',
    targetObjectives: [
      'Increase final checkout conversion rate from 78% to 92%.',
      'Cut cart substitution decision latency from 95s to under 20s.',
      'Maintain rider dispatch efficiency within the 15-minute SLA.',
    ],
    constraints: [
      'Cannot hold unconfirmed inventory reservations longer than 60 seconds.',
      'Strict payment gateway fraud compliance (PSD2 / 3DS).',
      'Mobile-first experience on low-bandwidth cellular networks.',
    ],
    domain: 'Quick Commerce & Logistics',
  },
  {
    title: 'Accelerate "Aha Moment" in Generative AI Productivity Tool',
    scenario:
      'A browser-based AI document assistant has high initial signups (100k/mo), but 45% of users generate only one prompt and never return. User interviews reveal prompt blank-slate anxiety.',
    targetObjectives: [
      'Increase 3-prompt activation rate on Day-1 from 28% to 58%.',
      'Reduce time-to-first-successful-output to under 15 seconds.',
      'Lift Day-14 weekly active user (WAU) retention from 18% to 32%.',
    ],
    constraints: [
      'LLM API token costs cannot exceed $0.08 per activated free user.',
      'Must maintain sub-800ms generation response streaming latency.',
      'No intrusive mandatory interactive tutorials or tooltip tours.',
    ],
    domain: 'Generative AI & SaaS',
  },
];

/**
 * Generate a new challenge using OpenAI GPT-4o-mini
 */
async function generateAiChallenge(
  challengeNumber: number,
  weekIdentifier: string,
  startsAt: string,
  endsAt: string,
  requestedDomain?: string
): Promise<WeeklyChallenge> {
  try {
    const aiClient = getAiClient();
    const model = getAiModel('gemini-3.5-flash');
    const prompt = `You are the Head of Product Management Evaluation and Principal PM Coach at Google / Stripe.
Generate a brand-new, realistic, high-standard weekly product management challenge for PMs for week ${weekIdentifier} (Challenge #${challengeNumber}).
Domain focus: ${requestedDomain || 'Pick one: Consumer Tech, Fintech, B2B SaaS, Quick Commerce, Healthtech, or Generative AI'}.

The challenge must test Product Sense, Scoping Feasibility, Metrics & Guardrails, and User Value.
Return a JSON object only with:
- title: concise, punchy challenge title (e.g. "Fix Cart Abandonment on Real-time Inventory Substitutions")
- scenario: 2-3 sentence realistic scenario with concrete quantitative drop-off or friction metrics
- targetObjectives: array of 3 specific quantitative target metrics with numbers
- constraints: array of 3 realistic product, engineering, or business constraints
- domain: string
- rubricWeights: object with productSense: 30, feasibility: 25, metrics: 25, userValue: 20`;

      const completion = await aiClient.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);

      if (parsed.title && parsed.scenario && Array.isArray(parsed.targetObjectives)) {
        return {
          id: `challenge-${weekIdentifier.toLowerCase()}`,
          challengeNumber,
          title: parsed.title,
          scenario: parsed.scenario,
          targetObjectives: parsed.targetObjectives,
          constraints: parsed.constraints || [
            '3-sprint engineering limit.',
            'Cannot require upfront payment.',
            'Preserve compliance and privacy.',
          ],
          rubricWeights: parsed.rubricWeights || {
            productSense: 30,
            feasibility: 25,
            metrics: 25,
            userValue: 20,
          },
          domain: parsed.domain || 'Product Management',
          weekIdentifier,
          startsAt,
          endsAt,
          daysRemaining: 7,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.warn('OpenAI challenge generation failed, using curated rotation:', err?.message);
    }

  // Fallback from curated pool based on challenge number
  const selected = CURATED_CHALLENGES[(challengeNumber - 1) % CURATED_CHALLENGES.length];
  return {
    id: `challenge-${weekIdentifier.toLowerCase()}`,
    challengeNumber,
    title: selected.title,
    scenario: selected.scenario,
    targetObjectives: selected.targetObjectives,
    constraints: selected.constraints,
    rubricWeights: {
      productSense: 30,
      feasibility: 25,
      metrics: 25,
      userValue: 20,
    },
    domain: selected.domain,
    weekIdentifier,
    startsAt,
    endsAt,
    daysRemaining: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * GET /api/challenge/current
 * Returns the current active weekly challenge. Automatically generates and stores a new one if Monday has rolled over.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true' || searchParams.get('regenerate') === 'true';
    const domain = searchParams.get('domain') || undefined;

    const { monday, sunday, weekIdentifier, challengeNumber, daysRemaining } = getWeekBoundaries();
    const startsAt = monday.toISOString();
    const endsAt = sunday.toISOString();

    const cache = readCache();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

    // 1. If not forcing, check Supabase first
    if (!force && supabase) {
      try {
        const { data, error } = await supabase
          .from('weekly_challenges')
          .select('*')
          .eq('week_identifier', weekIdentifier)
          .single();

        if (!error && data) {
          const challenge: WeeklyChallenge = {
            id: data.id,
            challengeNumber: data.challenge_number,
            title: data.title,
            scenario: data.scenario,
            targetObjectives: data.target_objectives || [],
            constraints: data.constraints || [],
            rubricWeights: data.rubric_weights || {
              productSense: 30,
              feasibility: 25,
              metrics: 25,
              userValue: 20,
            },
            domain: data.domain,
            weekIdentifier: data.week_identifier,
            startsAt: data.starts_at,
            endsAt: data.ends_at,
            daysRemaining,
            isActive: data.is_active,
            createdAt: data.created_at,
          };

          // Update local cache
          cache[weekIdentifier] = challenge;
          writeCache(cache);

          return NextResponse.json({ success: true, data: challenge, source: 'supabase' });
        }
      } catch {
        // continue to cache check
      }
    }

    // 2. If not forcing, check disk cache
    if (!force && cache[weekIdentifier]) {
      const cached = { ...cache[weekIdentifier], daysRemaining };
      return NextResponse.json({ success: true, data: cached, source: 'disk-cache' });
    }

    // 3. Generate fresh AI challenge for this week!
    const newChallenge = await generateAiChallenge(
      challengeNumber,
      weekIdentifier,
      startsAt,
      endsAt,
      domain
    );
    newChallenge.daysRemaining = daysRemaining;

    // Save to disk cache
    cache[weekIdentifier] = newChallenge;
    writeCache(cache);

    // Save to Supabase if table exists
    if (supabase) {
      try {
        await supabase.from('weekly_challenges').upsert({
          id: newChallenge.id,
          challenge_number: newChallenge.challengeNumber,
          title: newChallenge.title,
          scenario: newChallenge.scenario,
          target_objectives: newChallenge.targetObjectives,
          constraints: newChallenge.constraints,
          rubric_weights: newChallenge.rubricWeights,
          domain: newChallenge.domain,
          week_identifier: newChallenge.weekIdentifier,
          starts_at: newChallenge.startsAt,
          ends_at: newChallenge.endsAt,
          is_active: newChallenge.isActive,
        });
      } catch (err: any) {
        console.warn('Could not upsert to Supabase weekly_challenges:', err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: newChallenge,
      source: 'ai-generated-monday',
    });
  } catch (error: any) {
    console.error('Error fetching current weekly challenge:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to get current weekly challenge' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenge/current
 * Trigger new challenge generation or force roll-over
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { domain } = body;
    const { monday, sunday, weekIdentifier, challengeNumber, daysRemaining } = getWeekBoundaries();

    const newChallenge = await generateAiChallenge(
      challengeNumber,
      weekIdentifier,
      monday.toISOString(),
      sunday.toISOString(),
      domain
    );
    newChallenge.daysRemaining = daysRemaining;

    // Update cache
    const cache = readCache();
    cache[weekIdentifier] = newChallenge;
    writeCache(cache);

    // Save to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      try {
        await supabase.from('weekly_challenges').upsert({
          id: newChallenge.id,
          challenge_number: newChallenge.challengeNumber,
          title: newChallenge.title,
          scenario: newChallenge.scenario,
          target_objectives: newChallenge.targetObjectives,
          constraints: newChallenge.constraints,
          rubric_weights: newChallenge.rubricWeights,
          domain: newChallenge.domain,
          week_identifier: newChallenge.weekIdentifier,
          starts_at: newChallenge.startsAt,
          ends_at: newChallenge.endsAt,
          is_active: newChallenge.isActive,
        });
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      data: newChallenge,
      message: `Weekly challenge #${challengeNumber} generated successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
