import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getOpenAIClient } from '@/lib/openai';
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
  evaluatorModel?: string;
}

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'challenges_cache.json');

function getCachedChallenge(challengeId?: string): WeeklyChallenge | null {
  if (!challengeId) return null;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      const cache: Record<string, WeeklyChallenge> = JSON.parse(raw);
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

function getVerdictLabel(score: number): string {
  if (score >= 90) return 'Principal / Bar-Raiser Level';
  if (score >= 82) return 'Strong Senior PM Candidate';
  if (score >= 70) return 'Solid Mid-Level PM Execution';
  if (score >= 55) return 'Promising with Key Strategic Gaps';
  return 'Needs Fundamental Rework';
}

function isPlaceholderOrGibberish(
  problem: string,
  solution: string,
  metrics: string,
  submissionText?: string
): boolean {
  const combined = [problem, solution, metrics, submissionText || '']
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

  const words = combined.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 10) return true; // Fewer than 10 words total is automatically placeholder / incomplete

  const uniqueWords = new Set(words);
  if (uniqueWords.size < 5) return true; // Repetitive words (e.g. "test test test...")

  const placeholderTokens = new Set([
    'test', 'testing', 'tester', 'tested', 'tests',
    'asdf', 'asdfgh', 'qwerty', 'xyz', 'abc', '123',
    'foo', 'bar', 'baz', 'dummy', 'sample', 'lorem', 'ipsum',
    'none', 'na', 'null', 'nil', 'idk', 'dunno', 'check', 'temp',
    'hello', 'hi', 'hey', 'aaa', 'bbb', 'ccc', 'demo'
  ]);
  const placeholderCount = words.filter((w) => placeholderTokens.has(w)).length;
  if (placeholderCount / words.length >= 0.35) return true;

  const compact = combined.replace(/\s+/g, '');
  if (compact.length < 30) return true;

  return false;
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

    const rawProblem = (problemStatement || '').trim();
    const rawSolution = (solutionProposal || '').trim();
    const rawMetrics = (keyMetrics || '').trim();
    const rawSubmission = ((body as any).submissionText || '').trim();

    if (!rawSubmission && (!rawProblem || !rawSolution || !rawMetrics)) {
      return NextResponse.json(
        { error: 'Please provide either the 3 challenge fields or a proposal text to evaluate.' },
        { status: 400 }
      );
    }

    // 0. Immediate Substance & Placeholder Check (Fails "test test test", "asdf", etc.)
    if (isPlaceholderOrGibberish(rawProblem, rawSolution, rawMetrics, rawSubmission)) {
      const placeholderFeedback: RubricFeedback = {
        overallScore: 12,
        productSenseScore: 1.2,
        feasibilityScore: 1.5,
        metricsScore: 1.0,
        userValueScore: 1.0,
        verdictLabel: 'Needs Fundamental Rework',
        summary:
          'The submission contains only placeholder, repetitive, or test text with no genuine PM problem diagnosis, solution flow, or metrics. Meaningful PM evaluation requires an authentic breakdown.',
        strengths: [],
        improvements: [
          'Diagnose the exact root cause of user friction rather than submitting placeholder text.',
          'Outline a concrete, feasible solution architecture with specific UX steps.',
          'Define both primary success metrics and protective guardrail counter-metrics.',
        ],
        principalAdvice:
          'In an executive product review, placeholder or incomplete responses cannot be evaluated. Draft a structured PM proposal to receive a calibrated scorecard.',
        evaluatorModel: 'AI PM Rubric Validator',
      };

      return NextResponse.json({
        success: true,
        data: placeholderFeedback,
        source: 'rubric-validator',
      });
    }

    // Resolve challenge details
    const cached = getCachedChallenge(challengeId);
    const challengeTitle = body.challengeTitle || cached?.title || 'Product Management Challenge';
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

    const customRubric = (body as any).rubric as Array<{ dimension: string; weight: string; description?: string }> | undefined;
    const rubricPromptContext = customRubric && Array.isArray(customRubric) && customRubric.length > 0
      ? customRubric.map((r, i) => `${i + 1}. ${r.dimension} (${r.weight}): ${r.description || ''}`).join('\n')
      : '';

    // Calculate actual candidate word count for strict server-side ceilings
    const candidateRawWords = (rawSubmission || `${rawProblem} ${rawSolution} ${rawMetrics}`)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 0);
    const wordCount = candidateRawWords.length;

    // 1. Live AI Rubric Grading with OpenAI GPT-4o-mini
    try {
      const openai = getOpenAIClient();

      const candidateTextSection = rawSubmission
        ? `[CANDIDATE PM PROPOSAL]:\n${rawSubmission}`
        : `[1. Problem Diagnosis & Friction]:\n${rawProblem}\n\n[2. Proposed Solution & UX Architecture]:\n${rawSolution}\n\n[3. Primary Metric & Counter-Metrics (Guardrails)]:\n${rawMetrics}`;

      const prompt = `You are an elite Principal Product Manager and VP of Product at a top-tier tech company (ex-Google, Stripe, Linear, Airbnb) conducting an authentic, rigorous Senior PM bar-raiser assessment.

CHALLENGE CONTEXT:
Challenge Title: "${challengeTitle}"
Scenario: ${challengeScenario}
Target Objectives:
${targetObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}
Constraints:
${constraints.map((c, i) => `- ${c}`).join('\n')}
${rubricPromptContext ? `\nOFFICIAL EVALUATION RUBRIC:\n${rubricPromptContext}` : ''}

CANDIDATE SUBMISSION (Candidate Role: ${userRole}):
${candidateTextSection}

CRITICAL GROUNDING RULES:
1. ONLY evaluate ideas that are EXPLICITLY written by the candidate in CANDIDATE SUBMISSION.
2. DO NOT attribute the CHALLENGE CONTEXT, Scenario, or Target Objectives to the candidate. If the candidate did not mention a metric, they score 1.0 on metrics. If they did not explain root cause, they score 1.0 on product sense.
3. DO NOT invent or fabricate strengths. If the candidate does not provide substantive ideas, set "strengths": [].
4. STRICT CALIBRATION BANDS:
   * 15 - 35: Superficial, 1-2 generic sentences, buzzwords with zero diagnosis or metrics.
   * 36 - 55: Basic feature ideas without root-cause friction analysis; naive or missing metrics; ignores constraints.
   * 56 - 69: Junior/Mid PM execution: plausible direction, but missing trade-offs, edge cases, or guardrails.
   * 70 - 79: Solid Senior PM execution: clear root cause, pragmatic phased scoping, relevant primary metrics, but lacks deeper counter-metrics.
   * 80 - 89: Bar-Raiser Senior PM: acute root cause, wireframe-level UX transitions, explicit guardrail counter-metrics, tight feasibility within sprint limits.
   * 90 - 98: Principal / VP level: world-class strategic clarity, systems design, edge-case mitigation, cohort retention modeling.

Score each dimension on a 0.0 to 10.0 scale (with 1 decimal place):
1. productSenseScore (30% weight): Depth of root-cause understanding vs superficial feature bloat.
2. feasibilityScore (25% weight): Realism within sprint limits and constraints. Practical scoping.
3. metricsScore (25% weight): North Star alignment and explicit counter-metrics/guardrails (churn, drop-off, opt-in).
4. userValueScore (20% weight): Immediate customer delight ("aha moment") and sustainable engagement.

Calculate overallScore:
overallScore = Math.round((productSenseScore * 3.0) + (feasibilityScore * 2.5) + (metricsScore * 2.5) + (userValueScore * 2.0))

OUTPUT JSON FORMAT (Return strictly valid JSON only):
{
  "overallScore": number (integer 15-98),
  "productSenseScore": number (0.0 - 10.0),
  "feasibilityScore": number (0.0 - 10.0),
  "metricsScore": number (0.0 - 10.0),
  "userValueScore": number (0.0 - 10.0),
  "verdictLabel": string ("Principal / Bar-Raiser Level" | "Strong Senior PM Candidate" | "Solid Mid-Level PM Execution" | "Promising with Key Strategic Gaps" | "Needs Fundamental Rework"),
  "summary": string (2-3 sentences evaluating the candidate's exact proposal and primary vulnerability),
  "strengths": string[] (array of 0 to 3 points quoting real phrases from candidate's text; EMPTY ARRAY [] if text is weak or superficial),
  "improvements": string[] (array of 2 to 3 actionable, specific PM critique points citing concrete solutions, edge cases, or guardrails they missed),
  "principalAdvice": string (1-2 sentences of senior product leadership wisdom)
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);

      let ps = Number(parsed.productSenseScore);
      let fs_ = Number(parsed.feasibilityScore);
      let ms = Number(parsed.metricsScore);
      let uv = Number(parsed.userValueScore);

      if (isNaN(ps) || ps <= 0) ps = 2.0;
      if (isNaN(fs_) || fs_ <= 0) fs_ = 2.0;
      if (isNaN(ms) || ms <= 0) ms = 1.5;
      if (isNaN(uv) || uv <= 0) uv = 2.0;

      let overall = Number(parsed.overallScore);
      if (isNaN(overall) || overall <= 0) {
        overall = Math.round(ps * 3.0 + fs_ * 2.5 + ms * 2.5 + uv * 2.0);
      }

      // Enforce strict ceilings based on candidate word volume and substance
      if (wordCount < 30) {
        overall = Math.min(overall, 35);
        ps = Math.min(ps, 3.5);
        fs_ = Math.min(fs_, 3.8);
        ms = Math.min(ms, 3.0);
        uv = Math.min(uv, 3.5);
      } else if (wordCount < 60) {
        overall = Math.min(overall, 55);
        ps = Math.min(ps, 5.5);
        fs_ = Math.min(fs_, 5.8);
        ms = Math.min(ms, 5.2);
        uv = Math.min(uv, 5.5);
      } else if (wordCount < 90) {
        overall = Math.min(overall, 68);
        ps = Math.min(ps, 6.8);
        fs_ = Math.min(fs_, 7.0);
        ms = Math.min(ms, 6.8);
        uv = Math.min(uv, 7.0);
      }

      const rawStrengths = Array.isArray(parsed.strengths)
        ? parsed.strengths
        : parsed.strengths
        ? [String(parsed.strengths)]
        : [];
      const strengths = rawStrengths.filter(Boolean).map(String);

      const rawImprovements = Array.isArray(parsed.improvements)
        ? parsed.improvements
        : parsed.improvements
        ? [String(parsed.improvements)]
        : [];
      const improvements = rawImprovements.filter(Boolean).map(String);

      const feedback: RubricFeedback = {
        overallScore: Math.min(98, Math.max(15, Math.round(overall))),
        productSenseScore: Number(Math.min(10, Math.max(1, ps)).toFixed(1)),
        feasibilityScore: Number(Math.min(10, Math.max(1, fs_)).toFixed(1)),
        metricsScore: Number(Math.min(10, Math.max(1, ms)).toFixed(1)),
        userValueScore: Number(Math.min(10, Math.max(1, uv)).toFixed(1)),
        verdictLabel: getVerdictLabel(overall),
        summary: parsed.summary || 'Senior PM rubric evaluation completed.',
        strengths: wordCount < 30 ? [] : strengths,
        improvements: improvements.length > 0 ? improvements : ['Consider establishing explicit counter-metrics to protect retention.'],
        principalAdvice: parsed.principalAdvice || 'Always validate your assumptions with progressive cohort rollouts.',
        evaluatorModel: 'OpenAI GPT-4o-mini',
      };

      return NextResponse.json({
        success: true,
        data: feedback,
        source: 'openai-gpt-4o-mini',
      });
    } catch (err: any) {
      console.warn('OpenAI live evaluation error, using dynamic heuristic rubric:', err?.message);
    }

    // 2. Dynamic Heuristic PM Evaluation Engine (Non-static fallback)
    const effectiveProblem = rawProblem || rawSubmission.slice(0, 200);
    const effectiveSolution = rawSolution || rawSubmission.slice(200, 600);
    const effectiveMetrics = rawMetrics || rawSubmission.slice(600);

    const fallbackFeedback = evaluateHeuristically(
      effectiveProblem,
      effectiveSolution,
      effectiveMetrics,
      challengeTitle
    );

    return NextResponse.json({
      success: true,
      data: fallbackFeedback,
      source: 'dynamic-heuristic-rubric',
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
 * Dynamic, non-static Heuristic PM Rubric Analysis Engine.
 * Starts from a low base and dynamically scores based on text depth, vocabulary, and PM rigor.
 */
function evaluateHeuristically(
  problem: string,
  solution: string,
  metrics: string,
  title: string
): RubricFeedback {
  const pTrim = problem.trim();
  const sTrim = solution.trim();
  const mTrim = metrics.trim();

  const pLower = pTrim.toLowerCase();
  const sLower = sTrim.toLowerCase();
  const mLower = mTrim.toLowerCase();

  const totalWords = `${pTrim} ${sTrim} ${mTrim}`.split(/\s+/).filter(Boolean).length;

  // 1. Product Sense (0-10) - base 1.5 - 2.5
  let pScore = pTrim.length < 30 ? 1.5 : 2.5;
  if (pTrim.length > 50) pScore += 1.0;
  if (pTrim.length > 120) pScore += 1.4;
  if (pTrim.length > 220) pScore += 1.2;
  if (pLower.includes('friction') || pLower.includes('fatigue') || pLower.includes('intent') || pLower.includes('cognitive') || pLower.includes('overload')) {
    pScore += 1.4;
  }
  if (pLower.includes('drop') || pLower.includes('root') || pLower.includes('because') || pLower.includes('why') || pLower.includes('frustrat')) {
    pScore += 1.0;
  }
  pScore = Math.min(9.4, Math.max(1.0, Number(pScore.toFixed(1))));

  // 2. Feasibility (0-10) - base 1.5 - 2.8
  let fScore = sTrim.length < 30 ? 1.5 : 2.8;
  if (sTrim.length > 60) fScore += 1.2;
  if (sTrim.length > 150) fScore += 1.5;
  if (sTrim.length > 250) fScore += 1.0;
  if (sLower.includes('sprint') || sLower.includes('mvp') || sLower.includes('phase') || sLower.includes('scope') || sLower.includes('limit')) {
    fScore += 1.2;
  }
  if (sLower.includes('step') || sLower.includes('flow') || sLower.includes('progressive') || sLower.includes('default') || sLower.includes('1-tap') || sLower.includes('widget') || sLower.includes('card')) {
    fScore += 1.0;
  }
  fScore = Math.min(9.3, Math.max(1.0, Number(fScore.toFixed(1))));

  // 3. Metrics & Guardrails (0-10) - base 1.0 - 2.0
  let mScore = mTrim.length < 20 ? 1.0 : 2.0;
  if (mTrim.length > 40) mScore += 1.3;
  if (mTrim.length > 90) mScore += 1.5;
  if (mLower.includes('guardrail') || mLower.includes('counter') || mLower.includes('churn') || mLower.includes('retention') || mLower.includes('skip') || mLower.includes('mute') || mLower.includes('opt-in')) {
    mScore += 2.2;
  } else {
    mScore -= 0.5; // Penalty for missing guardrails
  }
  if (mLower.includes('%') || mLower.includes('target') || mLower.includes('rate') || mLower.includes('ratio') || mLower.includes('dau') || mLower.includes('d1') || mLower.includes('d7')) {
    mScore += 1.2;
  }
  mScore = Math.min(9.5, Math.max(1.0, Number(mScore.toFixed(1))));

  // 4. User Value (0-10) - base 1.5 - 2.5
  let uScore = sTrim.length < 30 ? 1.5 : 2.5;
  if (sLower.includes('user') || sLower.includes('delight') || sLower.includes('value') || sLower.includes('time') || sLower.includes('experience')) {
    uScore += 1.5;
  }
  if (sLower.includes('immediate') || sLower.includes('simple') || sLower.includes('clear') || sLower.includes('quick') || sLower.includes('fast')) {
    uScore += 1.2;
  }
  if (sTrim.length > 100) uScore += 1.2;
  uScore = Math.min(9.4, Math.max(1.0, Number(uScore.toFixed(1))));

  // Weighted score (30% PS, 25% Feas, 25% Metrics, 20% UV)
  let weighted = pScore * 3.0 + fScore * 2.5 + mScore * 2.5 + uScore * 2.0;

  if (totalWords < 30) {
    weighted = Math.min(35, weighted);
  } else if (totalWords < 60) {
    weighted = Math.min(55, weighted);
  } else if (totalWords < 90) {
    weighted = Math.min(68, weighted);
  }

  const overallScore = Math.round(Math.min(95, Math.max(12, weighted)));
  const verdictLabel = getVerdictLabel(overallScore);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (totalWords >= 40) {
    if (pTrim.length > 100) {
      strengths.push(`Thoughtful problem diagnosis that identifies specific friction drivers in "${title}".`);
    } else {
      strengths.push('Identified the core user drop-off area outlined in the challenge.');
    }

    if (sLower.includes('step') || sLower.includes('progressive') || sLower.includes('default') || sLower.includes('widget') || sLower.includes('card') || sLower.includes('1-tap')) {
      strengths.push('Proposed structured UX mechanics designed to accelerate user time-to-value.');
    }
  }

  if (mLower.includes('guardrail') || mLower.includes('counter') || mLower.includes('churn') || mLower.includes('retention') || mLower.includes('skip')) {
    strengths.push('Strong metric maturity: defined counter-metrics to guard against unintended user drop-off.');
  } else {
    improvements.push('Define explicit counter-metrics / guardrails (e.g. churn rate, drop-off rate, or feature mute percentage) to ensure changes do not harm long-term cohort retention.');
  }

  if (sTrim.length < 150) {
    improvements.push('Deepen the wireframe-level UX flow details: describe screen-by-screen state transitions.');
  }

  if (!sLower.includes('sprint') && !sLower.includes('mvp') && !sLower.includes('scope')) {
    improvements.push('Clarify engineering feasibility: explicitly address how this solution fits into sprint limits without heavy refactoring.');
  }

  const summary = `Candidate submitted a ${verdictLabel.toLowerCase()} teardown for "${title}". The proposal scores ${overallScore}/100 across Product Sense, Feasibility, Metrics Rigor, and User Value.`;
  const principalAdvice = 'In executive reviews, always pair your solution with a phased 10% canary rollout to measure Day-1 activation against Day-30 retention.';

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
    evaluatorModel: 'Dynamic Heuristic PM Rubric',
  };
}
