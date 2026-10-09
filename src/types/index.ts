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
  role: 'Associate PM' | 'Product Manager' | 'Senior PM' | 'Lead / Principal PM' | 'Director / VP of Product';
  company: string;
  avatar: string;
  coverPhoto: string;
  mutualConnections: number;
  location: string;
  skills: string[];
  status: 'connected' | 'pending' | 'not_connected';
  bio: string;
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
  isSaved?: boolean;
  applicantsCount?: number;
  matchScore?: number;
}

export interface AssessmentQuestion {
  id: number;
  dimension: 'Empathy & Discovery' | 'Analytical & Metrics' | 'Prioritization' | 'Stakeholder Management' | 'Execution & Delivery';
  scenario: string;
  options: {
    text: string;
    score: number; // 1 to 4
    rationale: string;
  }[];
}

export interface AssessmentResult {
  scorePercentage: number;
  archetype: string;
  summary: string;
  dimensionScores: {
    dimension: string;
    score: number; // 0-100%
  }[];
  strengths: string[];
  growthAreas: string[];
  recommendedRole: string;
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
