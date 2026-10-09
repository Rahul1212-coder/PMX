export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  company: string;
  avatarUrl?: string;
  bio?: string;
  headline?: string;
  location?: string;
  connectionsCount?: number;
  profileViews?: number;
  postImpressions?: number;
  pmFitScore?: number;
  createdAt?: string;
}

export interface CommunityPost {
  id: string;
  userId?: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar: string;
    headline?: string;
    isConnection?: boolean;
  };
  title: string;
  content: string;
  category: 'Strategy' | 'Execution' | 'AI & Tech' | 'Career & Transition' | 'Case Study';
  tags: string[];
  upvotes: number;
  hasUpvoted?: boolean;
  userReaction?: 'like' | 'celebrate' | 'insightful' | 'love' | null;
  reactions?: {
    likes: number;
    celebrates: number;
    insightfuls: number;
    loves: number;
  };
  commentsCount: number;
  comments?: Comment[];
  createdAt: string;
  pinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    company?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
}

export interface PmConnection {
  id: string;
  name: string;
  headline: string;
  role: 'Associate PM' | 'Product Manager' | 'Senior PM' | 'Lead / Principal PM' | 'Director / VP of Product' | string;
  company: string;
  avatar: string;
  coverPhoto: string;
  mutualConnections: number;
  location: string;
  skills: string[];
  status: 'connected' | 'pending' | 'received' | 'not_connected';
  bio: string;
}

export interface ConnectionInvitation {
  id: string;
  requesterId: string;
  receiverId: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  mutual?: number;
  note?: string;
  createdAt: string;
}

export interface PmConcept {
  id: string;
  term: string;
  category: 'Frameworks' | 'Metrics & Data' | 'Product Strategy' | 'Discovery & UX' | 'Execution';
  quickSummary: string;
  detailedDefinition: string;
  formulaOrSteps?: string | string[];
  realWorldExample: string;
  commonPitfalls: string | string[];
  interviewTip: string;
}

export interface JobListing {
  id: string;
  userId?: string;
  title: string;
  company: string;
  logo: string;
  level: 'Associate PM' | 'Product Manager' | 'Senior PM' | 'Lead / Principal PM' | 'VP of Product';
  domain: 'Fintech' | 'AI & ML' | 'B2B SaaS' | 'E-commerce' | 'Healthtech' | 'Developer Tools';
  location: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange: string;
  postedDate: string;
  featured?: boolean;
  description: string;
  skills: string[];
  applyUrl: string;
  source?: string;
  isSaved?: boolean;
  applicantsCount?: number;
  matchScore?: number;
}

export type AssessmentCategory =
  | 'Product Thinking'
  | 'Product Strategy'
  | 'Root Cause Analysis (RCA)'
  | 'Metrics & Analytics'
  | 'Prioritization'
  | 'User Research & Discovery'
  | 'Product Execution & Delivery'
  | 'Growth & Monetization'
  | 'Stakeholder Management'
  | 'Technical & Systems Thinking';

export interface AssessmentQuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface AssessmentQuestion {
  id: number;
  category: AssessmentCategory;
  title: string;
  scenario: string;
  question: string;
  options: AssessmentQuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  competencyTested: string;
}

export interface CategoryScore {
  category: AssessmentCategory;
  score: number;
  total: number;
  percentage: number;
  level: string;
  recommendation: string;
}

export interface AnswerReviewItem {
  questionId: number;
  category: AssessmentCategory;
  title: string;
  scenario: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  correctOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  explanation: string;
  competencyTested: string;
}

export interface AssessmentResult {
  scorePercentage: number;
  totalCorrect: number;
  totalQuestions: number;
  archetype: string;
  assessmentLabel: 'Beginner' | 'Developing' | 'Competent' | 'Strong' | 'Advanced';
  summary: string;
  categoryScores: CategoryScore[];
  dimensionScores?: {
    dimension: string;
    score: number;
  }[];
  strengths: string[];
  growthAreas: string[];
  recommendedRole: string;
  answersReview?: AnswerReviewItem[];
}

export interface SavedQuizResult {
  id: string;
  userId: string;
  scorePercentage: number;
  archetype: string;
  summary: string;
  dimensionScores: {
    dimension: string;
    score: number;
  }[];
  createdAt: string;
}

export interface PmCaseStudy {
  id: string;
  title: string;
  category: string;
  scenario: string;
  contextPoints: string[];
  tasks: string[];
  rubric: {
    dimension: string;
    weight: string;
    description: string;
  }[];
}

export type ApplicationStage = 'Saved' | 'Applied' | 'Screening' | 'Interview' | 'Final Round' | 'Offer';

export interface JobApplication {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  stage: ApplicationStage;
  location?: string;
  salaryRange?: string;
  notes?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  userId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  problemStatement: string;
  solutionProposal: string;
  keyMetrics: string;
  upvotes: number;
  hasUpvoted?: boolean;
  aiFeedback?: {
    overallScore: number;
    productSenseScore: number;
    feasibilityScore: number;
    metricsScore: number;
    strengths: string[];
    improvements: string[];
    summary: string;
  };
  createdAt: string;
}

