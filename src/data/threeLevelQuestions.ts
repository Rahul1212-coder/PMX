import {
  AssessmentLevelConfig,
  AssessmentQuestion,
  AssessmentLevelId,
  RubricDimension,
} from '@/types/assessment';

export const STANDARD_CASE_RUBRIC: RubricDimension[] = [
  {
    id: 'problem_framing',
    name: 'Problem Framing and Assumptions',
    weight: 20,
    description:
      'Diagnoses the core underlying business and product breakdown, states testable assumptions, and avoids superficial symptom treatments.',
  },
  {
    id: 'analytical_reasoning',
    name: 'Analytical Reasoning and Evidence',
    weight: 25,
    description:
      'Applies rigorous quantitative reasoning, segment/cohort decomposition, unit economics (CAC, LTV, payback), and data-driven inference.',
  },
  {
    id: 'decision_quality',
    name: 'Decision Quality and Trade-offs',
    weight: 25,
    description:
      'Delivers an unambiguous, defensible recommendation with explicit acknowledgment of downside risks, opportunity costs, and strategic trade-offs.',
  },
  {
    id: 'validation_metrics',
    name: 'Validation Plan and Success Metrics',
    weight: 20,
    description:
      'Establishes leading/lagging KPIs, statistical guardrails, rollback triggers, and staged go/no-go milestones to de-risk execution.',
  },
  {
    id: 'communication_clarity',
    name: 'Communication and Clarity',
    weight: 10,
    description:
      'Structured, crisp executive-level memo free from fluff, generic frameworks, or hand-waving assertions.',
  },
];

export const ASSESSMENT_LEVEL_CONFIGS: Record<AssessmentLevelId, AssessmentLevelConfig> = {
  beginner: {
    id: 'beginner',
    title: 'Beginner — Product Management Foundations',
    subtitle: 'Core concepts, customer discovery, MVPs, and metrics for aspiring PMs',
    difficulty: 'Easy',
    questionCount: 15,
    durationMinutes: 20,
    passingScorePercent: 70,
    formatDescription: '15 scenario-based & practical multiple choice questions',
    focusDescription:
      'Product Manager responsibilities, customer discovery, user problems, MVPs, user stories, acceptance criteria, roadmaps, basic product metrics, and Agile fundamentals.',
    topics: [
      'Product Manager Responsibilities & Collaboration',
      'User Problem Validation & Discovery Fundamentals',
      'Minimum Viable Products (MVPs) & Feature Prioritization',
      'User Stories, Personas & Acceptance Criteria',
      'Product Roadmaps, PRDs & Release Planning',
      'Basic Product Metrics (Conversion, Churn, DAU/MAU)',
      'Agile Ceremonies & Sprint Execution',
    ],
    competencyWeights: {
      'Product Sense & User Empathy': 0.25,
      'Data & Analytical Thinking': 0.2,
      'Prioritization & Execution': 0.2,
      'Strategy & Business Thinking': 0.15,
      'Communication & Decision-Making': 0.2,
    },
  },
  intermediate: {
    id: 'intermediate',
    title: 'Intermediate — Practical Product Management',
    subtitle: 'Feature prioritization, funnel analytics, adoption, and sprint trade-offs',
    difficulty: 'Medium',
    questionCount: 15,
    durationMinutes: 30,
    passingScorePercent: 70,
    formatDescription: '15 scenario-based MCQs, funnel analytics, and prioritization trade-offs',
    focusDescription:
      'Practical product decisions, RICE scoring, funnel drop-off diagnostics, A/B test guardrails, feature adoption, sprint scope negotiation, technical debt trade-offs, and CAC payback calculations.',
    topics: [
      'Feature Prioritization & RICE Score Calculations',
      'Funnel & Conversion Drop-Off Diagnostics',
      'Product Adoption, Activation & Retention Metrics',
      'A/B Testing Interpretation & Guardrail Metrics',
      'Sprint Scope Negotiation & Capacity Constraints',
      'Technical Debt vs Feature Velocity Balancing',
      'Customer Acquisition Cost (CAC) & Payback Period',
      'B2B Customer Requests vs Scalable Platform Capabilities',
    ],
    competencyWeights: {
      'Product Sense & User Empathy': 0.2,
      'Data & Analytical Thinking': 0.25,
      'Prioritization & Execution': 0.25,
      'Strategy & Business Thinking': 0.15,
      'Communication & Decision-Making': 0.15,
    },
    prerequisiteLevelId: 'beginner',
  },
  advanced: {
    id: 'advanced',
    title: 'Advanced — Experienced Product Management',
    subtitle: 'Strategic roadmap ownership, unit economics, platform trade-offs, and written cases',
    difficulty: 'Hard',
    questionCount: 10,
    durationMinutes: 40,
    passingScorePercent: 70,
    formatDescription: '6 scenario/analytical MCQs and 4 written strategic case studies',
    focusDescription:
      'Strategic roadmap ownership, enterprise customization trade-offs, consumption pricing transitions, experiment metric conflicts, two-sided marketplace liquidity, technical architecture staging, and four written strategic cases evaluated by rubrics.',
    topics: [
      'Enterprise Customization vs Scalable Roadmap Ownership',
      'Monetization Strategy & Pricing Model Transitions',
      'Multi-Objective Experimentation & Cohort Economics',
      'Two-Sided Marketplace Liquidity & Incentive Alignment',
      'Architectural Technical Debt Staging & High-Beta Bets',
      'AI Product Safety, Confidence Gating & Risk Governance',
      'Written Strategic Cases: Growth/NRR, Experiments, Platform Economics, AI Risk',
    ],
    competencyWeights: {
      'Product Sense & User Empathy': 0.15,
      'Data & Analytical Thinking': 0.2,
      'Prioritization & Execution': 0.2,
      'Strategy & Business Thinking': 0.25,
      'Communication & Decision-Making': 0.2,
    },
    prerequisiteLevelId: 'intermediate',
  },
};

