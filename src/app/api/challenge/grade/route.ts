import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface GradeRequestBody {
  challengeId?: string;
  challengeTitle?: string;
  problemStatement?: string;
  solutionProposal?: string;
  keyMetrics?: string;
  userRole?: string;
}

interface RubricFeedback {
  overallScore: number;
  productSenseScore: number;
  feasibilityScore: number;
  metricsScore: number;
  userValueScore: number;
  verdictLabel: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  principalAdvice: string;
}

export async function POST(request: Request) {
  try {
    const body: GradeRequestBody = await request.json();
    const {
      challengeId = 'challenge-23',
      challengeTitle = 'Improve onboarding for a music streaming app.',
      problemStatement = '',
      solutionProposal = '',
      keyMetrics = '',
      userRole = 'Product Manager',
    } = body;

    if (!problemStatement.trim() || !solutionProposal.trim() || !keyMetrics.trim()) {
      return NextResponse.json(
        { error: 'All 3 fields (Problem Diagnosis, Proposed Solution, and Key Metrics) are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey });

        const prompt = `You are a Principal Product Manager and VP of Product at a top-tier tech company (ex-Spotify, Stripe, Linear, Netflix) conducting a senior PM bar-raiser assessment.

CHALLENGE CONTEXT:
Challenge Title: "${challengeTitle}"
Problem Scenario: A freemium music streaming app with 2M monthly downloads observes that 30% of new signups drop off before listening to a single track. Analytics indicate users get fatigued during mandatory onboarding genre/artist pickers and permission dialogs.
Objectives:
1. Increase Day-1 first song completion rate from 70% to 85%.
2. Reduce time-to-first-song from 3.2 minutes to under 45 seconds.
3. Maintain Day-7 active listening retention above 42%.
Constraints:
- Cannot require credit card or payment upfront.
- 3-sprint engineering budget across iOS and Android.
- Must preserve user privacy and notification consent rates.

CANDIDATE SUBMISSION (Candidate Role: ${userRole}):
[1. Problem Diagnosis & Friction]:
${problemStatement}

[2. Proposed Solution & UX Architecture]:
${solutionProposal}

[3. Primary Metric & Counter-Metrics (Guardrails)]:
${keyMetrics}

EVALUATION RUBRIC:
Evaluate the candidate's actual submission with authentic, rigorous PM depth across 4 dimensions (0.0 to 10.0, with 1 decimal precision):
1. productSenseScore (30% weight): Did they diagnose root-cause cognitive fatigue (auditory intent vs administrative setup, choice overload) rather than superficial symptom fixing?
2. feasibilityScore (25% weight): Is this realistic for a 3-sprint build across iOS & Android? Is it scoped pragmatically without bloated AI/backend dependencies?
3. metricsScore (25% weight): Is the primary North Star / input metric tight? Are critical counter-metrics / guardrails (skip rate, churn, notification opt-in, retention) defined?
4. userValueScore (20% weight): Does this deliver immediate customer delight ("aha moment" within seconds)?

Compute overallScore as an integer between 35 and 98:
overallScore = Math.round((productSenseScore * 3.0) + (feasibilityScore * 2.5) + (metricsScore * 2.5) + (userValueScore * 2.0))
(Reserve 90+ only for thorough, high-caliber submissions with clear guardrails and UX clarity).

Determine verdictLabel:
- 90 - 100: "Principal / Bar-Raiser Level"
- 80 - 89: "Strong Senior PM Candidate"
- 70 - 79: "Solid Mid-Level PM Execution"
- 55 - 69: "Promising with Key Strategic Gaps"
- < 55: "Needs Fundamental Rework"

OUTPUT FORMAT:
Return a JSON object only with exactly these keys:
{
  "overallScore": number (integer 35-98),
  "productSenseScore": number (0.0 - 10.0),
  "feasibilityScore": number (0.0 - 10.0),
  "metricsScore": number (0.0 - 10.0),
  "userValueScore": number (0.0 - 10.0),
  "verdictLabel": string,
  "summary": string (2-3 sentences providing an executive summary analyzing their specific proposal thesis, strengths, and vulnerabilities),
  "strengths": string[] (array of 2 to 3 specific bullet points praising specific ideas or mechanisms in their submission),
  "improvements": string[] (array of 2 to 3 actionable, specific PM critique points citing concrete solutions, edge cases, or guardrails they missed),
  "principalAdvice": string (1-2 sentences of senior product leadership wisdom on how to elevate or pitch this proposal)
}`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.6,
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        const parsed: RubricFeedback = JSON.parse(raw);

        // Sanity validation on parsed scores
        if (
          typeof parsed.overallScore === 'number' &&
          typeof parsed.productSenseScore === 'number' &&
          typeof parsed.feasibilityScore === 'number' &&
          typeof parsed.metricsScore === 'number' &&
          Array.isArray(parsed.strengths) &&
          Array.isArray(parsed.improvements)
        ) {
          return NextResponse.json({
            success: true,
            data: {
              ...parsed,
              userValueScore: parsed.userValueScore || Math.round(parsed.overallScore / 10),
            },
            source: 'openai-gpt-4o-mini',
          });
        }
      } catch (err: any) {
        console.warn('OpenAI evaluation failed, falling back to heuristic engine:', err?.message);
      }
    }

    // Heuristic PM Evaluation Engine (Robust offline & fallback grading)
    const fallbackFeedback = evaluateHeuristically(problemStatement, solutionProposal, keyMetrics);

    return NextResponse.json({
      success: true,
      data: fallbackFeedback,
      source: 'pm-heuristic-rubric',
    });
  } catch (error: any) {
    console.error('Error in challenge grading API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate challenge submission' },
      { status: 500 }
    );
  }
}

