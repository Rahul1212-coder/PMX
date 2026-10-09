import { CommunityPost, PmConcept, JobListing, AssessmentQuestion, PmConnection } from '../types';

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      name: 'Elena Rostova',
      role: 'Staff Product Manager',
      company: 'Stripe',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      headline: 'Staff PM @ Stripe | Ex-Google APM | Building Developer Infrastructure',
      isConnection: true,
    },
    title: 'How we shifted from output-driven roadmaps to 6-week problem bets',
    content: `For years, our engineering partners complained that the PRD backlog felt like an endless "feature factory". 

Last quarter, our squad made a hard pivot:
1. No more arbitrary Gantt charts with fixed delivery quarters.
2. We introduced 6-week "problem bets" with measurable customer outcomes (activation rate & checkout latency).
3. Engineers and designers join customer discovery sessions from Day 1.

The result?
→ 34% reduction in unvalidated code deployed to production.
→ Engineering squad engagement scores reached an all-time high.
→ Executive stakeholders now review outcomes rather than counting feature tickets.

What does your squad do to avoid falling into the feature factory trap? Let me know in the comments! 👇`,
    category: 'Strategy',
    tags: ['Roadmapping', 'OutcomesOverOutputs', 'ProductStrategy', 'FinTech'],
    upvotes: 384,
    hasUpvoted: false,
    userReaction: null,
    reactions: {
      likes: 240,
      celebrates: 64,
      insightfuls: 58,
      loves: 22,
    },
    commentsCount: 38,
    comments: [
      {
        id: 'c-1',
        postId: 'post-1',
        author: {
          name: 'Marcus Chen',
          role: 'Senior PM, GenAI @ Notion',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          company: 'Notion',
        },
        content: 'Huge plus one to having engineers on discovery calls. Nothing aligns technical trade-offs faster than watching a real user struggle with an unintuitive workflow.',
        createdAt: '1 hour ago',
        likes: 19,
      },
      {
        id: 'c-2',
        postId: 'post-1',
        author: {
          name: 'Maya Lin',
          role: 'Director of Product @ Figma',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
          company: 'Figma',
        },
        content: 'Elena, how do you handle executive requests that still demand exact launch dates for marketing campaigns during the 6-week bet?',
        createdAt: '45 mins ago',
        likes: 12,
      },
    ],
    createdAt: '2 hours ago',
    pinned: true,
  },
  {
    id: 'post-2',
    author: {
      name: 'Marcus Chen',
      role: 'Senior PM, GenAI',
      company: 'Notion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      headline: 'Senior PM, GenAI @ Notion | Ex-Meta | Human-AI Interaction & Prompt UX',
      isConnection: true,
    },
    title: 'Evaluating LLM latency vs accuracy in production: The PM playbook',
    content: `When users trigger an AI completion, perceived latency matters infinitely more than raw model parameter size.

We ran a 4-week experiment across 50,000 active workspaces:
• Progressive token streaming + optimistic UI skeleton updates increased completion retention by 34%.
• A 400ms delay before the first token caused a 21% bounce rate, even if the eventual output was 10% more comprehensive.

Key takeaway for AI Product Managers:
Don't optimize for single-shot perfection. Optimize for immediate time-to-first-token and actionable feedback loops. 

What metrics is your team using to benchmark AI feature health?`,
    category: 'AI & Tech',
    tags: ['AIAgents', 'LLMProductManagement', 'PerceivedLatency', 'NotionAI'],
    upvotes: 276,
    hasUpvoted: true,
    userReaction: 'insightful',
    reactions: {
      likes: 142,
      celebrates: 34,
      insightfuls: 88,
      loves: 12,
    },
    commentsCount: 24,
    comments: [
      {
        id: 'c-3',
        postId: 'post-2',
        author: {
          name: 'Alex Zhao',
          role: 'Head of AI Products @ Cursor',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          company: 'Cursor',
        },
        content: '100% agreed Marcus. Speculative decoding and fast local prefill are absolute must-haves for interactive developer workflows.',
        createdAt: '30 mins ago',
        likes: 14,
      },
    ],
    createdAt: '4 hours ago',
  },
  {
    id: 'post-3',
    author: {
      name: 'Sarah Jenkins',
      role: 'Lead Product Manager',
      company: 'Figma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      headline: 'Lead PM @ Figma | Ex-Airbnb APM | Design Systems & Collaborative Canvas',
      isConnection: false,
    },
    title: 'Hot take: The best PRDs are under 2 pages. Here is why.',
    content: `If your product requirement document is 25 pages long, one of two things is happening:
1. Nobody is reading it except you.
2. You are trying to solve engineering architecture in a PM spec.

A high-impact PRD should strictly answer 4 questions:
1. Problem: What user friction are we eliminating and what evidence validates it?
2. Why Now: How does this tie directly into this quarter's North Star metric?
3. Non-Goals: What are we explicitly NOT building in v1?
4. Success Metrics: What metric moves in 30 days if this hypothesis is correct?

Everything else belongs in Figma prototypes, API specs, and collaborative squad discussions. Agree or disagree?`,
    category: 'Execution',
    tags: ['PRDTemplates', 'ProductExecution', 'AgileProduct', 'Figma'],
    upvotes: 512,
    hasUpvoted: false,
    userReaction: null,
    reactions: {
      likes: 310,
      celebrates: 92,
      insightfuls: 78,
      loves: 32,
    },
    commentsCount: 65,
    createdAt: '7 hours ago',
  },
  {
    id: 'post-4',
    author: {
      name: 'Liam Vance',
      role: 'VP of Product',
      company: 'Linear',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      headline: 'VP of Product @ Linear | Systems Thinking | Craft & Developer Velocity',
      isConnection: false,
    },
    title: 'How we build software at Linear without traditional Scrum or story points',
    content: `A lot of PMs ask how Linear operates without daily standups, backlog grooming, or estimation poker.

Our philosophy is built around high agency:
• Small squads (1 PM, 1 Designer, 2-3 Engineers).
• 1-week or 2-week continuous cycles.
• We don't estimate story points; we estimate project scopes (Small, Medium, Large).
• Every engineer has direct customer access and product taste.

Process often exists to substitute for clarity of vision. When the problem is crystal clear, you need remarkably few ceremonies.`,
    category: 'Strategy',
    tags: ['LinearMethod', 'NoScrum', 'ProductLeadership', 'DeveloperTools'],
    upvotes: 620,
    hasUpvoted: false,
    userReaction: null,
    reactions: {
      likes: 380,
      celebrates: 110,
      insightfuls: 98,
      loves: 32,
    },
    commentsCount: 82,
    createdAt: '1 day ago',
  },
];

