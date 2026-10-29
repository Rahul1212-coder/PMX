export type LearningItemType = 'concept' | 'case_study' | 'teardown';

export type LearningCategory =
  | 'Product Thinking'
  | 'Metrics & Data'
  | 'Prioritization & Strategy'
  | 'User Discovery'
  | 'Execution & Tech'
  | 'Growth & Monetization';

export type LearningDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ConceptDetail {
  simpleExplanation: string;
  pmScenario: string;
  industryExample: string;
  whenToUse: string;
  whenNotToUse: string;
  interviewQuestion: string;
  pitfalls: string[];
  relatedKeys: string[];
}

export interface CaseStudyHypothesis {
  hypothesis: string;
  validationMethod: string;
  dataSignal: string;
}

export interface CaseStudyDetail {
  company: string;
  product: string;
  businessModel: string;
  backgroundScenario: string;
  keyMetrics: Record<string, string>;
  coreChallengeQuestion: string;
  hypotheses: CaseStudyHypothesis[];
  frameworkUsed: string;
  recommendedAction: string;
  tradeOffAnalysis: string;
  interviewerRubric: string[];
}

export interface TeardownUxStep {
  stepTitle: string;
  userGoal: string;
  screenDescription: string;
  pmInsight: string;
}

export interface ProductTeardownDetail {
  company: string;
  productName: string;
  heroTagline: string;
  targetPersona: string;
  coreJtbd: string;
  growthLoopOrWedge: string;
  uxFlowBreakdown: TeardownUxStep[];
  monetizationEngine: string;
  keyMetricsTheyTrack: string[];
  pmLessonsLearned: string[];
  areasForImprovement: string[];
}

export interface LearningItemAuthor {
  name: string;
  role: string;
  avatar?: string;
  isAi?: boolean;
}

export interface LearningItem {
  id: string;
  slug: string;
  title: string;
  type: LearningItemType;
  category: LearningCategory;
  difficulty: LearningDifficulty;
  readTimeMinutes: number;
  summary: string;
  tags: string[];
  conceptDetail?: ConceptDetail;
  caseStudyDetail?: CaseStudyDetail;
  teardownDetail?: ProductTeardownDetail;
  publishedAt: string;
  isCustom?: boolean;
  isPublished: boolean;
  author: LearningItemAuthor;
  likesCount?: number;
  viewsCount?: number;
}

export interface GenerateMaterialRequest {
  type: LearningItemType;
  topic: string;
  category?: LearningCategory;
  difficulty?: LearningDifficulty;
  contextOrNotes?: string;
  userId?: string;
}

export interface GenerateMaterialResponse {
  success: boolean;
  material?: LearningItem;
  error?: string;
  source?: 'gemini' | 'openai' | 'fallback';
}
