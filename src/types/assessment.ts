export type AssessmentLevelId = 'beginner' | 'intermediate' | 'advanced';

export type CompetencyCategory =
  | 'Product Sense & User Empathy'
  | 'Data & Analytical Thinking'
  | 'Prioritization & Execution'
  | 'Strategy & Business Thinking'
  | 'Communication & Decision-Making';

export type QuestionFormat = 'mcq' | 'scenario_mcq' | 'analytical' | 'written_case';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface AssessmentOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface RubricDimension {
  id: string;
  name: string;
  weight: number; // percentage (e.g. 25)
  description: string;
}

export interface AssessmentQuestion {
  id: string;
  levelId: AssessmentLevelId;
  orderIndex: number;
  title: string;
  scenario?: string;
  questionText: string;
  difficulty: QuestionDifficulty;
  competency: CompetencyCategory;
  format: QuestionFormat;
  options?: AssessmentOption[];
  correctOption?: 'A' | 'B' | 'C' | 'D';
  acceptedCriteria?: string;
  explanation: string;
  optionExplanations?: Record<'A' | 'B' | 'C' | 'D', string>;
  scoringWeight: number; // default 1
  timeLimitSeconds?: number;
  rubric?: RubricDimension[];
  isActive: boolean;
  tags?: string[];
}

// Client-safe version without answers or internal explanations
export interface PublicAssessmentQuestion {
  id: string;
  levelId: AssessmentLevelId;
  orderIndex: number;
  title: string;
  scenario?: string;
  questionText: string;
  difficulty: QuestionDifficulty;
  competency: CompetencyCategory;
  format: QuestionFormat;
  options?: AssessmentOption[];
  scoringWeight: number;
  rubric?: RubricDimension[];
}

export interface AssessmentLevelConfig {
  id: AssessmentLevelId;
  title: string;
  subtitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  durationMinutes: number;
  passingScorePercent: number; // 70
  formatDescription: string;
  focusDescription: string;
  topics: string[];
  competencyWeights: Record<CompetencyCategory, number>;
  prerequisiteLevelId?: AssessmentLevelId;
}

export interface UserLevelProgress {
  levelId: AssessmentLevelId;
  isUnlocked: boolean;
  bestScore?: number;
  latestScore?: number;
  attemptsCount: number;
  status: 'locked' | 'not_started' | 'in_progress' | 'passed' | 'failed';
  lastAttemptAt?: string;
}

export interface RubricDimensionScore {
  dimensionId: string;
  dimensionName: string;
  weight: number;
  score: number; // 0 to 100
  feedback: string;
}

export interface CaseEvaluationResult {
  questionId: string;
  overallScore: number;
  dimensionScores: RubricDimensionScore[];
  feedbackSummary: string;
  strengths: string[];
  improvements: string[];
}

export interface CompetencyScoreBreakdown {
  category: CompetencyCategory;
  weight: number;
  scorePercentage: number;
  pointsEarned: number;
  totalPoints: number;
  status: 'Strong' | 'Proficient' | 'Approaching' | 'Developing' | 'Needs Foundational Learning';
  recommendations: string[];
}

export interface QuestionReviewItem {
  questionId: string;
  title: string;
  scenario?: string;
  questionText: string;
  competency: CompetencyCategory;
  format: QuestionFormat;
  userAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  scoreEarned: number;
  maxScore: number;
  explanation: string;
  optionExplanations?: Record<'A' | 'B' | 'C' | 'D', string>;
  options?: AssessmentOption[];
  caseEvaluation?: CaseEvaluationResult;
}

export interface LearningRecommendation {
  topic: string;
  category: CompetencyCategory;
  reason: string;
  suggestedAction: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  levelId: AssessmentLevelId;
  status: 'in_progress' | 'completed' | 'abandoned';
  answers: Record<string, string>; // questionId -> answer ('A' | 'B' | written text)
  markedForReview: string[];
  scorePercentage?: number;
  isPassed?: boolean;
  totalCorrect?: number;
  totalQuestions?: number;
  competencyScores?: Record<CompetencyCategory, CompetencyScoreBreakdown>;
  caseEvaluations?: Record<string, CaseEvaluationResult>;
  questionReviews?: QuestionReviewItem[];
  strengths?: string[];
  growthAreas?: string[];
  recommendations?: LearningRecommendation[];
  timeSpentSeconds: number;
  startedAt: string;
  completedAt?: string;
}