export const INITIAL_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // =========================================================================
  // BEGINNER LEVEL (15 QUESTIONS: 12 SCENARIO MCQs + 3 ANALYTICAL CALCULATIONS)
  // Answer key distribution: A: 4, B: 4, C: 4, D: 3
  // =========================================================================
  {
    id: 'beg-1',
    levelId: 'beginner',
    orderIndex: 1,
    title: 'Validating Customer Discovery Problems',
    scenario:
      'A food delivery app receives multiple complaints through customer support that users cannot easily find vegetarian restaurants in their neighborhood.',
    questionText: 'What is the best first step for the Product Manager?',
    difficulty: 'easy',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Build a dedicated vegetarian restaurant filter immediately on the home screen.' },
      { key: 'B', text: 'Investigate how users currently search for vegetarian restaurants and validate the problem before deciding on a solution.' },
      { key: 'C', text: 'Redesign the entire restaurant discovery page to emphasize dietary categories.' },
      { key: 'D', text: 'Ask the engineering team to estimate all possible UI solutions.' },
    ],
    correctOption: 'B',
    explanation:
      'The Product Manager should understand and validate the user problem before committing engineering resources to a specific solution. While a dedicated filter may eventually be the right feature, analyzing current user search queries and drop-offs establishes the true customer need first.',
    optionExplanations: {
      A: 'Jumping straight into building a feature without investigating user behavior risks building the wrong solution.',
      B: 'Correct. Product discovery requires validating the underlying user struggle and observing existing workarounds before committing to an implementation.',
      C: 'Redesigning the entire page is massive scope creep for an unvalidated customer complaint.',
      D: 'Asking engineering to estimate arbitrary solutions wastes technical capacity before requirements are defined.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['discovery', 'problem-validation', 'user-empathy'],
  },
  {
    id: 'beg-2',
    levelId: 'beginner',
    orderIndex: 2,
    title: 'Calculating Funnel Conversion Rates',
    scenario:
      'An e-commerce website tracking its checkout funnel records 10,000 visitors arriving on its product catalog page in a week. Of those visitors, 2,000 add an item to their shopping cart, and 500 complete a purchase.',
    questionText:
      'What is the overall visitor-to-purchase conversion rate, and what is the cart-to-purchase conversion rate?',
    difficulty: 'easy',
    competency: 'Data & Analytical Thinking',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Visitor-to-purchase is 20%; cart-to-purchase is 50%.' },
      { key: 'B', text: 'Visitor-to-purchase is 2%; cart-to-purchase is 10%.' },
      { key: 'C', text: 'Visitor-to-purchase is 5%; cart-to-purchase is 25%.' },
      { key: 'D', text: 'Visitor-to-purchase is 10%; cart-to-purchase is 20%.' },
    ],
    correctOption: 'C',
    explanation:
      'Visitor-to-purchase conversion = (500 purchases / 10,000 visitors) = 5.0%. Cart-to-purchase conversion = (500 purchases / 2,000 cart additions) = 25.0%. Understanding multi-step funnels allows PMs to pinpoint whether top-of-funnel discovery or bottom-of-funnel checkout has the biggest drop-off.',
    optionExplanations: {
      A: 'Calculates cart additions over visitors (2,000/10,000 = 20%) instead of purchases.',
      B: 'Arithmetic error placing decimal point incorrectly.',
      C: 'Correct. 500 / 10,000 = 5% overall conversion, and 500 / 2,000 = 25% cart conversion.',
      D: 'Uses incorrect denominators for both conversion steps.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['metrics', 'funnel-analysis', 'conversion-rate'],
  },
  {
    id: 'beg-3',
    levelId: 'beginner',
    orderIndex: 3,
    title: 'Defining a True Minimum Viable Product (MVP)',
    scenario:
      'A fitness startup wants to launch an app that connects local personal trainers with clients. The founders propose building integrated video calling, automated calendar syncing, customized workout logs, and an in-app payment processor before launching to any users.',
    questionText: 'What should the Product Manager recommend to create a true Minimum Viable Product (MVP)?',
    difficulty: 'easy',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Launch a simple web directory with a basic booking form to test whether users actually want to find and book local trainers before building custom video and calendar features.' },
      { key: 'B', text: 'Build all planned features simultaneously, but restrict access to an exclusive beta of 50 users.' },
      { key: 'C', text: 'Launch with only the workout log feature because it takes the least engineering effort to build.' },
      { key: 'D', text: 'Delay launch until all features are fully automated and secure venture funding for a nationwide marketing campaign.' },
    ],
    correctOption: 'A',
    explanation:
      'The purpose of an MVP is to test the core value hypothesis with the minimum effort and learning time. A simple directory with a booking form directly validates whether clients want to connect with trainers, without wasting months building unvalidated video or scheduling tools.',
    optionExplanations: {
      A: 'Correct. An MVP tests the core assumption (do clients want to book local trainers?) with minimal software development.',
      B: 'Building all complex features upfront is not an MVP; it builds the entire product before validating core demand.',
      C: 'Building only workout logging does not test the marketplace connection between clients and trainers.',
      D: 'Delays learning and increases financial risk by building software without user validation.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['mvp', 'lean-product', 'validation'],
  },
  {
    id: 'beg-4',
    levelId: 'beginner',
    orderIndex: 4,
    title: 'Applying User Personas to Feature Decisions',
    scenario:
      'A personal finance app is designed for "College Student Sam," who has limited funds and needs quick alerts when his account balance drops below ₹1,000. A stakeholder requests adding automated crypto tax-loss harvesting into the primary onboarding screen.',
    questionText: 'How should the PM evaluate this feature request using personas?',
    difficulty: 'easy',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Implement it immediately because cryptocurrency features are trendy and generate press coverage.' },
      { key: 'B', text: 'Make the crypto tax screen mandatory for all new users to educate them on tax laws.' },
      { key: 'C', text: 'Reject the request permanently because no user will ever care about taxes.' },
      { key: 'D', text: 'Recognize that this feature does not address Sam\'s primary need and creates cognitive overload during onboarding; if built, place it in an optional advanced section.' },
    ],
    correctOption: 'D',
    explanation:
      'User personas protect the core user experience from feature creep. College Student Sam needs simple balance alerts to avoid overdrafts; forcing complex tax-loss harvesting into onboarding creates confusion and causes drop-off.',
    optionExplanations: {
      A: 'Chasing industry buzzwords without aligning to the target user persona harms product focus.',
      B: 'Forcing irrelevant complex screens during onboarding causes severe user drop-off.',
      C: 'Outright permanent rejection without understanding potential secondary personas is unnecessarily close-minded.',
      D: 'Correct. Personas guide prioritizing relevant features while keeping irrelevant tools out of the core critical path.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['personas', 'onboarding', 'user-experience'],
  },
  {
    id: 'beg-5',
    levelId: 'beginner',
    orderIndex: 5,
    title: 'Writing Effective Acceptance Criteria',
    scenario:
      'A Product Manager writes this user story for the engineering team: "As a registered user, I want to reset my password easily so that I do not get locked out of my account." During sprint demo, the engineers present a screen that tells users to email customer support manually to reset passwords.',
    questionText: 'What went wrong, and how should the PM prevent this in the future?',
    difficulty: 'easy',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'The engineers acted in bad faith; the PM should escalate to the VP of Engineering immediately.' },
      { key: 'B', text: 'The user story lacked clear acceptance criteria specifying the automated workflow, email verification link, and security error states.' },
      { key: 'C', text: 'The PM should have written the SQL database queries and backend code directly in the story description.' },
      { key: 'D', text: 'User stories should never include customer goals; they should only contain UI screenshots.' },
    ],
    correctOption: 'B',
    explanation:
      'User stories describe the "who" and "why," but acceptance criteria define the boundaries and conditions of satisfaction. Without acceptance criteria detailing an automated email reset link and token expiration, the requirement was ambiguous.',
    optionExplanations: {
      A: 'Blaming engineers reflects poor communication; the root cause was ambiguous product requirements.',
      B: 'Correct. Clear acceptance criteria (Given/When/Then or bulleted functional rules) remove ambiguity and ensure shared understanding.',
      C: 'PMs define the functional requirements and user outcomes, not the internal code implementation.',
      D: 'User goals are the core purpose of user stories; removing them leads to disconnected feature outputs.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['user-stories', 'acceptance-criteria', 'scrum'],
  },
  {
    id: 'beg-6',
    levelId: 'beginner',
    orderIndex: 6,
    title: 'Understanding the Core Role of a Product Manager',
    scenario:
      'In a sprint kickoff meeting, the lead engineer wants to rewrite the database in a new language, the UI designer wants to rebuild the icon set, and the sales lead insists on building a custom feature for a single client.',
    questionText: 'What is the primary responsibility of the Product Manager in this situation?',
    difficulty: 'easy',
    competency: 'Communication & Decision-Making',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Guide the team toward the solution that best balances customer value, business viability, and team feasibility, clearly explaining the "why" behind priorities.' },
      { key: 'B', text: 'Dictate the technical architecture and tell the engineers which programming language to write.' },
      { key: 'C', text: 'Create daily timesheets and micromanage how many hours each team member spends at their desk.' },
      { key: 'D', text: 'Agree to every stakeholder request in the chronological order they were submitted.' },
    ],
    correctOption: 'A',
    explanation:
      'A Product Manager sits at the intersection of UX, technology, and business. Their primary role is defining the "why," "what," and "when," aligning cross-functional teams around customer problems and measurable business impact.',
    optionExplanations: {
      A: 'Correct. The PM provides strategic alignment, customer context, and objective prioritization to guide cross-functional teams.',
      B: 'Technical architecture decisions belong to engineering leads and architects.',
      C: 'Micromanaging daily hours is project policing, not product leadership.',
      D: 'Accepting all requests uncritically turns the team into a reactive "feature factory."',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['pm-role', 'leadership', 'cross-functional'],
  },
  {
    id: 'beg-7',
    levelId: 'beginner',
    orderIndex: 7,
    title: 'Calculating and Evaluating Monthly Churn Rate',
    scenario:
      'A subscription software product begins the month of July with 800 active paying customers. During July, 40 of those existing customers cancel their subscriptions, while 100 brand-new customers subscribe.',
    questionText: 'What is the customer churn rate for July, and how should the PM evaluate customer retention?',
    difficulty: 'easy',
    competency: 'Data & Analytical Thinking',
    format: 'analytical',
    options: [
      { key: 'A', text: '12.5% churn rate; the business is losing customers faster than it acquires them.' },
      { key: 'B', text: '5.0% churn rate; calculated as (40 cancellations / 800 starting customers), with a net customer gain of 60 users.' },
      { key: 'C', text: '-7.5% churn rate; because new signups exceeded cancellations, churn is negative.' },
      { key: 'D', text: '4.0% churn rate; calculated as 40 cancellations divided by 1,000 cumulative signups.' },
    ],
    correctOption: 'B',
    explanation:
      'Customer churn rate measures the percentage of existing customers lost over a specific period: (Lost Customers / Starting Customers) = 40 / 800 = 5.0%. Even though 100 new users joined (reaching 860 total customers, a net gain of 60), tracking churn independently is essential to ensure the product is not leaking users.',
    optionExplanations: {
      A: 'Incorrectly divides 100 new signups by 800 starting customers.',
      B: 'Correct. Churn rate = 40 / 800 = 5.0% monthly churn, alongside a net addition of 60 customers.',
      C: 'Customer churn rate cannot be negative; net revenue churn can be negative with expansion, but lost customers is an absolute count.',
      D: 'Uses an arbitrary cumulative denominator rather than the active cohort base.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['churn', 'metrics', 'retention'],
  },
  {
    id: 'beg-8',
    levelId: 'beginner',
    orderIndex: 8,
    title: 'The Purpose and Structure of a Product Roadmap',
    scenario:
      'An executive asks the Product Manager: "Can you provide a roadmap committing exact feature release dates for every sprint over the next 12 months so our sales team can guarantee them to prospective clients?"',
    questionText: 'What is the most appropriate way for the PM to explain the purpose of a product roadmap?',
    difficulty: 'easy',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Agree immediately and commit to fixed release dates for the full year, assuming no bugs will occur.' },
      { key: 'B', text: 'Refuse to share any product plans because software development is completely random and unpredictable.' },
      { key: 'C', text: 'Present an outcome-oriented roadmap structured by strategic themes and time horizons (e.g. Now / Next / Later), explaining that near-term plans have high certainty while distant horizons adapt to user learning.' },
      { key: 'D', text: 'Send the raw engineering sprint backlog of Jira tickets to clients and let them estimate delivery dates.' },
    ],
    correctOption: 'C',
    explanation:
      'A product roadmap is a strategic communication tool that articulates product direction and outcomes, not a rigid 12-month delivery contract. Organizing by Now/Next/Later communicates certainty near-term while preserving agility to respond to user discoveries.',
    optionExplanations: {
      A: 'Committing to 12 months of fixed feature dates sets up guaranteed broken promises and technical debt.',
      B: 'Refusing strategic communication creates organizational distrust and alienates sales leadership.',
      C: 'Correct. Modern roadmaps focus on problems to solve and outcomes, using time horizons to reflect increasing uncertainty.',
      D: 'Raw engineering tickets confuse stakeholders and abdicate product communication responsibilities.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['roadmap', 'strategy', 'stakeholders'],
  },
  {
    id: 'beg-9',
    levelId: 'beginner',
    orderIndex: 9,
    title: 'Prioritizing Features with Value vs Effort',
    scenario:
      'A PM is planning a 2-week sprint with total engineering capacity for 10 story points. The team has three candidate items:\n• Item X: High customer value, Low effort (3 points)\n• Item Y: High customer value, Medium effort (5 points)\n• Item Z: Low customer value, High effort (8 points)',
    questionText: 'Which combination delivers the highest customer value while respecting the 10-point capacity?',
    difficulty: 'easy',
    competency: 'Prioritization & Execution',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Item Z only (8 points), because high-effort items must always be tackled first.' },
      { key: 'B', text: 'Item Y only (5 points), leaving 5 points unallocated so the team works slowly.' },
      { key: 'C', text: 'Half of Item Z (4 points) and Item Y (5 points), shipping partial un-tested features.' },
      { key: 'D', text: 'Item X (3 points) and Item Y (5 points), totaling 8 points of high-value deliverables while staying safely within sprint capacity.' },
    ],
    correctOption: 'D',
    explanation:
      'Item X and Item Y together deliver maximum customer value (both are High Value) for a total of 8 story points, fitting comfortably within the 10-point capacity. Item Z is a classic "money pit" (High Effort, Low Value) and should be deprioritized.',
    optionExplanations: {
      A: 'Item Z consumes 80% of capacity for low customer value, which is poor prioritization.',
      B: 'Under-allocates sprint capacity without delivering Item X (a quick, high-value win).',
      C: 'Shipping half-built, un-testable features creates defects and incomplete customer experiences.',
      D: 'Correct. Maximizes delivered user value (Item X + Item Y = 8 points) within available engineering capacity.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['prioritization', 'value-vs-effort', 'sprint-planning'],
  },
  {
    id: 'beg-10',
    levelId: 'beginner',
    orderIndex: 10,
    title: 'Conducting Unbiased Customer Interviews',
    scenario:
      'A PM wants to understand why users are abandoning a podcast mobile app after listening to only one episode. The PM schedules discovery interviews with 8 churned users.',
    questionText: 'Which question should the PM ask to uncover genuine customer insights without biasing the answers?',
    difficulty: 'easy',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: '"Can you walk me through the last time you opened the app to find a podcast, from when you searched to when you decided to stop listening?"' },
      { key: 'B', text: '"Wouldn\'t you agree that our recommendation algorithm is much better than Spotify\'s?"' },
      { key: 'C', text: '"If we added a social points system with free stickers, would you listen to podcasts every single day?"' },
      { key: 'D', text: '"Our user interface is very clean and easy to navigate, right?"' },
    ],
    correctOption: 'A',
    explanation:
      'Effective customer discovery focuses on actual past behavior and specific experiences rather than speculative opinions. Asking the user to walk through their last real attempt reveals friction, unfulfilled expectations, and genuine habits without leading the witness.',
    optionExplanations: {
      A: 'Correct. Open-ended inquiries anchored in specific past behavior yield authentic, unbiased customer insights.',
      B: 'A leading question that seeks validation rather than truth.',
      C: 'Asks users to predict future speculative behavior, which consistently produces false positives.',
      D: 'A leading question prompting the user to agree politely.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['customer-discovery', 'interviews', 'user-empathy'],
  },
  {
    id: 'beg-11',
    levelId: 'beginner',
    orderIndex: 11,
    title: 'Managing Conflicting Stakeholder Deadlines',
    scenario:
      'Two days before a planned mobile release, the Head of Marketing asks to insert a promotional banner on the home screen. Engineering warns that inserting the banner will require full regression testing and delay the app store release by three days.',
    questionText: 'What is the most constructive action for the Product Manager?',
    difficulty: 'easy',
    competency: 'Communication & Decision-Making',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Silently delay the release without notifying other teams so Marketing gets their banner.' },
      { key: 'B', text: 'Aggressively reject the request and tell Marketing they have no right to suggest product changes.' },
      { key: 'C', text: 'Clearly explain the trade-off to Marketing: explain that including the banner delays the launch by 3 days, and offer to ship the current release on schedule while queuing the banner for the immediate next release.' },
      { key: 'D', text: 'Push the banner into the build without re-testing the checkout flow to satisfy both deadlines.' },
    ],
    correctOption: 'C',
    explanation:
      'Professional stakeholder collaboration requires transparently communicating trade-offs, consequences, and alternative options. By explaining the 3-day regression delay and offering a fast follow-up release, the PM protects product quality while remaining a collaborative partner.',
    optionExplanations: {
      A: 'Secret delays breach trust across the organization and blindside leadership.',
      B: 'Hostile communication damages cross-functional collaboration.',
      C: 'Correct. Explains trade-offs objectively and provides a realistic alternative that protects launch stability.',
      D: 'Bypassing regression testing risks shipping critical checkout bugs to production.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['stakeholder-management', 'trade-offs', 'communication'],
  },
  {
    id: 'beg-12',
    levelId: 'beginner',
    orderIndex: 12,
    title: 'Interpreting the DAU/MAU Stickiness Ratio',
    scenario:
      'A daily messaging app reports 300,000 Daily Active Users (DAU) and 600,000 Monthly Active Users (MAU). Meanwhile, an online tax filing app reports 50,000 DAU and 1,000,000 MAU during tax season.',
    questionText: 'How should a Product Manager interpret these metrics in the context of each product category?',
    difficulty: 'easy',
    competency: 'Data & Analytical Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'The messaging app has a 50% DAU/MAU ratio, reflecting strong daily habit formation appropriate for communication, while the tax app\'s 5% ratio reflects natural, seasonal utility.' },
      { key: 'B', text: 'The tax filing app is an objective failure because any digital product with DAU/MAU below 20% should be shut down.' },
      { key: 'C', text: 'Both products have identical engagement because only total monthly user count matters in software.' },
      { key: 'D', text: 'The messaging app\'s DAU/MAU ratio is 200%, indicating users log in twice per month.' },
    ],
    correctOption: 'A',
    explanation:
      'The DAU/MAU ratio (stickiness) measures how frequently monthly users return on a daily basis (300k / 600k = 50% for messaging; 50k / 1M = 5% for tax). Product engagement must be interpreted in light of the natural usage frequency of the problem being solved.',
    optionExplanations: {
      A: 'Correct. Contextualizes engagement metrics against the natural problem frequency (daily communication vs annual taxes).',
      B: 'Fails to recognize that tax software does not require daily usage to provide massive customer value.',
      C: 'Ignores customer retention and engagement frequency dynamics entirely.',
      D: 'Calculates the ratio upside-down; DAU cannot exceed MAU.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['dau-mau', 'engagement', 'metrics'],
  },
  {
    id: 'beg-13',
    levelId: 'beginner',
    orderIndex: 13,
    title: 'Setting Meaningful Feature Success Metrics',
    scenario:
      'A music streaming service launches a "Collaborative Playlists" feature allowing friends to add songs to a shared playlist.',
    questionText: 'Which metric is the most effective primary success metric to evaluate whether this feature achieves its intended user outcome?',
    difficulty: 'easy',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Total number of app downloads from the App Store during launch week.' },
      { key: 'B', text: 'Total lines of code written by the engineering squad to build the feature.' },
      { key: 'C', text: 'The number of social media likes on the company\'s product announcement post.' },
      { key: 'D', text: 'Percentage of active users who create or add a song to a collaborative playlist and return to listen within 14 days.' },
    ],
    correctOption: 'D',
    explanation:
      'Effective product metrics measure actual user adoption and repeat engagement tied directly to the feature value proposition. App downloads are top-of-funnel marketing metrics, lines of code are engineering output, and social likes are vanity metrics.',
    optionExplanations: {
      A: 'Downloads reflect marketing ad spend and acquisition, not whether users find the playlist feature valuable.',
      B: 'Lines of code measure development effort, not customer value or outcomes.',
      C: 'Social likes are surface-level vanity metrics disconnected from in-app product usage.',
      D: 'Correct. Measures true feature adoption and subsequent retention (listening behavior) over time.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['success-metrics', 'outcomes', 'product-sense'],
  },
  {
    id: 'beg-14',
    levelId: 'beginner',
    orderIndex: 14,
    title: 'Distinguishing User Symptoms from Root Problems',
    scenario:
      'Users of a smartphone photo-sharing app frequently write feedback saying: "Please add a button to delete duplicate photos instantly!" When the PM analyzes user session recordings, users take 40 similar photos at an event and then spend 20 tedious minutes manually comparing and deleting them to find the 2 best shots to share.',
    questionText: 'What is the root user problem the Product Manager should address?',
    difficulty: 'easy',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Users are running out of cloud storage space and want to cancel their subscriptions.' },
      { key: 'B', text: 'Users experience fatigue and frustration when curating and selecting their best photos from a large burst of similar shots.' },
      { key: 'C', text: 'Users dislike social media apps and prefer offline file management.' },
      { key: 'D', text: 'The app\'s photo filter colors are inaccurate and cause visual eye strain.' },
    ],
    correctOption: 'B',
    explanation:
      'Customers describe problems through the lens of their imagined solutions ("delete button"). Great PMs identify the root struggle: users do not love deleting photos; they want an effortless way to select and share their best moments without spending 20 minutes curating bursts.',
    optionExplanations: {
      A: 'Misinterprets curation friction as a cloud storage billing issue.',
      B: 'Correct. Identifies the underlying pain point (curation effort) rather than merely adopting the user\'s proposed feature request.',
      C: 'Unfounded generalization unsupported by user behavior.',
      D: 'Irrelevant distraction unrelated to photo curation.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['user-empathy', 'root-cause', 'product-sense'],
  },
  {
    id: 'beg-15',
    levelId: 'beginner',
    orderIndex: 15,
    title: 'The Product Manager\'s Role in Sprint Retrospectives',
    scenario:
      'In the last 2-week sprint, the team committed to 5 user stories but only finished 2 because requirements were unclear and unexpected third-party API rate limits were discovered midway through development.',
    questionText: 'What is the PM\'s role in the sprint retrospective to help the team improve?',
    difficulty: 'easy',
    competency: 'Communication & Decision-Making',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Publicly blame the QA engineers for failing to foresee third-party rate limits.' },
      { key: 'B', text: 'Cancel all future sprint retrospectives to save team meeting time.' },
      { key: 'C', text: 'Collaborate with engineering to improve story definition during backlog grooming and introduce technical discovery spikes for external API dependencies.' },
      { key: 'D', text: 'Mandate weekend overtime for all developers without changing the planning process.' },
    ],
    correctOption: 'C',
    explanation:
      'Sprint retrospectives are blameless continuous-improvement ceremonies. A constructive PM acknowledges requirement gaps and establishes process improvements—such as refined acceptance criteria and technical spikes—to de-risk external dependencies before sprint commitment.',
    optionExplanations: {
      A: 'Blaming individuals destroys team psychological safety and ignores systemic process gaps.',
      B: 'Eliminating retrospectives removes the primary mechanism for continuous team improvement.',
      C: 'Correct. Promotes blameless root-cause analysis, better story refinement, and technical discovery spikes.',
      D: 'Overtime treats the symptom, leads to burnout, and guarantees the same planning failures happen next sprint.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['agile', 'scrum', 'retrospectives'],
  },

  // =========================================================================
  // INTERMEDIATE LEVEL (15 QUESTIONS: SCENARIO MCQs, ANALYTICS & EXECUTION)
  // Answer key distribution: A: 4, B: 4, C: 3, D: 4
  // =========================================================================
  {
    id: 'int-1',
    levelId: 'intermediate',
    orderIndex: 1,
    title: 'Diagnosing Sudden Onboarding Funnel Degradation',
    scenario:
      'A B2B SaaS product\'s onboarding completion rate has dropped from 70% to 55% over the past two weeks. The team released a redesigned profile setup screen during that same period.',
    questionText: 'What should the Product Manager do first?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Roll back the redesigned profile screen immediately because the drop coincided with its release.' },
      { key: 'B', text: 'Analyze the onboarding funnel step-by-step and segment by user cohort (e.g. device type, browser, acquisition source) to verify where the drop occurred and whether the new screen is responsible.' },
      { key: 'C', text: 'Redesign the entire onboarding flow from scratch to improve completion.' },
      { key: 'D', text: 'Send an automated email sequence urging dropped-off users to complete setup.' },
    ],
    correctOption: 'B',
    explanation:
      'Correlation does not equal causation. Before reverting code or redesigning flows, the PM must diagnose the exact drop-off step and segment by cohort (e.g. mobile Safari bug vs desktop flow) to isolate the true root cause with empirical data.',
    optionExplanations: {
      A: 'Rolling back immediately without diagnostic evidence is premature and may disguise an external cause (e.g. broken ad traffic).',
      B: 'Correct. Funnel step decomposition and cohort segmentation isolate where the breakdown happened and prove causation.',
      C: 'Redesigning everything from scratch is wasteful, high-risk, and ignores targeted diagnosis.',
      D: 'Automated emails treat the symptom after users drop off rather than fixing the in-product friction.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['funnel-analysis', 'diagnostics', 'analytics'],
  },
  {
    id: 'int-2',
    levelId: 'intermediate',
    orderIndex: 2,
    title: 'Calculating and Applying RICE Prioritization Scoring',
    scenario:
      'A Product Manager is evaluating two candidate initiatives for the quarterly roadmap:\n• Initiative 1 (Self-Serve Invoice Downloads): Reach = 4,000 users/month, Impact = 2 (Medium), Confidence = 80% (0.8), Effort = 2 person-months.\n• Initiative 2 (AI Expense Auto-Tagging): Reach = 1,000 users/month, Impact = 3 (Massive), Confidence = 50% (0.5), Effort = 3 person-months.\nFormula: RICE = (Reach × Impact × Confidence) / Effort',
    questionText: 'What are the RICE scores for Initiative 1 and Initiative 2, and which should be prioritized first?',
    difficulty: 'medium',
    competency: 'Prioritization & Execution',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Initiative 1 = 1,600; Initiative 2 = 1,500; prioritize Initiative 2 because AI features generate marketing buzz.' },
      { key: 'B', text: 'Initiative 1 = 6,400; Initiative 2 = 500; prioritize Initiative 1.' },
      { key: 'C', text: 'Initiative 1 = 800; Initiative 2 = 1,000; prioritize Initiative 2.' },
      { key: 'D', text: 'Initiative 1 = 3,200; Initiative 2 = 500; prioritize Initiative 1.' },
    ],
    correctOption: 'D',
    explanation:
      'Initiative 1 RICE = (4,000 × 2 × 0.8) / 2 = 6,400 / 2 = 3,200.\nInitiative 2 RICE = (1,000 × 3 × 0.5) / 3 = 1,500 / 3 = 500.\nInitiative 1 has more than 6x higher expected return per unit of effort due to high reach and confidence, making it the clear objective priority.',
    optionExplanations: {
      A: 'Arithmetic error and ignores the quantitative RICE outcome in favor of buzzwords.',
      B: 'Forgot to divide Initiative 1 by the 2 person-months of effort.',
      C: 'Incorrectly calculates both scores.',
      D: 'Correct. Initiative 1 = 3,200 and Initiative 2 = 500; prioritize Initiative 1.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['rice', 'prioritization', 'analytical-thinking'],
  },
  {
    id: 'int-3',
    levelId: 'intermediate',
    orderIndex: 3,
    title: 'Evaluating A/B Test Trade-offs with Guardrail Metrics',
    scenario:
      'An e-commerce team tests a new "Countdown Timer" widget on checkout pages. The test variant shows a statistically significant +4% lift in checkout completions (p < 0.01). However, customer support logs show a 25% surge in post-purchase cancellation requests and buyer complaints within 24 hours.',
    questionText: 'How should the Product Manager interpret this experiment?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Do not roll out the timer to 100%; the conversion lift is driven by artificial urgency that triggers buyer remorse, eroding net revenue and customer trust.' },
      { key: 'B', text: 'Roll out the timer to 100% immediately because the primary metric (conversions) achieved statistical significance (p < 0.01).' },
      { key: 'C', text: 'Speed up the countdown timer clock to create even greater urgency and offset the cancellations.' },
      { key: 'D', text: 'Conclude that A/B testing is ineffective and ask the sales team to choose the design.' },
    ],
    correctOption: 'A',
    explanation:
      'Product metrics cannot be evaluated in isolation. A conversion lift achieved via artificial urgency that triggers post-purchase cancellations and customer remorse damages long-term customer lifetime value and brand trust, causing a net negative business outcome.',
    optionExplanations: {
      A: 'Correct. Balances primary conversion metrics against critical guardrail metrics (cancellations and trust).',
      B: 'Falls into the local-maximum trap of celebrating conversion while ignoring downstream cancellation costs.',
      C: 'Doubles down on dark patterns, creating severe brand erosion.',
      D: 'Abdicates empirical experimentation instead of using guardrail data.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['ab-testing', 'guardrail-metrics', 'trade-offs'],
  },
  {
    id: 'int-4',
    levelId: 'intermediate',
    orderIndex: 4,
    title: 'Diagnosing Low Feature Adoption Post-Launch',
    scenario:
      'Three weeks ago, a B2B project tool launched a "Subtasks" feature requested by 40% of survey respondents. Telemetry shows only 3% of active projects have created a subtask, but users who do adopt subtasks have 15% higher 30-day retention.',
    questionText: 'What is the most effective approach for the PM to diagnose and improve adoption?',
    difficulty: 'medium',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Delete the feature immediately because 3% adoption proves the user survey was completely wrong.' },
      { key: 'B', text: 'Add an unclosable modal window every time a user creates a project forcing them to create a subtask.' },
      { key: 'C', text: 'Conduct usability testing and review session replays with non-adopters to check if subtasks are hard to discover in the UI, and interview adopters to learn where the feature delivers the most value.' },
      { key: 'D', text: 'Offer monetary gift cards to anyone who creates 5 subtasks in the next week.' },
    ],
    correctOption: 'C',
    explanation:
      'When feature adoption is low but retained value is high (+15% retention for adopters), the issue is usually discoverability or onboarding friction. Usability testing and session replays reveal UI friction points, while adopter interviews reveal the real value triggers.',
    optionExplanations: {
      A: 'Prematurely deletes a feature that demonstrably improves retention for active users.',
      B: 'Intrusive gating annoys users who do not need subtasks for simple projects.',
      C: 'Correct. Combines qualitative discovery to identify friction with retention evidence from successful users.',
      D: 'Artificial incentives create vanity usage without solving discoverability or core product value.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['adoption', 'retention', 'discovery'],
  },
  {
    id: 'int-5',
    levelId: 'intermediate',
    orderIndex: 5,
    title: 'Handling Mid-Sprint Scope Blockers Under Constraints',
    scenario:
      'Midway through a 2-week sprint, the lead backend developer discovers that a third-party payment partner unexpectedly changed its authentication protocol. Fixing it requires 4 days of engineering effort, making it impossible to finish all 5 committed sprint stories on time.',
    questionText: 'What is the most disciplined action for the Product Manager?',
    difficulty: 'medium',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Force the engineering team to work late nights and weekends to complete all 5 stories plus the API fix.' },
      { key: 'B', text: 'Re-negotiate sprint scope immediately with the squad: identify the lowest-priority feature story, move it back to the backlog, and absorb the payment API fix so critical work is delivered reliably.' },
      { key: 'C', text: 'Ignore the payment API change until next quarter and ship the remaining stories with broken payment logins.' },
      { key: 'D', text: 'Cancel the sprint immediately and report a failed delivery cycle to executives.' },
    ],
    correctOption: 'B',
    explanation:
      'Agile execution requires managing scope dynamically when critical technical constraints emerge. The PM negotiates scope with the team, protecting sprint stability by trading lower-priority backlog items for the non-negotiable payment API fix.',
    optionExplanations: {
      A: 'Mandating emergency overtime burns out engineers and causes sloppy, defect-ridden releases.',
      B: 'Correct. Pragmatic Agile trade-off: deselect lower-priority work to absorb urgent unexpected blockers.',
      C: 'Knowingly shipping broken payment authentication creates customer churn and financial outages.',
      D: 'Premature panic that fails to demonstrate adaptive product leadership.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['sprint-planning', 'scope-negotiation', 'execution'],
  },
  {
    id: 'int-6',
    levelId: 'intermediate',
    orderIndex: 6,
    title: 'Evaluating Bespoke Enterprise Customer Requests',
    scenario:
      'A prospective enterprise customer offers to sign a ₹50 Lakh annual contract on the condition that your B2B SaaS platform builds a custom, proprietary data export format used exclusively by their legacy on-premise ERP system.',
    questionText: 'How should the Product Manager evaluate and respond to this request?',
    difficulty: 'medium',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Reject the deal immediately; software companies should never accommodate enterprise customer requests.' },
      { key: 'B', text: 'Agree to build the custom code directly into the core application codebase for free.' },
      { key: 'C', text: 'Halt all roadmap work for all other customers to satisfy this enterprise client.' },
      { key: 'D', text: 'Assess whether building an extensible public webhook or REST API export would solve this customer\'s need (via a middleware script) while simultaneously creating reusable platform value for future enterprise clients.' },
    ],
    correctOption: 'D',
    explanation:
      'Great B2B PMs translate one-off customer requests into generalized, extensible platform capabilities (e.g. webhooks, open APIs) that preserve SaaS scalability rather than hardcoding bespoke single-tenant logic into the core product.',
    optionExplanations: {
      A: 'Dogmatic refusal ignores significant commercial revenue and enterprise growth opportunities.',
      B: 'Hardcoding proprietary custom formats pollutes the codebase and creates permanent maintenance debt.',
      C: 'Turns a scalable software product company into a custom IT consulting agency.',
      D: 'Correct. Transforms bespoke custom demands into scalable, reusable platform infrastructure.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['b2b', 'enterprise', 'scalability'],
  },
  {
    id: 'int-7',
    levelId: 'intermediate',
    orderIndex: 7,
    title: 'Communicating a Critical Feature Delay to Stakeholders',
    scenario:
      'A major reporting module promised to the enterprise sales team for the end of Q3 is delayed by 3 weeks because external security penetration testing revealed vulnerability flaws that must be patched before launch.',
    questionText: 'How should the Product Manager communicate this delay to sales and leadership?',
    difficulty: 'medium',
    competency: 'Communication & Decision-Making',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Proactively notify sales and leadership immediately, explaining the security rationale, providing the revised timeline, and offering temporary workarounds or client talking points.' },
      { key: 'B', text: 'Wait until the final afternoon of Q3 to inform sales so they do not get distracted earlier in the quarter.' },
      { key: 'C', text: 'Deploy the reporting module on schedule with known vulnerabilities and patch them quietly later.' },
      { key: 'D', text: 'Blame the security penetration testing firm and tell sales to complain to the Chief Information Security Officer.' },
    ],
    correctOption: 'A',
    explanation:
      'Stakeholder trust is built on early, transparent communication. Explaining the security necessity, providing a committed revised date, and supplying client-facing talking points empowers sales to manage enterprise customer expectations effectively.',
    optionExplanations: {
      A: 'Correct. Transparent, proactive communication with context and actionable mitigation builds executive trust.',
      B: 'Blindsiding sales at the end of the quarter ruins credibility and destroys client relationships.',
      C: 'Shipping unpatched security vulnerabilities exposes customer data and violates compliance laws.',
      D: 'Shifting blame creates cross-functional toxicity and demonstrates lack of leadership ownership.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['communication', 'stakeholder-management', 'risk'],
  },
  {
    id: 'int-8',
    levelId: 'intermediate',
    orderIndex: 8,
    title: 'Distinguishing Correlation from Causation in Analytics',
    scenario:
      'A product analyst observes that users who use the "Search Bar" at least 3 times during their first week have 40% higher 60-day retention than users who never search. The growth squad suggests adding an unskippable tutorial forcing every new user to run a search during onboarding.',
    questionText: 'What analytical flaw must the PM point out to the growth team?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Search bars are obsolete UI elements that should be removed from all software.' },
      { key: 'B', text: '60-day retention is an irrelevant metric for subscription products.' },
      { key: 'C', text: 'Search usage is likely a correlation rather than causation: high-intent users with specific goals naturally search, but forcing casual users to type dummy searches will not artificially create high intent.' },
      { key: 'D', text: '40% retention lift is mathematically impossible in mobile applications.' },
    ],
    correctOption: 'C',
    explanation:
      'This is the classic correlation vs causation trap. High-intent users search because they know what they want; forcing casual or uninterested users through a forced search ritual does not instill intent and adds onboarding friction.',
    optionExplanations: {
      A: 'Nonsensical claim; search remains a foundational navigation paradigm.',
      B: '60-day retention is a critical benchmark for long-term customer lifetime value.',
      C: 'Correct. Identifies that search behavior is a marker of pre-existing user intent, not a causal lever.',
      D: 'A 40% relative retention difference between active power users and dormant users is very common.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['analytics', 'correlation-causation', 'data-thinking'],
  },
  {
    id: 'int-9',
    levelId: 'intermediate',
    orderIndex: 9,
    title: 'Balancing Technical Debt Against Feature Velocity',
    scenario:
      'Over the past four months, crash rates have risen from 0.2% to 1.9%, and core page load times have doubled. The engineering lead requests allocating 25% of sprint capacity over the next quarter to database indexing and memory optimization. Sales is demanding three new features to hit annual targets.',
    questionText: 'What is the most disciplined product decision?',
    difficulty: 'medium',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Allocate the requested capacity to performance and stability, because slow load times and app crashes degrade conversion and retention for all existing and new users.' },
      { key: 'B', text: 'Reject all technical debt work until every annual sales target is met.' },
      { key: 'C', text: 'Instruct developers to fix performance issues during personal time on weekends without logging tickets.' },
      { key: 'D', text: 'Hire outside contract developers to rewrite the entire application from scratch.' },
    ],
    correctOption: 'A',
    explanation:
      'Platform stability and performance are core product features. When crash rates hit 1.9% and load times double, every new feature released suffers degraded conversion and higher churn. Investing in technical hygiene protects baseline business health.',
    optionExplanations: {
      A: 'Correct. Technical debt directly degrades conversion, customer satisfaction, and retention if left unchecked.',
      B: 'Ignoring worsening stability leads to catastrophic system failure and accelerated customer churn.',
      C: 'Unethical, unsustainable, and leads to team burnout and departures.',
      D: 'Complete ground-up rewrites take years, cost immense capital, and rarely succeed.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['technical-debt', 'prioritization', 'stability'],
  },
  {
    id: 'int-10',
    levelId: 'intermediate',
    orderIndex: 10,
    title: 'Balancing Onboarding Friction with Lead Qualification',
    scenario:
      'A B2B analytics tool asks users to fill out a 12-field registration form (Company, Title, Phone, Revenue, Tech Stack, etc.) before accessing a free trial. Signup completion is only 16%. Sales wants rich qualification data, but self-serve growth has stalled.',
    questionText: 'How can the PM resolve this tension between high conversion and qualified sales pipeline?',
    difficulty: 'medium',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Remove all signup fields including password and let users access the tool anonymously without saving accounts.' },
      { key: 'B', text: 'Implement progressive profiling: reduce upfront signup to email and password for immediate product value, and gather additional profile data contextually as users explore advanced features or request demos.' },
      { key: 'C', text: 'Add 6 more required fields to the form so only the most desperate users register.' },
      { key: 'D', text: 'Ban the sales team from contacting any trial users.' },
    ],
    correctOption: 'B',
    explanation:
      'Progressive profiling is the proven solution to signup friction. Lowering initial barriers allows users to experience the "aha!" moment quickly, while contextual prompts and third-party data enrichment gather sales qualification data over time.',
    optionExplanations: {
      A: 'Prevents account persistence, workspace collaboration, and subsequent re-engagement.',
      B: 'Correct. Progressive profiling delivers immediate product activation while collecting deeper lead qualification over time.',
      C: 'Exacerbates drop-off, driving conversion toward zero.',
      D: 'Damages revenue collaboration between product and sales teams.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['onboarding', 'progressive-profiling', 'growth'],
  },
  {
    id: 'int-11',
    levelId: 'intermediate',
    orderIndex: 11,
    title: 'Calculating CAC Payback Period',
    scenario:
      'A SaaS company spends ₹60,00,000 on digital marketing in a month and acquires 10,000 new paying subscribers. Each subscriber pays ₹200/month. The company\'s gross margin is 75%, meaning each subscriber contributes ₹150 of gross profit each month.',
    questionText: 'What is the Customer Acquisition Cost (CAC) per subscriber, and what is the CAC Payback Period?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'analytical',
    options: [
      { key: 'A', text: 'CAC = ₹300; Payback Period = 1.5 months.' },
      { key: 'B', text: 'CAC = ₹6,000; Payback Period = 30 months.' },
      { key: 'C', text: 'CAC = ₹600; Payback Period = 4.0 months.' },
      { key: 'D', text: 'CAC = ₹600; Payback Period = 3.0 months.' },
    ],
    correctOption: 'C',
    explanation:
      'CAC = Total Spend / New Customers = ₹60,00,000 / 10,000 = ₹600 per customer.\nMonthly Gross Profit = Revenue × Gross Margin = ₹200 × 75% = ₹150.\nCAC Payback Period = CAC / Monthly Gross Profit = ₹600 / ₹150 = 4.0 months.\n(Note: Option D incorrectly divides CAC by gross revenue ₹200 rather than gross margin ₹150).',
    optionExplanations: {
      A: 'Calculation error cutting CAC in half.',
      B: 'Mathematical error multiplying spend by 10.',
      C: 'Correct. CAC = ₹600; Monthly Gross Profit = ₹150; Payback = 4.0 months.',
      D: 'Divides by top-line revenue (₹200) instead of gross margin (₹150), misrepresenting true cash recovery.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['cac', 'payback-period', 'unit-economics'],
  },
  {
    id: 'int-12',
    levelId: 'intermediate',
    orderIndex: 12,
    title: 'Sunsetting an Underperforming Legacy Feature',
    scenario:
      'An old reporting export tool built 4 years ago is used by only 1.2% of active users, but maintaining compatibility with it consumes 15% of the squad\'s ongoing engineering time due to outdated database schemas.',
    questionText: 'How should the Product Manager sunset this feature responsibly?',
    difficulty: 'medium',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Delete the feature code overnight without notifying anyone to free up engineering capacity immediately.' },
      { key: 'B', text: 'Keep the feature running indefinitely and never touch it, ignoring any security vulnerabilities it creates.' },
      { key: 'C', text: 'Quadruple subscription prices for the 1.2% of users until they leave the platform voluntarily.' },
      { key: 'D', text: 'Announce a transparent deprecation timeline (e.g. 60–90 days), explain alternative export methods, provide data migration support to affected users, and decommission the code once the grace period ends.' },
    ],
    correctOption: 'D',
    explanation:
      'Feature deprecation is an essential part of product lifecycle management. Professional sunsetting involves advance notice, clear explanations of modern alternatives, dedicated migration help for power users, and clean removal after the announced deadline.',
    optionExplanations: {
      A: 'Abrupt deletions break customer trust, violate enterprise SLAs, and trigger customer churn.',
      B: 'Neglected legacy code accumulates security vulnerabilities and technical drag.',
      C: 'Punitive pricing damages brand reputation and customer goodwill.',
      D: 'Correct. Thoughtful deprecation: transparent timeline, user communication, migration paths, and clean decommissioning.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['sunsetting', 'deprecation', 'lifecycle'],
  },
  {
    id: 'int-13',
    levelId: 'intermediate',
    orderIndex: 13,
    title: 'Designing a Phased Rollout with Feature Flags',
    scenario:
      'Your engineering squad has completed a major redesign of the checkout and payment transaction flow for a mobile marketplace that processes 50,000 transactions daily.',
    questionText: 'What is the safest and most disciplined deployment strategy?',
    difficulty: 'medium',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Release the new flow to 100% of production users at 5:00 PM on a Friday and review logs on Monday.' },
      { key: 'B', text: 'Use feature flags to conduct a staged rollout (e.g. 5% canary, then 25%, then 50%, then 100%), closely monitoring payment success rates, latency, and error logs at each milestone.' },
      { key: 'C', text: 'Only release the feature to mobile web while leaving iOS and Android on the legacy code permanently.' },
      { key: 'D', text: 'Wait 18 months until the entire company unanimously agrees that no bugs could possibly exist.' },
    ],
    correctOption: 'B',
    explanation:
      'Phased rollouts using feature flags limit blast radius. By releasing to a small canary cohort (e.g. 5%) and monitoring core transactional telemetry, the team catches edge-case bugs early before exposing the full revenue stream to risk.',
    optionExplanations: {
      A: 'Releasing 100% to production before a weekend is high-risk deployment malpractice.',
      B: 'Correct. Staged canary rollouts with feature flags minimize blast radius and protect transactional revenue.',
      C: 'Creates permanent platform divergence and doubles ongoing maintenance overhead.',
      D: 'Paralysis by analysis; software quality is verified through empirical telemetry, not indefinite delays.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['feature-flags', 'rollout', 'risk-management'],
  },
  {
    id: 'int-14',
    levelId: 'intermediate',
    orderIndex: 14,
    title: 'Defining Non-Happy-Path Acceptance Criteria',
    scenario:
      'A PM writes acceptance criteria for a "Promo Code" input at checkout: "Given a customer enters a valid promo code, when they click Apply, then the total price should be discounted by the promo percentage."',
    questionText: 'Which essential acceptance criteria are missing from this story?',
    difficulty: 'medium',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Handling invalid, expired, already-redeemed, and minimum-spend-not-met codes with clear error messages, plus button disable/debounce states while the API validates.' },
      { key: 'B', text: 'Requiring customers to upload government ID verification before entering any promo code.' },
      { key: 'C', text: 'Specifying the exact CSS hex color code of the button border on 12 different mobile screen sizes.' },
      { key: 'D', text: 'The story is complete; edge cases and error messages should only be designed after user complaints arise in production.' },
    ],
    correctOption: 'A',
    explanation:
      'Robust product specifications anticipate non-happy paths: expired codes, invalid inputs, double-clicking buttons during network latency, and order minimums. Defining these states prevents customer confusion and checkout abandonment.',
    optionExplanations: {
      A: 'Correct. Comprehensive acceptance criteria specify edge cases, error messaging, and button state handling.',
      B: 'Absurd friction that would destroy checkout conversion.',
      C: 'Styling details belong to design system tokens, not functional acceptance criteria.',
      D: 'Ignoring error states leads to broken checkout experiences and elevated cart abandonment.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['acceptance-criteria', 'edge-cases', 'ux'],
  },
  {
    id: 'int-15',
    levelId: 'intermediate',
    orderIndex: 15,
    title: 'Weighing Vocal Customer Complaints Against Telemetry Data',
    scenario:
      'After shipping a navigation update, the CEO forwards an angry email from a prominent client who hates the new layout and demands an immediate rollback. Meanwhile, product analytics across 25,000 active users show task completion times improved by 14% and overall CSAT increased from 4.2 to 4.6/5.',
    questionText: 'How should the PM address this situation with the CEO and the customer?',
    difficulty: 'medium',
    competency: 'Communication & Decision-Making',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Immediately roll back the navigation update for all 25,000 users to placate the CEO\'s contact.' },
      { key: 'B', text: 'Ignore the email and tell the client that they do not understand modern design standards.' },
      { key: 'C', text: 'Ban the complaining customer from sending support tickets.' },
      { key: 'D', text: 'Share the aggregate performance data showing improved task completion and strong CSAT across the user base, while offering a 1-on-1 discovery call with the complaining customer to understand their specific workflow and provide customized training or identify edge cases.' },
    ],
    correctOption: 'D',
    explanation:
      'Product leadership requires balancing aggregate empirical data against high-touch relationship management. Grounding the conversation in data demonstrates that the feature succeeds for 99%+ of users, while offering a 1-on-1 call treats the vocal client with respect and checks for genuine edge-case blind spots.',
    optionExplanations: {
      A: 'Over-indexing on an isolated vocal anecdote rolls back a change that measurably helps 25,000 users.',
      B: 'Dismissive, arrogant, and damages client and executive relationships.',
      C: 'Unprofessional behavior that damages the company reputation.',
      D: 'Correct. Defends data-backed outcomes while offering empathetic, high-touch discovery for the individual customer.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['stakeholder-management', 'data-vs-anecdote', 'communication'],
  },

  // =========================================================================
  // ADVANCED LEVEL (10 QUESTIONS: 6 SCENARIOS/MCQs + 4 WRITTEN STRATEGIC CASES)
  // MCQ Answer key distribution: A: 2, B: 2, C: 1, D: 1
  // =========================================================================
  {
    id: 'adv-1',
    levelId: 'advanced',
    orderIndex: 1,
    title: 'Balancing Enterprise Custom Requests Against Core Roadmap',
    scenario:
      'A B2B SaaS product generates 65% of its revenue from enterprise accounts. Several enterprise clients request custom reporting features, but the engineering team has limited capacity and smaller customers (representing 80% of user volume and future growth) are asking for usability improvements to the core product.',
    questionText: 'What is the strongest approach for the Product Manager?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Prioritize the enterprise requests exclusively because those customers contribute most of the current revenue.' },
      { key: 'B', text: 'Prioritize the core product improvements exclusively because scalable features are always preferable to custom work.' },
      { key: 'C', text: 'Evaluate the revenue and retention impact of the enterprise requests, assess whether the reporting capabilities can be abstracted to serve other customers, and compare them against the expected impact of core product improvements before allocating capacity.' },
      { key: 'D', text: 'Divide engineering capacity equally (50/50) between enterprise requests and core product improvements without evaluating business impact.' },
    ],
    correctOption: 'C',
    explanation:
      'Experienced PMs balance immediate commercial revenue with long-term scalability and opportunity cost. Rather than choosing blindly between enterprise revenue and core usability, the PM evaluates retention risks, seeks to abstract custom requests into generalized platform features, and compares expected impact before committing resources.',
    optionExplanations: {
      A: 'Blindly prioritizing enterprise revenue creates a custom software consultancy that harms scalability and mid-market growth.',
      B: 'Dogmatically refusing enterprise requests risks multi-crore contract churn and damages immediate commercial viability.',
      C: 'Correct. Balances commercial defense, platform abstraction, and opportunity cost across all customer tiers.',
      D: 'Arbitrary 50/50 splits abdicate prioritization leadership and produce two half-finished initiatives.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['portfolio-management', 'enterprise-strategy', 'trade-offs'],
  },
  {
    id: 'adv-2',
    levelId: 'advanced',
    orderIndex: 2,
    title: 'Transitioning from Per-Seat to Usage-Based Pricing',
    scenario:
      'A cloud analytics SaaS charges a flat ₹3,000/seat/month. Research shows large enterprise teams share single login credentials to avoid paying for extra seats, depressing expansion revenue. Leadership proposes transitioning to a consumption-based pricing model based on data query volume and storage.',
    questionText: 'What critical strategic risk must the PM evaluate before recommending this transition?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Customers will stop using digital computers if billing models change.' },
      { key: 'B', text: 'Usage-based pricing introduces monthly billing unpredictability for enterprise procurement departments, potentially elongating enterprise sales cycles unless spend caps, budget alerts, and prepaid credit tiers are provided.' },
      { key: 'C', text: 'Per-seat pricing is legally required by software regulations worldwide.' },
      { key: 'D', text: 'Usage-based pricing always reduces customer lifetime value by at least 80% across all software sectors.' },
    ],
    correctOption: 'B',
    explanation:
      'While consumption pricing aligns customer value with monetization, it creates budget unpredictability for enterprise finance teams who require predictable annual purchase orders. A mature PM plans spend guardrails, prepaid commit pools, and alerts to de-risk procurement friction.',
    optionExplanations: {
      A: 'Absurd distractor.',
      B: 'Correct. Identifies procurement budget predictability as the primary enterprise adoption friction in consumption models.',
      C: 'Legally false; software pricing models are determined by vendor contracts.',
      D: 'Factually untrue; industry leaders (Snowflake, AWS, Twilio) demonstrate high NRR under usage-based models.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['pricing-strategy', 'usage-based-pricing', 'enterprise'],
  },
  {
    id: 'adv-3',
    levelId: 'advanced',
    orderIndex: 3,
    title: 'Interpreting Conflicting Short-Term and Long-Term Experiment Metrics',
    scenario:
      'A subscription app tests an aggressive cancellation discount offering 50% off for 3 months to users attempting to churn. At day 14, the variant shows a 30% reduction in immediate cancellations (p < 0.001). However, 90-day tracking reveals that 75% of those retained users remain dormant, and their eventual cancellation rate at month 4 is 85%, resulting in net negative revenue after accounting for server costs and payment processing fees.',
    questionText: 'What strategic conclusion should the Product Manager present to leadership?',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'The discount offer is merely subsidizing and postponing inevitable churn while eroding price integrity; the team should instead invest in solving core product value and activation deficits.' },
      { key: 'B', text: 'The test is an unqualified success because immediate cancellations dropped by 30% with p < 0.001, so the flow should be rolled out globally.' },
      { key: 'C', text: 'Make the 50% discount permanent for all users across the entire customer base.' },
      { key: 'D', text: 'Remove the cancellation button entirely so customers can never unsubscribe.' },
    ],
    correctOption: 'A',
    explanation:
      'Senior PMs look beyond local short-term conversion lifts to evaluate true cohort lifetime economics. Subsidizing unengaged users delays churn temporarily while eroding price integrity and gross margin. Real retention comes from solving underlying value deficits.',
    optionExplanations: {
      A: 'Correct. Diagnoses the cohort unit economic reality: delaying churn with deep discounts destroys margin without creating true engagement.',
      B: 'Falls into the local-maximum trap of celebrating immediate p-values while ignoring 90-day cohort decay.',
      C: 'Destroys company gross margins and commercial viability.',
      D: 'Illegal dark pattern that triggers chargebacks and regulatory fines.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['experimentation', 'cohort-economics', 'retention'],
  },
  {
    id: 'adv-4',
    levelId: 'advanced',
    orderIndex: 4,
    title: 'Managing Two-Sided Marketplace Imbalance and Friction',
    scenario:
      'In an on-demand freight marketplace connecting shippers (demand) with truck drivers (supply), shipper booking volume surges 60% in a new metropolitan region, but driver fulfillment drops from 91% to 70%. Driver telemetry reveals that warehouse pickup wait times have averaged 90 minutes unpaid, causing drivers to abandon the platform for competitors.',
    questionText: 'What is the most effective long-term platform strategy to restore marketplace equilibrium?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Double marketing spend on shippers to flood the marketplace with more shipment bookings.' },
      { key: 'B', text: 'Permanently ban any driver who refuses a pickup job with long warehouse wait times.' },
      { key: 'C', text: 'Shut down the marketplace in that metropolitan region permanently.' },
      { key: 'D', text: 'Implement automated detention-time tracking and demurrage fees charged to warehouses and paid directly to drivers for wait times exceeding 30 minutes, realigning incentives across both sides.' },
    ],
    correctOption: 'D',
    explanation:
      'Marketplace health requires aligning economic incentives. When negative externalities (warehouse delays) punish the constrained supply side (drivers), introducing automated demurrage fees penalizes warehouse inefficiency and fairly compensates driver opportunity cost.',
    optionExplanations: {
      A: 'Pouring demand into a constrained, frustrated supply side worsens driver churn and causes marketplace collapse.',
      B: 'Punishing drivers accelerates supply defection to rival platforms.',
      C: 'Premature retreat that surrenders a high-growth market.',
      D: 'Correct. Realigns marketplace economics: penalizes warehouse friction and protects supply liquidity.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['marketplace', 'network-effects', 'incentive-design'],
  },
  {
    id: 'adv-5',
    levelId: 'advanced',
    orderIndex: 5,
    title: 'Staging High-Risk Technical Debt Migration Against Business Deadlines',
    scenario:
      'A fintech core transactional database is operating at 85% capacity during peak trading volume. A full migration to a horizontally scalable distributed database is estimated at 6 months of dedicated engineering work. Meanwhile, leadership has committed to a critical international market expansion launching in 4 months.',
    questionText: 'What is the most responsible product and engineering leadership path?',
    difficulty: 'hard',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Cancel the international launch completely and freeze all product work for the next 12 months.' },
      { key: 'B', text: 'Implement targeted architectural headroom optimizations (e.g. read replicas, write caching, cold data archiving) to buy 9–12 months of runway, allowing the international launch to ship while staging the full migration cleanly in phases.' },
      { key: 'C', text: 'Launch the international expansion without touching the database and hope peak load does not crash the system during trading hours.' },
      { key: 'D', text: 'Fire the engineering team for failing to predict database capacity limits.' },
    ],
    correctOption: 'B',
    explanation:
      'Senior product leaders avoid binary "all-or-nothing" traps. By identifying tactical architectural levers (read replicas, caching, archiving) that buy 9–12 months of safety headroom, the team delivers critical commercial expansion while planning the deep migration safely.',
    optionExplanations: {
      A: 'Paralyzes commercial growth and ignores tactical engineering alternatives.',
      B: 'Correct. Delivers pragmatic architectural headroom to protect system reliability without aborting key commercial initiatives.',
      C: 'Gambles on system crashes during peak financial trading, risking catastrophic regulatory fines and brand destruction.',
      D: 'Destructive leadership that fails to take ownership.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['architecture', 'technical-debt', 'executive-trade-offs'],
  },
  {
    id: 'adv-6',
    levelId: 'advanced',
    orderIndex: 6,
    title: 'AI Copilot Confidence Gating and Risk Governance',
    scenario:
      'A healthcare SaaS is introducing an AI copilot to assist clinicians in drafting patient discharge summaries. In testing, the model achieves 98% clinical precision, but 2% of summaries contain subtle factual hallucinations regarding medication dosages that could cause malpractice liability if uncorrected.',
    questionText: 'What is the best product architecture and UX safety mechanism to ship this feature responsibly?',
    difficulty: 'hard',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Implement confidence-score gating and source citation links: highlight AI-generated recommendations in the editor, mandate explicit clinician review with inline provenance verification, and require an active physical sign-off before committing to the medical record.' },
      { key: 'B', text: 'Automatically email discharge summaries directly to patients without clinician review to maximize time savings.' },
      { key: 'C', text: 'Refuse to release any AI features until the model achieves 100.000% mathematical perfection with zero possibility of errors.' },
      { key: 'D', text: 'Remove all doctor review interfaces and let the AI operate completely autonomously.' },
    ],
    correctOption: 'A',
    explanation:
      'AI product design in high-stakes environments requires strict human-in-the-loop governance. Implementing confidence gating, highlighting AI text, requiring source grounding/citations, and mandating explicit clinician review protects patient safety while delivering productivity gains.',
    optionExplanations: {
      A: 'Correct. Balances AI workflow acceleration with essential human-in-the-loop verification, grounding, and liability safeguards.',
      B: 'Reckless malpractice negligence that endangers patient lives.',
      C: 'Probabilistic machine learning models can never guarantee 100.000% perfection; waiting blocks all valuable innovation.',
      D: 'Eliminating review in medical contexts invites catastrophic clinical errors.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['ai-product', 'risk-governance', 'human-in-the-loop'],
  },

  // =========================================================================
  // WRITTEN STRATEGIC CASES (Q7 - Q10) - EVALUATED BY STANDARD_CASE_RUBRIC
  // Standardized 5-Dimension Rubric:
  // 1. Problem Framing & Assumptions (20%)
  // 2. Analytical Reasoning & Evidence (25%)
  // 3. Decision Quality & Trade-offs (25%)
  // 4. Validation Plan & Success Metrics (20%)
  // 5. Communication & Clarity (10%)
  // =========================================================================
  {
    id: 'adv-7',
    levelId: 'advanced',
    orderIndex: 7,
    title: 'Written Strategic Case 1: Growth Strategy & NRR Degradation',
    scenario:
      'A B2B SaaS company has ₹12 crore in Annual Recurring Revenue (ARR). New customer acquisition is growing 30% year over year, but Net Revenue Retention (NRR) has steadily fallen from 114% to 91% over the past four quarters. Gross revenue churn has doubled, concentrated primarily in the mid-market customer segment (50–200 employees).',
    questionText:
      'Deliver your strategic executive turnaround memo:\n' +
      '1. Diagnose the root growth challenge and unit economic breakdown (explain why NRR < 100% makes venture-backed compounding mathematically unsustainable).\n' +
      '2. Identify the specific cohort, customer segment, and telemetry usage data required to locate the churn leak.\n' +
      '3. Compare the trade-offs of five growth levers: acquisition marketing spend, customer success interventions, product onboarding redesign, pricing/packaging restructuring, and customer segment pruning.\n' +
      '4. Recommend a prioritized investment roadmap for the next two quarters.\n' +
      '5. Define explicit success metrics, leading indicators, and decision thresholds that would cause you to change course.',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must demonstrate understanding that an NRR of 91% means the existing customer cohort is shrinking by 9% net each year, forcing new acquisition to pour into a leaky bucket. Must propose segment-level cohort analysis, packaging/pricing or CS interventions, and quantitative leading indicators.',
    explanation:
      'When NRR drops below 100%, SaaS compounding reverses into an uphill treadmill. Accelerating acquisition spending into an NRR of 91% degrades capital efficiency. The business must plug gross churn and unlock expansion tiers to restore NRR > 110% before scaling acquisition spend.',
    rubric: STANDARD_CASE_RUBRIC,
    isActive: true,
    tags: ['case-study', 'growth-strategy', 'nrr-turnaround'],
  },
  {
    id: 'adv-8',
    levelId: 'advanced',
    orderIndex: 8,
    title: 'Written Strategic Case 2: Product Experimentation & Confounding Seasonality',
    scenario:
      'A checkout redesign experiment on a major retail platform shows a +5% lift in checkout completion rate, but Average Order Value (AOV) drops by 8%, and payment gateway failure rates surge by 12% among high-value repeat customers. The experiment was run during a festive 4-day flash sale with heavy sitewide discount promotions.',
    questionText:
      'Provide your analytical and operational rollout recommendation:\n' +
      '1. Quantify the net revenue multiplier and explain why a conversion lift paired with an AOV decline can result in net revenue loss (1.05 × 0.92 = 0.966, a -3.4% net revenue drop).\n' +
      '2. Analyze the confounding risk of flash sale seasonality and how discount shopper intent skews baseline behavior.\n' +
      '3. Formulate hypotheses for the payment gateway failure surge among top-tier customers (e.g. anti-fraud velocity triggers, 3D-Secure drop-offs on high ticket items).\n' +
      '4. Deliver an unambiguous decision: full rollout, targeted cohort rollout, or re-test under neutral baseline traffic.\n' +
      '5. Specify operational guardrails, secondary metrics, and automated rollback criteria.',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must calculate net revenue multiplier: 1.05 × 0.92 = 0.966 (a net 3.4% revenue loss!). Must recognize promotional traffic skew, hypothesize fraud/3DS rules affecting high-ticket checkouts, and recommend against an unconstrained rollout.',
    explanation:
      'Conversion lift paired with AOV drop frequently produces net negative revenue: 1.05 × 0.92 = 0.966 (-3.4% revenue loss). Holiday promotions attract low-AOV discount seekers, confounding findings. Surging payment failures on top-tier buyers destroys core profitability.',
    rubric: STANDARD_CASE_RUBRIC,
    isActive: true,
    tags: ['case-study', 'ab-testing', 'analytical-reasoning'],
  },
  {
    id: 'adv-9',
    levelId: 'advanced',
    orderIndex: 9,
    title: 'Written Strategic Case 3: B2B Enterprise Expansion vs Platform Scalability',
    scenario:
      'Three Fortune 500 enterprise prospects offer multi-year contracts totaling ₹8 crore ARR, but each demands bespoke security features: single-tenant on-premise deployment, custom audit logging schemas, and dedicated database instances. Meanwhile, core multi-tenant SaaS reliability has dipped to 99.7% availability, and mid-market churn is rising due to slow core feature delivery.',
    questionText:
      'Deliver your platform turnaround and enterprise expansion strategy:\n' +
      '1. Analyze the opportunity cost and unit economic implications of bespoke single-tenant forks vs multi-tenant SaaS margins.\n' +
      '2. Distinguish scalable, extensible architecture investments (e.g. Virtual Private Cloud (VPC) isolation, SCIM/SAML SSO, generalized audit webhooks) from unscalable one-off custom engineering.\n' +
      '3. Recommend a concrete commercial and product policy for enterprise customization requests.\n' +
      '4. Present a prioritized engineering roadmap balancing reliability debt against enterprise capabilities under a fixed engineering budget.\n' +
      '5. Define explicit SLA recovery milestones, gross margin thresholds, and customer churn guardrails.',
    difficulty: 'hard',
    competency: 'Prioritization & Execution',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must identify super-linear cost drivers of single-tenant code forks. Must propose channeling enterprise requirements into generalized, multi-tenant compatible extensibility points (VPC peering, enterprise SSO, webhooks), while allocating fixed capacity to restore core platform 99.9% SLA.',
    explanation:
      'Platform products must tie compute consumption and architecture to scalable unit economics. Custom customer demands must be channeled into generalized extensibility hooks rather than custom single-tenant code forks that degrade gross margins and roadmap velocity.',
    rubric: STANDARD_CASE_RUBRIC,
    isActive: true,
    tags: ['case-study', 'platform-strategy', 'enterprise-architecture'],
  },
  {
    id: 'adv-10',
    levelId: 'advanced',
    orderIndex: 10,
    title: 'Written Strategic Case 4: AI Product Architecture & Risk Governance',
    scenario:
      'An enterprise customer support automation platform uses an LLM to automatically resolve customer tickets. While routine questions (e.g. order tracking, store hours) are answered with 99% accuracy, high-stakes inquiries (e.g. billing disputes, refund authorizations, account recovery) suffer from a 4% error rate that has resulted in erroneous cash refunds and security verification breaches.',
    questionText:
      'Deliver your AI product risk architecture and launch playbook:\n' +
      '1. Establish a risk classification framework categorizing workflow inquiries by financial risk, security impact, and reversibility.\n' +
      '2. Design confidence-scoring guardrails, validation gates, and human-in-the-loop escalation queues.\n' +
      '3. Propose a tiered product monetization and SLA model (e.g. autonomous standard tier vs human-verified guaranteed enterprise tier).\n' +
      '4. Design telemetry monitoring to catch model drift, prompt injection, and hallucination spikes.\n' +
      '5. Establish unambiguous go/no-go criteria and automated fallback triggers.',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must segment by reversibility (two-way door vs one-way door errors), propose confidence-based routing with human-in-the-loop fallback for low-confidence outputs, and structure tiered pricing where enterprise pays a premium for guaranteed human-reviewed accuracy.',
    explanation:
      'AI error rates cannot be treated uniformly. High-stakes workflows demand confidence routing, audit provenance citations, and human-in-the-loop verification queues. Differentiating tiers allows capturing price-sensitive users while satisfying enterprise legal compliance.',
    rubric: STANDARD_CASE_RUBRIC,
    isActive: true,
    tags: ['case-study', 'ai-risk', 'tiered-packaging'],
  },
];