/**
 * Intelligent PM heuristic rubric analysis engine.
 * Computes scores and tailored qualitative feedback based on submission depth,
 * terminology, guardrail coverage, and PM principles.
 */
function evaluateHeuristically(
  problem: string,
  solution: string,
  metrics: string
): RubricFeedback {
  const pLower = problem.toLowerCase();
  const sLower = solution.toLowerCase();
  const mLower = metrics.toLowerCase();

  // 1. Product Sense scoring (0-10)
  let pScore = 7.0;
  if (pLower.length > 80) pScore += 0.6;
  if (pLower.length > 180) pScore += 0.5;
  if (pLower.includes('cognitive') || pLower.includes('fatigue') || pLower.includes('overload')) pScore += 0.5;
  if (pLower.includes('intent') || pLower.includes('value') || pLower.includes('friction')) pScore += 0.4;
  if (pLower.includes('drop') || pLower.includes('picker') || pLower.includes('permission')) pScore += 0.3;
  pScore = Math.min(9.5, Math.max(5.5, Number(pScore.toFixed(1))));

  // 2. Feasibility scoring (0-10)
  let fScore = 7.2;
  if (sLower.length > 100) fScore += 0.5;
  if (sLower.length > 220) fScore += 0.5;
  if (sLower.includes('sprint') || sLower.includes('mvp') || sLower.includes('phase')) fScore += 0.4;
  if (sLower.includes('defer') || sLower.includes('progressive') || sLower.includes('lazy')) fScore += 0.5;
  if (sLower.includes('default') || sLower.includes('preset') || sLower.includes('instant') || sLower.includes('quick')) fScore += 0.4;
  fScore = Math.min(9.4, Math.max(5.8, Number(fScore.toFixed(1))));

  // 3. Metrics scoring (0-10)
  let mScore = 6.8;
  if (mLower.includes('first-song') || mLower.includes('completion') || mLower.includes('d1')) mScore += 0.7;
  if (mLower.includes('time to') || mLower.includes('seconds') || mLower.includes('latency')) mScore += 0.5;
  if (mLower.includes('guardrail') || mLower.includes('counter') || mLower.includes('skip') || mLower.includes('churn') || mLower.includes('retention') || mLower.includes('d7')) mScore += 0.8;
  if (mLower.includes('opt-in') || mLower.includes('permission') || mLower.includes('bounce') || mLower.includes('uninstall')) mScore += 0.4;
  mScore = Math.min(9.6, Math.max(5.0, Number(mScore.toFixed(1))));

  // 4. User Value scoring (0-10)
  let uScore = 7.2;
  if (sLower.includes('play') || sLower.includes('music') || sLower.includes('stream') || sLower.includes('listen')) uScore += 0.6;
  if (sLower.includes('taste') || sLower.includes('vibe') || sLower.includes('mood') || sLower.includes('genre') || sLower.includes('recommend')) uScore += 0.5;
  if (sLower.includes('one-tap') || sLower.includes('1-tap') || sLower.includes('seamless') || sLower.includes('frictionless')) uScore += 0.5;
  uScore = Math.min(9.5, Math.max(5.5, Number(uScore.toFixed(1))));

  // Weighted Overall Score (30% PS, 25% Feas, 25% Metrics, 20% UV)
  const weighted = pScore * 3.0 + fScore * 2.5 + mScore * 2.5 + uScore * 2.0;
  const overallScore = Math.round(Math.min(96, Math.max(52, weighted)));

  // Verdict label
  let verdictLabel = 'Solid Mid-Level PM Execution';
  if (overallScore >= 90) verdictLabel = 'Principal / Bar-Raiser Level';
  else if (overallScore >= 82) verdictLabel = 'Strong Senior PM Candidate';
  else if (overallScore >= 72) verdictLabel = 'Solid Mid-Level PM Execution';
  else if (overallScore >= 60) verdictLabel = 'Promising with Key Strategic Gaps';
  else verdictLabel = 'Needs Fundamental Rework';

  // Qualitative Feedback Generation
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (pLower.includes('fatigue') || pLower.includes('overload') || pLower.includes('friction') || pLower.includes('intent')) {
    strengths.push('Pinpointed root-cause psychological friction: users seek immediate auditory stimulation rather than administrative profile setup.');
  } else {
    strengths.push('Identified the onboarding conversion drop-off bottleneck before initial track playback.');
  }

  if (sLower.includes('defer') || sLower.includes('progressive') || sLower.includes('lazy') || sLower.includes('instant') || sLower.includes('default')) {
    strengths.push('Strong UX sequencing: shifts heavy personalization from pre-playback to an in-stream progressive experience.');
  } else {
    strengths.push('Proposed a streamlined, simplified onboarding funnel reducing upfront hurdles for new signups.');
  }

  if (mLower.includes('skip') || mLower.includes('guardrail') || mLower.includes('churn') || mLower.includes('retention')) {
    strengths.push('Thoughtful guardrail awareness: included downstream retention or skip counter-metrics to avoid premature optimization.');
  } else {
    improvements.push('Define explicit guardrail counter-metrics (e.g. Song Skip Rate within first 30 seconds, Day-7 retention) to prevent low-intent false activations.');
  }

  if (!sLower.includes('permission') && !pLower.includes('permission')) {
    improvements.push('Address the mandatory OS permissions (push notifications, tracking) dilemma with pre-permission contextual rationale cards rather than skipping them entirely.');
  } else {
    improvements.push('Specify how cold-start genre defaults will be sampled (e.g. localized geo-charts vs time-of-day contextual presets) within the 3-sprint constraint.');
  }

  if (sLower.length < 150) {
    improvements.push('Deepen the wireframe-level UX flow details: describe screen-by-screen state transitions from App Launch → Song 1 Playback.');
  }

  const summary = `Outcome-driven proposal that directly addresses the 30% first-song drop-off. By prioritizing immediate auditory gratification, your approach compresses time-to-first-song while maintaining engineering feasibility.`;

  const principalAdvice = `In an executive review, always pair this solution with an A/B rollout plan: run a 50/50 test measuring Day-1 First Song Completion against Day-7 Listening Retention to prove long-term cohort health.`;

  return {
    overallScore,
    productSenseScore: pScore,
    feasibilityScore: fScore,
    metricsScore: mScore,
    userValueScore: uScore,
    verdictLabel,
    summary,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    principalAdvice,
  };
}
