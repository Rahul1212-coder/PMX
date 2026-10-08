export interface CommunityPost {
  id: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar: string;
  };
  title: string;
  content: string;
  category: 'Strategy' | 'Execution' | 'AI & Tech' | 'Career & Transition' | 'Case Study';
  tags: string[];
  upvotes: number;
  hasUpvoted?: boolean;
  commentsCount: number;
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
  };
  content: string;
  createdAt: string;
  likes: number;
}

export interface PmConcept {
  id: string;
  term: string;
  category: 'Frameworks' | 'Metrics & Data' | 'Product Strategy' | 'Discovery & UX' | 'Execution';
  quickSummary: string;
  detailedDefinition: string;
  formulaOrSteps?: string;
  realWorldExample: string;
  commonPitfalls: string;
  interviewTip: string;
}

export interface JobListing {
  id: string;
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
