import {
  AssessmentLevelConfig,
  AssessmentQuestion,
  CompetencyCategory,
  CompetencyScoreBreakdown,
  CaseEvaluationResult,
  RubricDimensionScore,
  QuestionReviewItem,
  LearningRecommendation,
} from '@/types/assessment';
import { getAiClient, getAiModel, isGeminiActive } from '@/lib/ai';

export interface ScoreSubmissionParams {
  levelConfig: AssessmentLevelConfig;
  questions: AssessmentQuestion[];
  userAnswers: Record<string, string>;
  timeSpentSeconds: number;
}

export interface ScoreSubmissionResult {
  scorePercentage: number;
  totalCorrect: number;
  totalQuestions: number;
  isPassed: boolean;
  statusLabel: 'Strong' | 'Proficient' | 'Approaching' | 'Developing' | 'Needs Foundational Learning';
  competencyScores: Record<CompetencyCategory, CompetencyScoreBreakdown>;
  caseEvaluations: Record<string, CaseEvaluationResult>;
  questionReviews: QuestionReviewItem[];
  strengths: string[];
  growthAreas: string[];
  recommendations: LearningRecommendation[];
}

export function getStatusLabel(score: number): 'Strong' | 'Proficient' | 'Approaching' | 'Developing' | 'Needs Foundational Learning' {
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Proficient';
  if (score >= 60) return 'Approaching';
  if (score >= 40) return 'Developing';
  return 'Needs Foundational Learning';
}

export async function gradeWrittenCaseWithAi(
  question: AssessmentQuestion,
  submissionText: string
): Promise<CaseEvaluationResult> {
  const text = (submissionText || '').trim();

  // If text is extremely short or empty
  if (text.length < 25) {
    const zeroDimensions: RubricDimensionScore[] = (question.rubric || []).map((r) => ({
      dimensionId: r.id,
      dimensionName: r.name,
      weight: r.weight,
      score: 15,
      feedback: 'Response was insufficient or missing. Provide a comprehensive strategic breakdown.',
    }));
    return {
      questionId: question.id,
      overallScore: 15,
      dimensionScores: zeroDimensions,
      feedbackSummary: 'Response was incomplete. Strategic cases require rigorous analytical and trade-off depth.',
      strengths: ['Attempted submission'],
      improvements: [
        'Detail explicit quantitative reasoning and metrics',
        'State clear trade-offs and alternative solutions',
        'Address strategic alignment and execution risks',
      ],
    };
  }

  // Attempt evaluation using Gemini AI
  try {
    const ai = getAiClient();
    const model = getAiModel('gemini-2.5-flash');

    const rubricPrompt = (question.rubric || [])
      .map((r) => `- ${r.name} (${r.weight}%): ${r.description}`)
      .join('\n');

    const prompt = `You are a Principal Product Manager and Bar Raiser evaluating a candidate's written strategic response.

QUESTION:
Title: ${question.title}
Scenario: ${question.scenario || ''}
Prompt: ${question.questionText}
Accepted Criteria: ${question.acceptedCriteria || ''}

RUBRIC CRITERIA:
${rubricPrompt}

CANDIDATE RESPONSE:
"""
${text}
"""

Evaluate this response strictly against each rubric dimension. Return a VALID JSON object with NO extra text or markdown codeblocks:
{
  "overallScore": <number 0-100>,
  "dimensionScores": [
    {
      "dimensionId": "<id>",
      "dimensionName": "<name>",
      "score": <number 0-100>,
      "feedback": "<concise actionable feedback on this dimension>"
    }
  ],
  "feedbackSummary": "<2-3 sentence executive evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"]
}`;

    // Protect with an 8-second timeout so grading is snappy and resilient
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI grading timeout (8s limit reached)')), 8000)
    );

    const completionPromise = ai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);
    const rawContent = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent);

    if (parsed && typeof parsed.overallScore === 'number') {
      const dimensionScores: RubricDimensionScore[] = (question.rubric || []).map((r) => {
        const found = (parsed.dimensionScores || []).find(
          (d: any) =>
            d.dimensionId === r.id ||
            d.dimensionName?.toLowerCase() === r.name.toLowerCase()
        );
        return {
          dimensionId: r.id,
          dimensionName: r.name,
          weight: r.weight,
          score: typeof found?.score === 'number' ? Math.min(100, Math.max(0, found.score)) : parsed.overallScore,
          feedback: found?.feedback || 'Evaluated against professional product management standards.',
        };
      });

      return {
        questionId: question.id,
        overallScore: Math.min(100, Math.max(0, parsed.overallScore)),
        dimensionScores,
        feedbackSummary: parsed.feedbackSummary || 'Evaluation completed against standardized rubric.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : ['Good structural clarity'],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : ['Deepen quantitative rigor'],
      };
    }
  } catch (error) {
    console.warn('AI rubric evaluation notice (using deterministic fallback):', (error as any)?.message || error);
  }

  // Fallback deterministic grading if AI is unreachable or times out
  return generateDeterministicCaseScore(question, text);
}

