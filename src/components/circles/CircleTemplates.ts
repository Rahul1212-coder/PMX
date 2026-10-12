import { CircleCategory } from '@/types';

export interface CirclePurposeTemplate {
  id: string;
  name: string;
  icon: string;
  category: CircleCategory;
  defaultName: string;
  defaultDescription: string;
  defaultPurpose: string;
  recommendedMaxMembers: number;
  starterActivities: string[];
}

export const CIRCLE_TEMPLATES: CirclePurposeTemplate[] = [
  {
    id: 'teardown',
    name: 'Product Teardown Club',
    icon: '🔍',
    category: 'Product Teardown',
    defaultName: 'SaaS Teardowns & Growth Loops',
    defaultDescription: 'Weekly dissection of consumer & B2B software products. We analyze onboarding friction, retention hooks, and monetization triggers.',
    defaultPurpose: 'Conduct 1 high-depth product teardown session every week with actionable insights.',
    recommendedMaxMembers: 12,
    starterActivities: [
      'Nominate 3 candidate products for this week’s teardown',
      'Map the target user journey and onboarding steps',
      'Present prioritized recommendations and counter-metrics',
    ],
  },
  {
    id: 'mock-interview',
    name: 'Mock Interview Practice',
    icon: '🎯',
    category: 'Mock Interviews',
    defaultName: 'FAANG & Tier-1 PM Mock Syndicate',
    defaultDescription: 'Peer-to-peer 1:1 mock interview practice across Product Sense, Execution, Metrics RCA, and Technical PM rounds with live rubric feedback.',
    defaultPurpose: 'Practice 2 mock interviews per week with senior rubric evaluations.',
    recommendedMaxMembers: 8,
    starterActivities: [
      'Pair up with a partner for a 45-minute Product Sense mock',
      'Conduct an Execution & RCA metrics drop diagnosis drill',
      'Log rubric scores and improvement notes in Resources',
    ],
  },
  {
    id: 'case-study',
    name: 'Product Case Study Practice',
    icon: '📊',
    category: 'Case Study Practice',
    defaultName: 'PM Case Study & Take-Home Lab',
    defaultDescription: 'Solve realistic take-home PM assignments and company business cases collaboratively. Exchange feedback before formal interview submissions.',
    defaultPurpose: 'Draft, review, and refine 1 comprehensive case study per sprint.',
    recommendedMaxMembers: 10,
    starterActivities: [
      'Break down the take-home prompt and user personas',
      'Frame core trade-offs and go-to-market assumptions',
      'Conduct peer review of PRD and metrics dashboard',
    ],
  },
  {
    id: 'vibe-coding',
    name: 'Vibe Coding & Build Together',
    icon: '⚡',
    category: 'Vibe Coding & Build',
    defaultName: 'PM Vibe Coders & Micro-SaaS Builders',
    defaultDescription: 'Product Managers building real software with modern AI tooling (Cursor, Claude, Next.js, v0, Supabase). Share prototypes, debug prompt stacks, and ship together.',
    defaultPurpose: 'Build and launch working functional prototypes and AI experiments.',
    recommendedMaxMembers: 15,
    starterActivities: [
      'Share prototype concept, problem statement, and MVP scope',
      'Host weekend demo session with deployed preview links',
      'Review system prompts and UX latency optimizations',
    ],
  },
  {
    id: 'strategy',
    name: 'Product Strategy & Vision',
    icon: '🧭',
    category: 'Product Strategy',
    defaultName: 'Product Strategy & Competitive Moats',
    defaultDescription: 'Strategic discussions on AI defensibility, platform network effects, pricing power, and 2026 product operating models.',
    defaultPurpose: 'Sharpen executive narrative, positioning, and strategic decision-making.',
    recommendedMaxMembers: 12,
    starterActivities: [
      'Debate platform lock-in vs open ecosystem strategies',
      'Analyze quarterly earnings calls of major software companies',
    ],
  },
  {
    id: 'custom',
    name: 'Custom Circle',
    icon: '⭕',
    category: 'Custom',
    defaultName: 'My Product Circle',
    defaultDescription: 'A dedicated private group for our product squad, mastermind group, or peer accountability network.',
    defaultPurpose: 'Collaborate privately on product initiatives and shared learning.',
    recommendedMaxMembers: 20,
    starterActivities: [],
  },
];

// Structured post template structures
export const TEARDOWN_STRUCTURE = {
  product: '',
  targetUser: '',
  coreProblem: '',
  userJourney: '',
  whatWorksWell: '',
  whatCouldImprove: '',
  recommendations: '',
  metricsToTrack: '',
};

export const MOCK_INTERVIEW_STRUCTURE = {
  interviewType: 'Product Sense', // 'Product Sense' | 'Execution' | 'Strategy' | 'RCA' | 'Technical'
  interviewer: '',
  candidate: '',
  scheduledDate: '',
  casePrompt: '',
  rubricScore: 80,
  strengths: '',
  improvements: '',
  followUpActions: '',
};

export const VIBE_CODING_STRUCTURE = {
  projectName: '',
  problemStatement: '',
  mvpScope: '',
  techStack: 'Next.js + Supabase + Tailwind',
  teamMembers: '',
  liveUrl: '',
  repoUrl: '',
  progressStatus: 'Building MVP',
};
