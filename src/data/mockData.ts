import { CommunityPost, PmConcept, JobListing, AssessmentQuestion } from '../types';

// Zero dummy posts - Start fresh with real user discussions
export const INITIAL_POSTS: CommunityPost[] = [];

// Zero dummy jobs - Start fresh with real user-posted opportunities
export const INITIAL_JOBS: JobListing[] = [];

// Popular PM topics for instant AI Copilot generation
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

// Seed starter concept for initial display if user hasn't queried yet
export const DEFAULT_STARTER_CONCEPT: PmConcept = {
  id: 'north-star-metric',
  term: 'North Star Metric (NSM)',
  category: 'Metrics & Data',
  quickSummary: 'The key metric that best captures the core value your product delivers to customers.',
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

export const INITIAL_CONCEPTS: PmConcept[] = [DEFAULT_STARTER_CONCEPT];

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    dimension: 'Empathy & Discovery',
    scenario: 'A major enterprise client threatens to cancel their contract unless you build a bespoke custom export button by next Friday. What do you do first?',
    options: [
      {
        text: 'Immediately schedule an engineer to build the button to prevent churn.',
        score: 1,
        rationale: 'Jumping straight to an unvalidated feature creates technical debt and treats symptoms rather than root causes.',
      },
      {
        text: 'Hop on a call with their end-users to understand the workflow and what data they actually need and why.',
        score: 4,
        rationale: 'Great PMs dig into the underlying problem and user journey before committing to custom solutions.',
      },
      {
        text: 'Tell the account executive to handle it because custom requests violate product roadmap purity.',
        score: 2,
        rationale: 'Dismissive of critical business retention and fails to collaborate with sales.',
      },
      {
        text: 'Check if another tool like Zapier or CSV download can solve it without writing code.',
        score: 3,
        rationale: 'Good pragmatic workaround, though discovering user context should happen first.',
      },
    ],
  },
  {
    id: 2,
    dimension: 'Analytical & Metrics',
    scenario: 'Your CEO points out that sign-ups increased by 40% this week and wants to double marketing spend immediately. How do you respond?',
    options: [
      {
        text: 'Celebrate and enthusiastically support doubling the marketing budget.',
        score: 1,
        rationale: 'Sign-ups are a vanity top-of-funnel metric without inspecting quality or downstream retention.',
      },
      {
        text: 'Analyze user cohort retention, activation rates, and source channel to see if these sign-ups are actually sticking.',
        score: 4,
        rationale: 'Exemplary data literacy: verifying whether growth is sustainable or a leaky bucket.',
      },
      {
        text: 'Wait 3 months before giving any opinion to see long-term numbers.',
        score: 2,
        rationale: 'Too slow and passive for modern product iteration.',
      },
      {
        text: 'Check server logs to ensure the infrastructure can handle increased traffic.',
        score: 2,
        rationale: 'Useful technical step, but misses the core business and user retention question.',
      },
    ],
  },
  {
    id: 3,
    dimension: 'Prioritization',
    scenario: 'You have 1 sprint left before a major product launch. The engineering lead informs you that 3 planned features cannot be completed in time. How do you decide?',
    options: [
      {
        text: 'Demand the engineering team work overtime over the weekend to deliver all three.',
        score: 1,
        rationale: 'Destroys squad trust, causes burnout, and indicates poor scoping.',
      },
      {
        text: 'Map each feature to customer critical path and launch goals, cut the lowest-impact ones, and define a solid MVP.',
        score: 4,
        rationale: 'Classic PM prioritization: ruthless focus on the minimum lovable product that fulfills the launch premise.',
      },
      {
        text: 'Postpone the entire launch by 2 months until every feature is 100% complete.',
        score: 2,
        rationale: 'Delaying launches for non-critical features burns momentum and delays user feedback.',
      },
      {
        text: 'Release the unfinished code and fix bugs as users report them.',
        score: 1,
        rationale: 'Shipping known broken user flows damages product trust.',
      },
    ],
  },
  {
    id: 4,
    dimension: 'Stakeholder Management',
    scenario: 'Your Head of Sales insists a proposed feature will unlock 5 enterprise deals, but your Design Lead says it completely ruins the UX. How do you navigate?',
    options: [
      {
        text: 'Side with Sales immediately because revenue is king.',
        score: 1,
        rationale: 'Short-sighted; eroding product integrity and user experience leads to catastrophic churn.',
      },
      {
        text: 'Side with Design and completely ignore Sales objections.',
        score: 1,
        rationale: 'Fails commercial reality; PMs must balance business viability with user experience.',
      },
      {
        text: 'Bring Design and Sales together, review the exact customer pain point, and co-design a prototype that solves the deal requirement without breaking UX.',
        score: 4,
        rationale: 'Masterful cross-functional synthesis: aligning stakeholders around shared problem discovery rather than taking sides.',
      },
      {
        text: 'Escalate to the CEO and ask them to make the final call.',
        score: 2,
        rationale: 'Abdication of PM ownership. Escalate only after exhausting collaborative consensus.',
      },
    ],
  },
  {
    id: 5,
    dimension: 'Execution & Delivery',
    scenario: 'Right after shipping a feature, your analytics dashboard shows an unexpected 12% drop in conversion on checkout. What is your immediate protocol?',
    options: [
      {
        text: 'Assume it is normal statistical noise and wait 2 weeks.',
        score: 1,
        rationale: 'Dangerous negligence during a critical revenue funnel drop.',
      },
      {
        text: 'Triage immediately with tech lead: check error logs, session replays, and rollback feature flag if a defect is identified.',
        score: 4,
        rationale: 'High agency: calm, rapid incident response with feature flag safety nets.',
      },
      {
        text: 'Blame the QA team in the public company Slack channel.',
        score: 1,
        rationale: 'Toxic blame culture that erodes psychological safety.',
      },
      {
        text: 'Immediately rewrite the entire feature from scratch tonight.',
        score: 2,
        rationale: 'Panic-driven reaction without identifying the root cause.',
      },
    ],
  },
];