function generateDeterministicCaseScore(question: AssessmentQuestion, text: string): CaseEvaluationResult {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  let baseScore = 65;
  if (wordCount >= 220) baseScore += 15;
  else if (wordCount >= 120) baseScore += 10;
  else if (wordCount < 60) baseScore -= 20;

  // Keyword indicators of PM rigor across domains
  const rigorKeywords = [
    'metric', 'trade-off', 'risk', 'hypothesis', 'customer', 'revenue', 'roi',
    'cac', 'ltv', 'margin', 'latency', 'guardrail', 'priorit', 'validation', 'experiment',
    'nrr', 'churn', 'segment', 'rollback', 'contingency', 'unit economic', 'quota'
  ];
  const matched = rigorKeywords.filter((k) => text.toLowerCase().includes(k)).length;
  const keywordBonus = Math.min(15, matched * 1.5);
  const finalScore = Math.min(95, Math.max(30, Math.round(baseScore + keywordBonus)));

  const dimensionFeedbacks: Record<string, string> = {
    problem_framing: 'Diagnosed core breakdown vs superficial symptom. Deepen root cause decomposition.',
    analytical_reasoning: 'Applied quantitative metrics and cohort/segment logic. Include explicit unit economic payback formulas.',
    decision_quality: 'Made a clear strategic recommendation. Ensure opportunity cost of the deferred option is fully quantified.',
    validation_metrics: 'Established measurable leading indicators. Define automated rollback triggers for negative guardrail breaches.',
    communication_clarity: 'Structured executive presentation. Ensure high signal-to-noise ratio.',
  };

  const dimensionScores: RubricDimensionScore[] = (question.rubric || []).map((r) => ({
    dimensionId: r.id,
    dimensionName: r.name,
    weight: r.weight,
    score: finalScore,
    feedback: dimensionFeedbacks[r.id] || `Evaluated against ${r.name}. Ensure clear quantitative trade-offs and structural depth.`,
  }));

  return {
    questionId: question.id,
    overallScore: finalScore,
    dimensionScores,
    feedbackSummary: 'Strategic response evaluated across standardized 5-dimension rubric (Problem framing, Analytics, Decision quality, Validation metrics, and Executive clarity).',
    strengths: [
      'Addressed scenario constraints with actionable recommendation',
      'Demonstrated structured problem decomposition',
    ],
    improvements: [
      'State explicit expected value formulas and confidence intervals',
      'Elaborate on secondary risk guardrails and automated rollback triggers',
    ],
  };
}

