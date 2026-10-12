import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { WeeklyChallenge } from '@/types';

interface GradeRequestBody {
  challengeId?: string;
  challengeTitle?: string;
  challengeScenario?: string;
  targetObjectives?: string[];
  constraints?: string[];
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

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'challenges_cache.json');

function getCachedChallenge(challengeId?: string): WeeklyChallenge | null {
  if (!challengeId) return null;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      const cache: Record<string, WeeklyChallenge> = JSON.parse(raw);
      // Find by id or week identifier
      for (const key of Object.keys(cache)) {
        if (cache[key].id === challengeId || key === challengeId) {
          return cache[key];
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body: GradeRequestBody = await request.json();
    const {
      challengeId = 'challenge-current',
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

    // Resolve challenge details
    const cached = getCachedChallenge(challengeId);
    const challengeTitle = body.challengeTitle || cached?.title || 'Weekly Product Management Challenge';
    const challengeScenario =
      body.challengeScenario ||
      cached?.scenario ||
      'A core user onboarding or conversion friction point is leading to unexpected drop-off. The PM must diagnose root-cause friction, design a pragmatic solution, and establish input & guardrail metrics.';
    const targetObjectives =
      body.targetObjectives ||
      cached?.targetObjectives || [
        'Improve conversion / completion rate by 15-25%.',
        'Accelerate time-to-value for new users.',
        'Protect cohort retention.',
      ];
    const constraints =
      body.constraints ||
      cached?.constraints || [
        '3-sprint engineering budget across platforms.',
        'Zero upfront credit card / payment barrier.',
        'Preserve privacy and compliance standards.',
      ];

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey });

        const prompt = `You are a Principal Product Manager and VP of Product at a top-tier tech company (ex-Google, Stripe, Linear, Netflix) conducting a senior PM bar-raiser assessment.

CHALLENGE CONTEXT:
Challenge Title: "${challengeTitle}"
Scenario: ${challengeScenario}
Objectives:
${targetObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}
Constraints:
${constraints.map((c, i) => `- ${c}`).join('\n')}

CANDIDATE SUBMISSION (Candidate Role: ${userRole}):
[1. Problem Diagnosis & Friction]:
${problemStatement}

[2. Proposed Solution & UX Architecture]:
${solutionProposal}

[3. Primary Metric & Counter-Metrics (Guardrails)]:
${keyMetrics}

EVALUATION RUBRIC:
Evaluate the candidate's actual submission against this specific challenge with authentic, rigorous PM depth across 4 dimensions (0.0 to 10.0, with 1 decimal precision):
1. productSenseScore (30% weight): Did they diagnose root-cause user/business friction rather than jumping to superficial feature bloat? Empathy with user mental state?
2. feasibilityScore (25% weight): Is this realistic for the constraints (engineering sprint limits, scope, complexity)? Pragmatic MVP?
3. metricsScore (25% weight): Is the primary North Star / input metric tight and aligned with objectives? Are critical counter-metrics / guardrails defined?
4. userValueScore (20% weight): Does this deliver immediate customer delight ("aha moment") and sustainable value?

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
  "summary": string (2-3 sentences providing an executive summary analyzing their specific proposal thesis, strengths, and vulnerabilities for this specific challenge),
  "strengths": string[] (array of 2 to 3 specific bullet points quoting/praising specific mechanisms in their submission),
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
    const fallbackFeedback = evaluateHeuristically(
      problemStatement,
      solutionProposal,
      keyMetrics,
      challengeTitle,
      challengeScenario
    );

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
 */
function evaluateHeuristically(
  problem: string,
  solution: string,
  metrics: string,
  title: string,
  scenario: string
): RubricFeedback {
  const pLower = problem.toLowerCase();
  const sLower = solution.toLowerCase();
  const mLower = metrics.toLowerCase();

  // 1. Product Sense scoring (0-10)
  let pScore = 7.0;
  if (pLower.length > 80) pScore += 0.6;
  if (pLower.length > 180) pScore += 0.5;
  if (pLower.includes('friction') || pLower.includes('fatigue') || pLower.includes('intent') || pLower.includes('cognitive')) pScore += 0.5;
  if (pLower.includes('root') || pLower.includes('drop') || pLower.includes('why')) pScore += 0.4;
  pScore = Math.min(9.5, Math.max(5.5, Number(pScore.toFixed(1))));

  // 2. Feasibility scoring (0-10)
  let fScore = 7.2;
  if (sLower.length > 100) fScore += 0.5;
  if (sLower.length > 220) fScore += 0.5;
  if (sLower.includes('sprint') || sLower.includes('mvp') || sLower.includes('phase')) fScore += 0.4;
  if (sLower.includes('progressive') || sLower.includes('default') || sLower.includes('flow')) fScore += 0.4;
  fScore = Math.min(9.4, Math.max(5.8, Number(fScore.toFixed(1))));

  // 3. Metrics scoring (0-10)
  let mScore = 6.8;
  if (mLower.includes('guardrail') || mLower.includes('counter') || mLower.includes('churn') || mLower.includes('retention')) mScore += 0.8;
  if (mLower.includes('rate') || mLower.includes('%') || mLower.includes('conversion') || mLower.includes('completion')) mScore += 0.6;
  mScore = Math.min(9.6, Math.max(5.0, Number(mScore.toFixed(1))));

  // 4. User Value scoring (0-10)
  let uScore = 7.2;
  if (sLower.includes('user') || sLower.includes('delight') || sLower.includes('value') || sLower.includes('time')) uScore += 0.6;
  if (sLower.includes('simple') || sLower.includes('clear') || sLower.includes('seamless')) uScore += 0.5;
  uScore = Math.min(9.5, Math.max(5.5, Number(uScore.toFixed(1))));

  // Weighted Overall Score
  const weighted = pScore * 3.0 + fScore * 2.5 + mScore * 2.5 + uScore * 2.0;
  const overallScore = Math.round(Math.min(96, Math.max(52, weighted)));

  let verdictLabel = 'Solid Mid-Level PM Execution';
  if (overallScore >= 90) verdictLabel = 'Principal / Bar-Raiser Level';
  else if (overallScore >= 82) verdictLabel = 'Strong Senior PM Candidate';
  else if (overallScore >= 72) verdictLabel = 'Solid Mid-Level PM Execution';
  else if (overallScore >= 60) verdictLabel = 'Promising with Key Strategic Gaps';
  else verdictLabel = 'Needs Fundamental Rework';

  const strengths: string[] = [
    `Strong alignment with the core challenge: targets root causes in "${title}".`,
    'Logical step-by-step UX architecture that minimizes upfront interaction cost.',
  ];
  if (mLower.includes('guardrail') || mLower.includes('churn') || mLower.includes('retention')) {
    strengths.push('Defined clear counter-metrics / guardrails to guard against false-positive activation.');
  }

  const improvements: string[] = [];
  if (!mLower.includes('guardrail')) {
    improvements.push('Establish explicit guardrail counter-metrics (e.g. churn rate, drop-off, or task failure) to measure health.');
  }
  if (sLower.length < 160) {
    improvements.push('Deepen the wireframe-level UX flow details: describe screen-by-screen state transitions.');
  }
  improvements.push('Outline a phased A/B rollout plan (e.g. 10% canary cohort) to de-risk production release.');

  const summary = `Structured, outcome-focused approach addressing the core friction in "${title}". The proposal balances delivery feasibility with tangible customer value.`;

  const principalAdvice = `In an executive review, always pair this solution with an explicit cohort retention curve to prove downstream business impact.`;

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