export const INITIAL_CONNECTIONS: PmConnection[] = [
  {
    id: 'conn-1',
    name: 'Maya Lin',
    headline: 'Director of Product @ Figma | Ex-Airbnb | Design & PLG',
    role: 'Director / VP of Product',
    company: 'Figma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=200&fit=crop',
    mutualConnections: 24,
    location: 'San Francisco, CA',
    skills: ['Product-Led Growth', 'Design Systems', 'Enterprise Monetization'],
    status: 'not_connected',
    bio: 'Leading collaboration & canvas product initiatives at Figma. Passionate about craftsmanship and user delight.',
  },
  {
    id: 'conn-2',
    name: 'David Kim',
    headline: 'Principal PM @ Stripe | Payments & Global Banking Infrastructure',
    role: 'Lead / Principal PM',
    company: 'Stripe',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=200&fit=crop',
    mutualConnections: 18,
    location: 'Seattle, WA',
    skills: ['Fintech Infrastructure', 'API Design', 'System Architecture'],
    status: 'not_connected',
    bio: 'Scaling global money movement rails. Focused on developer empathy, fault tolerance, and zero-downtime releases.',
  },
  {
    id: 'conn-3',
    name: 'Ananya Sharma',
    headline: 'Senior PM, Core Growth @ Uber | Ex-Flipkart | Marketplace Funnels',
    role: 'Senior PM',
    company: 'Uber',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=200&fit=crop',
    mutualConnections: 31,
    location: 'New York, NY',
    skills: ['Marketplace Dynamics', 'Experimentation / A/B', 'Cohort Retention'],
    status: 'connected',
    bio: 'Optimizing supply-demand matching engines and rider lifecycle economics.',
  },
  {
    id: 'conn-4',
    name: 'Jordan Hayes',
    headline: 'Lead Technical PM @ Datadog | Developer Observability & Cloud Platforms',
    role: 'Lead / Principal PM',
    company: 'Datadog',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=200&fit=crop',
    mutualConnections: 12,
    location: 'Boston, MA',
    skills: ['Telemetry', 'Distributed Systems', 'DevOps Tools'],
    status: 'pending',
    bio: 'Ex-Distributed Systems Engineer turned Technical PM. Obsessed with high cardinality metrics.',
  },
  {
    id: 'conn-5',
    name: 'Claire Dupont',
    headline: 'Associate PM @ Monzo | Personal Finance & Wealth Vaults',
    role: 'Associate PM',
    company: 'Monzo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=200&fit=crop',
    mutualConnections: 8,
    location: 'London, UK',
    skills: ['Consumer FinTech', 'User Research', 'SQL & Metabase'],
    status: 'not_connected',
    bio: 'Recent APM cohort member passionate about making budgeting delightful and stress-free for everyday banking.',
  },
  {
    id: 'conn-6',
    name: 'Alex Zhao',
    headline: 'Head of AI Products @ Cursor / Anysphere | GenAI Developer Velocity',
    role: 'Director / VP of Product',
    company: 'Cursor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=200&fit=crop',
    mutualConnections: 45,
    location: 'San Francisco, CA',
    skills: ['AI Coding Agents', 'LLM Evaluation', 'Developer Experience'],
    status: 'not_connected',
    bio: 'Building the next era of AI-native code editing and autonomous pair programming.',
  },
];