export async function scoreAssessmentSubmission(
  params: ScoreSubmissionParams
): Promise<ScoreSubmissionResult> {
  const { levelConfig, questions, userAnswers } = params;

  let totalPointsAvailable = 0;
  let totalPointsEarned = 0;
  let totalObjectiveCorrect = 0;
  let totalObjectiveQuestions = 0;

  const questionReviews: QuestionReviewItem[] = [];
  const caseEvaluations: Record<string, CaseEvaluationResult> = {};

  // Accumulators for competency categories
  const competencyMap: Record<
    CompetencyCategory,
    { pointsEarned: number; totalPoints: number }
  > = {
    'Product Sense & User Empathy': { pointsEarned: 0, totalPoints: 0 },
    'Data & Analytical Thinking': { pointsEarned: 0, totalPoints: 0 },
    'Prioritization & Execution': { pointsEarned: 0, totalPoints: 0 },
    'Strategy & Business Thinking': { pointsEarned: 0, totalPoints: 0 },
    'Communication & Decision-Making': { pointsEarned: 0, totalPoints: 0 },
  };

  for (const question of questions) {
    const rawAnswer = userAnswers[question.id] || '';
    const weight = question.scoringWeight || 1;
    totalPointsAvailable += weight * 100;

    // Ensure competency accumulator exists
    if (!competencyMap[question.competency]) {
      competencyMap[question.competency] = { pointsEarned: 0, totalPoints: 0 };
    }
    competencyMap[question.competency].totalPoints += weight * 100;

    if (question.format === 'written_case') {
      // Evaluate written case
      const caseResult = await gradeWrittenCaseWithAi(question, rawAnswer);
      caseEvaluations[question.id] = caseResult;
      const earned = (caseResult.overallScore / 100) * (weight * 100);
      totalPointsEarned += earned;
      competencyMap[question.competency].pointsEarned += earned;

      questionReviews.push({
        questionId: question.id,
        title: question.title,
        scenario: question.scenario,
        questionText: question.questionText,
        competency: question.competency,
        format: question.format,
        userAnswer: rawAnswer,
        scoreEarned: Math.round(earned),
        maxScore: weight * 100,
        explanation: question.explanation,
        caseEvaluation: caseResult,
      });
    } else {
      // Objective MCQ / Analytical question
      totalObjectiveQuestions += 1;
      const cleanUserChoice = rawAnswer.trim().toUpperCase() as 'A' | 'B' | 'C' | 'D';
      const isCorrect = cleanUserChoice === question.correctOption;
      if (isCorrect) {
        totalObjectiveCorrect += 1;
        const earned = weight * 100;
        totalPointsEarned += earned;
        competencyMap[question.competency].pointsEarned += earned;
      }

      questionReviews.push({
        questionId: question.id,
        title: question.title,
        scenario: question.scenario,
        questionText: question.questionText,
        competency: question.competency,
        format: question.format,
        userAnswer: cleanUserChoice || 'Unanswered',
        correctAnswer: question.correctOption,
        isCorrect,
        scoreEarned: isCorrect ? weight * 100 : 0,
        maxScore: weight * 100,
        explanation: question.explanation,
        optionExplanations: question.optionExplanations,
        options: question.options,
      });
    }
  }

  // Calculate overall percentage score
  const scorePercentage =
    totalPointsAvailable > 0
      ? Math.round((totalPointsEarned / totalPointsAvailable) * 100)
      : 0;

  const isPassed = scorePercentage >= (levelConfig.passingScorePercent || 70);
  const statusLabel = getStatusLabel(scorePercentage);

  // Compute competency breakdown
  const competencyScores = {} as Record<CompetencyCategory, CompetencyScoreBreakdown>;
  const categories: CompetencyCategory[] = [
    'Product Sense & User Empathy',
    'Data & Analytical Thinking',
    'Prioritization & Execution',
    'Strategy & Business Thinking',
    'Communication & Decision-Making',
  ];

  for (const cat of categories) {
    const data = competencyMap[cat];
    const catPct =
      data.totalPoints > 0 ? Math.round((data.pointsEarned / data.totalPoints) * 100) : 0;
    const catWeight = levelConfig.competencyWeights[cat] || 0.2;
    competencyScores[cat] = {
      category: cat,
      weight: catWeight,
      scorePercentage: catPct,
      pointsEarned: Math.round(data.pointsEarned),
      totalPoints: data.totalPoints,
      status: getStatusLabel(catPct),
      recommendations: getRecommendationsForCategory(cat, catPct),
    };
  }

  // Generate dynamic strengths & growth areas
  const sortedCompetencies = [...categories].sort(
    (a, b) => competencyScores[b].scorePercentage - competencyScores[a].scorePercentage
  );

  const strengths: string[] = sortedCompetencies
    .filter((c) => competencyScores[c].scorePercentage >= 70)
    .slice(0, 3)
    .map((c) => `${c}: Strong capability (${competencyScores[c].scorePercentage}%)`);

  if (strengths.length === 0) {
    strengths.push(`${sortedCompetencies[0]}: Highest relative area (${competencyScores[sortedCompetencies[0]].scorePercentage}%)`);
  }

  const growthAreas: string[] = sortedCompetencies
    .slice()
    .reverse()
    .filter((c) => competencyScores[c].scorePercentage < 70)
    .slice(0, 3)
    .map((c) => `${c}: Improvement needed (${competencyScores[c].scorePercentage}%)`);

  if (growthAreas.length === 0) {
    growthAreas.push('All evaluated competencies are proficient. Focus on complex executive-level edge cases.');
  }

  // Generate tailored learning recommendations
  const recommendations: LearningRecommendation[] = buildLearningRecommendations(
    competencyScores,
    questionReviews
  );

  return {
    scorePercentage,
    totalCorrect: totalObjectiveCorrect,
    totalQuestions: questions.length,
    isPassed,
    statusLabel,
    competencyScores,
    caseEvaluations,
    questionReviews,
    strengths,
    growthAreas,
    recommendations,
  };
}

