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
