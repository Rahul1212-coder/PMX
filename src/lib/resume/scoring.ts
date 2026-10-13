import {
  CategoryScore,
  ResumeAnalysisMode,
  ScoreTier,
  JobDescriptionRequirement,
  PmCompetencyEvaluation,
  AtsReadinessCheck,
} from '@/types/resume';

export const RUBRIC_VERSION = 'rubric_v1.0';

export interface RubricCategoryConfig {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export const JOB_MATCH_RUBRIC: RubricCategoryConfig[] = [
  {
    id: 'job_alignment',
    name: 'Job Requirement Alignment',
    weight: 35,
    description: 'Evidence demonstrating essential and preferred requirements in the job description.',
  },
  {
    id: 'product_impact',
    name: 'Product Impact & Outcomes',
    weight: 25,
    description: 'Verifiable customer and business outcomes, metric improvements, and ownership.',
  },
  {
    id: 'pm_experience',
    name: 'PM Scope & Lifecycle Experience',
    weight: 20,
    description: 'End-to-end product discovery, roadmap management, cross-functional execution.',
  },
  {
    id: 'parsing_readability',
    name: 'ATS Readability & Structure',
    weight: 10,
    description: 'Section recognizability, chronological hierarchy, date clarity, and bullet consistency.',
  },
  {
    id: 'keywords_terminology',
    name: 'Role Keywords & Domain Terminology',
    weight: 10,
    description: 'Contextual use of domain, analytical, and technical product management terminology.',
  },
];

export const GENERAL_REVIEW_RUBRIC: RubricCategoryConfig[] = [
  {
    id: 'product_impact',
    name: 'Product Impact & Outcomes',
    weight: 35,
    description: 'Measurable business metrics, customer metrics, adoption, and clear ownership evidence.',
  },
  {
    id: 'pm_competencies',
    name: 'Core PM Competency Breadth',
    weight: 25,
    description: 'Coverage of user research, strategy, prioritization, execution, and analytics.',
  },
  {
    id: 'experience_scope',
    name: 'Career Progression & Scope',
    weight: 20,
    description: 'Demonstrated seniority, cross-functional leadership, and organizational scale.',
  },
  {
    id: 'parsing_readability',
    name: 'ATS Structure & Formatting',
    weight: 10,
    description: 'Parser readability, bullet quality, clean headers, and contact information integrity.',
  },
  {
    id: 'clarity_tone',
    name: 'Clarity, Tone & Action Verbs',
    weight: 10,
    description: 'High-signal phrasing, concision, strong active verbs, and absence of passive filler.',
  },
];

export function getScoreTier(score: number): ScoreTier {
  if (score >= 85) return 'Top Candidate';
  if (score >= 70) return 'Strong Fit';
  if (score >= 55) return 'Moderate Fit';
  return 'Needs Revision';
}

export interface CalculateScoresInput {
  mode: ResumeAnalysisMode;
  rawCategoryScores: Record<string, { score: number; explanation: string; supportingEvidence: string[] }>;
  requirements?: JobDescriptionRequirement[];
  competencies?: PmCompetencyEvaluation[];
  atsChecks?: AtsReadinessCheck[];
}

export interface CalculatedScoresResult {
  overallScore: number;
  scoreTier: ScoreTier;
  categoryScores: CategoryScore[];
  rubricVersion: string;
  scoreExplanation: string;
}

export function calculateDeterministicScores(input: CalculateScoresInput): CalculatedScoresResult {
  const { mode, rawCategoryScores } = input;
  const rubric = mode === 'job_match' ? JOB_MATCH_RUBRIC : GENERAL_REVIEW_RUBRIC;

  let totalWeightedPoints = 0;
  const categoryScores: CategoryScore[] = [];

  for (const item of rubric) {
    const raw = rawCategoryScores[item.id] || {
      score: 50,
      explanation: 'Evaluated against standard product management benchmarks.',
      supportingEvidence: [],
    };

    // Strict boundary [0, 100]
    const normalizedScore = Math.max(0, Math.min(100, Math.round(raw.score)));
    const earnedPoints = Number(((normalizedScore * item.weight) / 100).toFixed(1));

    totalWeightedPoints += earnedPoints;

    categoryScores.push({
      id: item.id,
      name: item.name,
      weight: item.weight,
      score: normalizedScore,
      earnedPoints,
      explanation: raw.explanation,
      supportingEvidence: raw.supportingEvidence || [],
    });
  }

  // Calculate final bounded overall score
  const finalScore = Math.max(0, Math.min(100, Math.round(totalWeightedPoints)));
  const scoreTier = getScoreTier(finalScore);

  const scoreExplanation =
    mode === 'job_match'
      ? `This score represents a deterministic calculation weighted across Job Requirement Alignment (35%), Product Impact & Outcomes (25%), PM Experience & Scope (20%), ATS Readability (10%), and Relevant Terminology (10%). It evaluates candidate fit against the provided job description rather than an uncalibrated guessing model.`
      : `This general PM resume audit evaluates foundational product management benchmarks: Product Impact (35%), PM Competency Breadth (25%), Career Scope (20%), ATS Structure (10%), and Clarity & Tone (10%).`;

  return {
    overallScore: finalScore,
    scoreTier,
    categoryScores,
    rubricVersion: RUBRIC_VERSION,
    scoreExplanation,
  };
}