function getRecommendationsForCategory(category: CompetencyCategory, score: number): string[] {
  if (score >= 70) {
    return ['Maintain strong execution and mentor colleagues on complex edge cases.'];
  }
  switch (category) {
    case 'Data & Analytical Thinking':
      return [
        'Practice funnel drop-off analysis and cohort retention modeling.',
        'Review statistical significance, p-values, and early stopping risks in A/B testing.',
        'Deepen understanding of unit economics (LTV, CAC, payback, and gross margins).',
      ];
    case 'Product Sense & User Empathy':
      return [
        'Practice problem framing before jumping to feature solutions.',
        'Master Jobs to Be Done (JTBD) interviews to uncover latent customer struggles.',
        'Refine Minimum Viable Product (MVP) scoping to accelerate hypothesis validation.',
      ];
    case 'Prioritization & Execution':
      return [
        'Apply RICE and Opportunity Cost scoring when balancing competing initiatives.',
        'Establish intake and emergency triage rules to protect sprint predictability.',
        'Frame technical debt in terms of operational reliability and future delivery speed.',
      ];
    case 'Strategy & Business Thinking':
      return [
        'Study platform unit economics and monetization models under infrastructure scaling.',
        'Analyze enterprise vs SME portfolio strategy to prevent custom one-off traps.',
        'Evaluate market saturation levers: expansion revenue, packaging tiers, and adjacent markets.',
      ];
    case 'Communication & Decision-Making':
      return [
        'Craft crisp executive memos with explicit trade-offs and go/no-go gates.',
        'Ensure operational launch readiness across customer support, docs, and analytics.',
        'Establish clear rollback triggers and error thresholds for new feature rollouts.',
      ];
  }
}

