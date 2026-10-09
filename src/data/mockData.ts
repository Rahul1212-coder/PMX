import { CommunityPost, PmConcept, JobListing, AssessmentQuestion, PmConnection } from '../types';

export const INITIAL_POSTS: CommunityPost[] = [];

export const INITIAL_CONNECTIONS: PmConnection[] = [];

export const INITIAL_JOBS: JobListing[] = [];

export const POPULAR_PM_TOPICS: string[] = [
  'RICE Prioritization',
  'North Star Metric',
  'Kano Model',
  'Product-Led Growth (PLG)',
  'Jobs-To-Be-Done (JTBD)',
  'Cohort Retention Analysis',
  'HEART Framework',
  'DORA Metrics',
  'GIST Planning',
  'Opportunity Solution Tree',
  'MoSCoW Method',
  'AARRR Pirate Metrics',
];

export const DEFAULT_STARTER_CONCEPT: PmConcept = {
  id: 'north-star-metric',
  term: 'North Star Metric (NSM)',
  category: 'Metrics & Data',
  quickSummary: 'The single key metric that best captures the core value your product delivers to customers.',
  detailedDefinition: 'A North Star Metric aligns the entire company around sustainable customer value creation. It reflects customer value, measures progress, and directly correlates with long-term retention and revenue.',
  formulaOrSteps: [
    'Identify the core value moment your product delivers.',
    'Isolate the key user action that produces that value.',
    'Ensure it is a leading indicator of retention, not lagging revenue.',
    'Align engineering, design, and growth squads around this single focal point.',
  ],
  realWorldExample: 'Spotify tracks "Time spent listening to music", Airbnb tracks "Nights booked", and Slack tracks "Messages sent within team". Notice none of them use pure revenue as their North Star.',
  commonPitfalls: [
    'Picking a vanity metric (e.g. Total Registered Accounts).',
    'Choosing a lagging financial metric (e.g. Monthly ARR).',
    'Failing to communicate the metric across cross-functional teams.',
  ],
  interviewTip: 'In PM product design interviews, explicitly define your North Star Metric before suggesting specific feature solutions.',
};

export const INITIAL_CONCEPTS: PmConcept[] = [
  DEFAULT_STARTER_CONCEPT,
  {
    id: 'rice-framework',
    term: 'RICE Prioritization',
    category: 'Frameworks',
    quickSummary: 'A scoring model for prioritizing features based on Reach, Impact, Confidence, and Effort.',
    detailedDefinition: 'RICE is a quantitative framework popularized by Intercom. It removes subjective bias from roadmapping discussions by computing a single score: (Reach × Impact × Confidence) / Effort.',
    formulaOrSteps: [
      'Reach: Number of users impacted per time period (e.g. 5,000 users/month).',
      'Impact: Estimated customer benefit (0.25 minimal, 1 medium, 2 high, 3 massive).',
      'Confidence: Confidence in estimates (50% low, 80% medium, 100% high).',
      'Effort: Estimated engineering/squad person-months (e.g. 2 months).',
      'Formula: Score = (Reach × Impact × Confidence) / Effort',
    ],
    realWorldExample: 'A checkout optimization team evaluates a 1-click buy button vs adding PayPal. PayPal has higher reach (all international users) and high confidence, resulting in a higher RICE score despite moderate effort.',
    commonPitfalls: [
      'Over-inflating confidence scores without customer research.',
      'Treating the calculated number as absolute truth rather than a conversation starter.',
      'Failing to re-estimate effort with engineering leads.',
    ],
    interviewTip: 'When asked "How do you prioritize?", explain RICE but always caveat that strategic alignment and customer urgency must validate the formula.',
  },
  {
    id: 'kano-model',
    term: 'Kano Model',
    category: 'Frameworks',
    quickSummary: 'Classifies customer preferences into Basic (Must-be), Performance, and Delighters.',
    detailedDefinition: 'Developed by Noriaki Kano, this theory categorizes product features by how much satisfaction they produce relative to their implementation level.',
    formulaOrSteps: [
      '1. Must-Haves: No extra joy if present, extreme outrage if absent.',
      '2. Performance Features: Linear satisfaction (the faster/cheaper, the happier).',
      '3. Delighters: Unexpected joy that creates viral word-of-mouth.',
      '4. Indifferent: Features users do not care about either way.',
    ],
    realWorldExample: 'In a ride-sharing app: Clean car and safe arrival = Must-have; shorter arrival ETA = Performance; driver providing free phone charging cables = Delighter.',
    commonPitfalls: [
      'Forgetting that delighters degrade into must-haves over time (e.g. free Wi-Fi).',
      'Over-investing in delighters while basic table-stakes are buggy.',
    ],
    interviewTip: 'Use Kano to justify why your MVP prioritizes core table-stakes before shiny novelty features.',
  },
  {
    id: 'plg',
    term: 'Product-Led Growth (PLG)',
    category: 'Product Strategy',
    quickSummary: 'A go-to-market strategy where the product itself drives customer acquisition, retention, and expansion.',
    detailedDefinition: 'Unlike traditional top-down sales where reps demo before anyone touches software, PLG relies on self-serve onboarding, freemium or trial tiers, and rapid "time-to-value" to drive organic viral growth.',
    formulaOrSteps: [
      '1. Frictionless onboarding (no sales calls or credit cards required).',
      '2. Fast time-to-value (the "Aha!" moment in under 3 minutes).',
      '3. Viral loops / built-in collaborative invitations.',
      '4. Product Qualified Leads (PQL) routed to sales for enterprise expansion.',
    ],
    realWorldExample: 'Figma, Calendly, and Slack allow individual users or squads to get immediate utility for free, naturally pulling in coworkers until an enterprise upgrade is necessary.',
    commonPitfalls: [
      'Confusing PLG with having no sales team.',
      'Hiding the Aha! moment behind lengthy configuration forms.',
    ],
    interviewTip: 'Mention PLG when discussing conversion funnels, activation rates, and product virality loops.',
  },
  {
    id: 'cac-ltv',
    term: 'LTV / CAC Ratio',
    category: 'Metrics & Data',
    quickSummary: 'Ratio of Lifetime Value to Customer Acquisition Cost indicating unit economic health.',
    detailedDefinition: 'Measures how much net revenue a customer generates throughout their entire relationship with your product compared to the cost incurred to acquire them.',
    formulaOrSteps: [
      'CAC = Total Sales & Marketing Spend / Number of New Customers Acquired',
      'LTV = (Average Revenue Per User × Gross Margin) / Customer Churn Rate',
      'Healthy SaaS Benchmark: 3:1 or higher (LTV is 3x CAC). Payback period < 12 months.',
    ],
    realWorldExample: 'If a B2B SaaS spends $1,000 to acquire a customer who pays $100/mo and stays for 36 months ($3,600 LTV), the ratio is 3.6:1 — strong unit economics.',
    commonPitfalls: [
      'Excluding sales salaries and overhead from CAC calculations.',
      'Underestimating churn when projecting long-term LTV.',
    ],
    interviewTip: 'In monetization cases, balance feature investment against customer payback periods and lifetime retention.',
  },
];

import { PM_ASSESSMENT_QUESTIONS } from './assessmentQuestions';
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = PM_ASSESSMENT_QUESTIONS;