export const INITIAL_JOBS: JobListing[] = [
  {
    id: 'job-1',
    title: 'Senior Product Manager - AI Workflows',
    company: 'Linear',
    logo: '⚡',
    level: 'Senior PM',
    domain: 'Developer Tools',
    location: 'San Francisco, CA / Remote',
    type: 'Remote',
    salaryRange: '$180,000 - $225,000 + Equity',
    postedDate: '1 day ago',
    featured: true,
    description: 'We are seeking an experienced product manager to lead our intelligence features, automating triage and sprint cycles for over 50,000 engineering squads.',
    skills: ['AI/LLM Workflows', 'Developer Empathy', 'System Design', 'B2B SaaS'],
    applyUrl: '#',
    applicantsCount: 48,
    matchScore: 94,
  },
  {
    id: 'job-2',
    title: 'Associate Product Manager (APM)',
    company: 'Monzo',
    logo: '💳',
    level: 'Associate PM',
    domain: 'Fintech',
    location: 'London, UK / Hybrid',
    type: 'Hybrid',
    salaryRange: '£60,000 - £75,000 + Equity',
    postedDate: '2 days ago',
    featured: true,
    description: 'Join our rotational APM cohort working across personal finance management, savings vaults, and open banking integrations. Open to new grads and career switchers.',
    skills: ['Data Analysis', 'User Research', 'SQL', 'Product Discovery'],
    applyUrl: '#',
    applicantsCount: 112,
    matchScore: 88,
  },
  {
    id: 'job-3',
    title: 'Staff Product Manager - Growth & Monetization',
    company: 'Figma',
    logo: '🎨',
    level: 'Lead / Principal PM',
    domain: 'B2B SaaS',
    location: 'San Francisco, CA / Remote',
    type: 'Remote',
    salaryRange: '$210,000 - $260,000 + Equity',
    postedDate: '3 days ago',
    featured: true,
    description: 'Drive conversion, packaging, and international pricing experiments for Figma Pro & Organization reaching millions of creators globally.',
    skills: ['Experimentation / AB Testing', 'Pricing & Packaging', 'PLG', 'Funnel Optimization'],
    applyUrl: '#',
    applicantsCount: 76,
    matchScore: 91,
  },
  {
    id: 'job-4',
    title: 'Product Manager - Telehealth & Patient Experience',
    company: 'Ro Health',
    logo: '🌿',
    level: 'Product Manager',
    domain: 'Healthtech',
    location: 'New York, NY',
    type: 'Hybrid',
    salaryRange: '$145,000 - $175,000',
    postedDate: '4 days ago',
    featured: false,
    description: 'Design empathetic, compliant telehealth consultations and prescription adherence tools with healthcare providers and clinical research squads.',
    skills: ['Regulatory / Compliance', 'Mobile UX', 'User Journey Mapping', 'Sprint Planning'],
    applyUrl: '#',
    applicantsCount: 39,
    matchScore: 82,
  },
  {
    id: 'job-5',
    title: 'Principal PM - Cloud Observability',
    company: 'Datadog',
    logo: '🐶',
    level: 'Lead / Principal PM',
    domain: 'Developer Tools',
    location: 'Boston, MA / Remote',
    type: 'Remote',
    salaryRange: '$220,000 - $275,000 + Equity',
    postedDate: '5 days ago',
    featured: false,
    description: 'Own the strategy for distributed trace analysis and real-time anomaly detection pipelines processing trillions of events daily.',
    skills: ['Distributed Systems', 'Cloud Telemetry', 'Enterprise B2B', 'High Scale'],
    applyUrl: '#',
    applicantsCount: 29,
    matchScore: 86,
  },
];

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