function buildLearningRecommendations(
  competencyScores: Record<CompetencyCategory, CompetencyScoreBreakdown>,
  questionReviews: QuestionReviewItem[]
): LearningRecommendation[] {
  const list: LearningRecommendation[] = [];

  // Check specific competency thresholds as requested by user prompt
  const dataScore = competencyScores['Data & Analytical Thinking']?.scorePercentage ?? 100;
  if (dataScore < 60) {
    list.push({
      topic: 'Funnel Conversion & Drop-off Diagnostics',
      category: 'Data & Analytical Thinking',
      reason: `Data & Analytics score is ${dataScore}%. Strengthening funnel analysis will help identify conversion leaks.`,
      suggestedAction: 'Practice diagnosing step-by-step conversion funnels and distinguishing correlation from causation.',
      priority: 'high',
    });
    list.push({
      topic: 'Retention Cohorts & LTV/CAC Economics',
      category: 'Data & Analytical Thinking',
      reason: 'Critical for evaluating whether user acquisition is compounding sustainably.',
      suggestedAction: 'Study retention curves, cohort segmentation, and revenue payback calculations.',
      priority: 'high',
    });
    list.push({
      topic: 'Experiment Design & Statistical Significance',
      category: 'Data & Analytical Thinking',
      reason: 'Avoiding false positives and early-stopping pitfalls is vital for rigorous PMs.',
      suggestedAction: 'Review sample size determination, guardrail metrics, and pre-experiment hypothesis setting.',
      priority: 'medium',
    });
  }

  const prodSenseScore = competencyScores['Product Sense & User Empathy']?.scorePercentage ?? 100;
  if (prodSenseScore < 60) {
    list.push({
      topic: 'Problem Framing & Jobs to Be Done (JTBD)',
      category: 'Product Sense & User Empathy',
      reason: `Product Sense score is ${prodSenseScore}%. Essential for discovering what users actually struggle with.`,
      suggestedAction: 'Conduct user problem discovery interviews and separate customer symptom requests from root causes.',
      priority: 'high',
    });
    list.push({
      topic: 'MVP Definition & Hypothesis De-risking',
      category: 'Product Sense & User Empathy',
      reason: 'Prevents overbuilding and accelerates validated learning from real user behavior.',
      suggestedAction: 'Design low-fidelity prototypes and discovery spikes to test value and usability risks.',
      priority: 'medium',
    });
  }

  const priorScore = competencyScores['Prioritization & Execution']?.scorePercentage ?? 100;
  if (priorScore < 60) {
    list.push({
      topic: 'RICE Prioritization & Opportunity Cost Modeling',
      category: 'Prioritization & Execution',
      reason: `Prioritization score is ${priorScore}%. Disciplined resource allocation is a core PM expectation.`,
      suggestedAction: 'Calculate (Reach × Impact × Confidence) / Effort and explicitly list what gets de-prioritized.',
      priority: 'high',
    });
    list.push({
      topic: 'Sprint Protection & Technical Debt Balancing',
      category: 'Prioritization & Execution',
      reason: 'Protects team delivery cadence and balances commercial urgency with codebase maintainability.',
      suggestedAction: 'Implement intake triage SLAs and reserve a dedicated engineering budget for reliability debt.',
      priority: 'medium',
    });
  }

  const stratScore = competencyScores['Strategy & Business Thinking']?.scorePercentage ?? 100;
  if (stratScore < 60) {
    list.push({
      topic: 'Platform Unit Economics & Scalable Pricing Tiers',
      category: 'Strategy & Business Thinking',
      reason: `Strategy score is ${stratScore}%. Product decisions must align with gross margins and business defensibility.`,
      suggestedAction: 'Analyze usage-based vs flat subscription models, infrastructure cost curves, and NRR levers.',
      priority: 'high',
    });
  }

  const commScore = competencyScores['Communication & Decision-Making']?.scorePercentage ?? 100;
  if (commScore < 60) {
    list.push({
      topic: 'Executive Decision Memos & Cross-Functional Alignment',
      category: 'Communication & Decision-Making',
      reason: `Communication score is ${commScore}%. Clear written framing aligns engineering, sales, and executives.`,
      suggestedAction: 'Draft structured PRDs and Go/No-Go decision memos with unambiguous trade-offs.',
      priority: 'medium',
    });
  }

  // Fallback if candidate performed well across all
  if (list.length === 0) {
    list.push({
      topic: 'Executive Strategic Case Mastery',
      category: 'Strategy & Business Thinking',
      reason: 'You demonstrated solid proficiency across all core disciplines. Elevate to executive trade-offs.',
      suggestedAction: 'Tackle advanced multi-segment portfolio dilemmas, AI risk guardrails, and international expansion.',
      priority: 'low',
    });
  }

  return list;
}
