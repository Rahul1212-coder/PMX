import { AssessmentQuestion, AssessmentCategory, PmCaseStudy } from '@/types';

export const PM_COMPETENCY_CATEGORIES: AssessmentCategory[] = [
  'Product Thinking',
  'Product Strategy',
  'Root Cause Analysis (RCA)',
  'Metrics & Analytics',
  'Prioritization',
  'User Research & Discovery',
  'Product Execution & Delivery',
  'Growth & Monetization',
  'Stakeholder Management',
  'Technical & Systems Thinking',
];

export const CATEGORY_RECOMMENDATIONS: Record<AssessmentCategory, string> = {
  'Product Thinking': 'Practice evaluating competing user needs, value propositions, and root customer problems.',
  'Product Strategy': 'Work on market segmentation, competitive positioning, and sustainable defensibility.',
  'Root Cause Analysis (RCA)': 'Continue with complex incident scenarios, funnel breakdowns, and cohort isolation.',
  'Metrics & Analytics': 'Practice interpreting ambiguous A/B experiments, statistical significance, and retention curves.',
  'Prioritization': 'Work on opportunity cost, resource allocation, and RICE scoring under tight constraints.',
  'User Research & Discovery': 'Practice customer interview techniques, avoiding leading questions, and synthesis.',
  'Product Execution & Delivery': 'Practice defining ruthless MVP scope, writing unambiguous acceptance criteria, and managing release risk.',
  'Growth & Monetization': 'Strengthen retention modeling, funnel activation loops, pricing sensitivity, and unit economics (LTV/CAC).',
  'Stakeholder Management': 'Practice executive-level trade-offs, cross-functional conflict resolution, and objective communication.',
  'Technical & Systems Thinking': 'Study API idempotency, reliability orchestration, security/privacy boundaries, and scalable data models.',
};

export const PM_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ==========================================
  // 1. PRODUCT THINKING (Q1 - Q5)
  // ==========================================
  {
    id: 1,
    category: 'Product Thinking',
    title: 'Identifying the real problem',
    scenario:
      'You are the PM of a food delivery app. Users frequently abandon the app after viewing restaurant menus. Your CEO believes the solution is to introduce a 20% discount on all orders.',
    question: 'What should you do first?',
    options: [
      { key: 'A', text: 'Launch the discount because price is usually the biggest barrier to purchase.' },
      { key: 'B', text: 'Analyze the funnel and investigate why users leave after viewing menus.' },
      { key: 'C', text: 'Redesign the entire restaurant menu experience.' },
      { key: 'D', text: 'Introduce a loyalty program to encourage users to complete orders.' },
    ],
    correctOption: 'B',
    explanation:
      'The observed behavior identifies where users drop off, not why. The PM should investigate potential causes, such as delivery fees, delivery times, menu availability, or checkout friction, before selecting a solution.',
    competencyTested: 'Problem identification and evidence-based decision-making.',
  },
  {
    id: 2,
    category: 'Product Thinking',
    title: 'Prioritizing user needs',
    scenario:
      'A project management tool receives three feature requests: Customers want a dark mode; Enterprise customers want advanced permission controls; New users want a simpler onboarding experience. You have capacity to deliver only one improvement this quarter.',
    question: 'What is the best approach?',
    options: [
      { key: 'A', text: 'Build dark mode because it is relatively easy to implement.' },
      { key: 'B', text: 'Prioritize enterprise permissions because enterprise customers pay more.' },
      { key: 'C', text: 'Evaluate user research, business impact, affected segments, and strategic objectives before choosing.' },
      { key: 'D', text: 'Build onboarding improvements because every new user experiences onboarding.' },
    ],
    correctOption: 'C',
    explanation:
      'None of the requests can be prioritized reliably from the information provided alone. The PM must understand the magnitude of each problem, its affected users, the expected impact, and the business context.',
    competencyTested: 'User-centric judgment and product decision-making.',
  },
  {
    id: 3,
    category: 'Product Thinking',
    title: 'Understanding the value proposition',
    scenario:
      'You are building an expense management product for small businesses. Competitors already offer expense tracking, receipt uploads, and reporting.',
    question: 'Which approach offers the strongest starting point for differentiation?',
    options: [
      { key: 'A', text: 'Add more reporting filters than competitors.' },
      { key: 'B', text: 'Identify an underserved customer problem and build a solution that delivers meaningfully better outcomes.' },
      { key: 'C', text: 'Match every competitor feature before launching.' },
      { key: 'D', text: 'Reduce the price below every competitor.' },
    ],
    correctOption: 'B',
    explanation:
      'Sustainable differentiation comes from solving an important customer problem better than existing alternatives. Feature parity and price cuts may be necessary in some circumstances, but they do not automatically create a compelling value proposition.',
    competencyTested: 'Value proposition and customer problem understanding.',
  },
  {
    id: 4,
    category: 'Product Thinking',
    title: 'Evaluating a feature request',
    scenario:
      'A large customer requests a custom dashboard that would take six weeks to build. The feature would benefit that customer but is unlikely to help other customers.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Build it immediately because retaining a large customer is the highest priority.' },
      { key: 'B', text: 'Reject it because custom features should never be built.' },
      { key: 'C', text: 'Understand the underlying need, evaluate commercial and strategic value, and explore a reusable solution or alternative.' },
      { key: 'D', text: 'Ask engineering to build it alongside the existing roadmap without changing any commitments.' },
    ],
    correctOption: 'C',
    explanation:
      'The request may reveal a broader problem, but its cost and strategic value need evaluation. A reusable capability may create more value than a one-off implementation.',
    competencyTested: 'Customer management and solution evaluation.',
  },
  {
    id: 5,
    category: 'Product Thinking',
    title: 'Defining product success',
    scenario:
      'You launch a new feature that allows users to schedule payments. Within a month, 40% of active users have tried it at least once. Your CEO considers the launch successful.',
    question: 'What additional evidence would best establish whether the feature is delivering value?',
    options: [
      { key: 'A', text: 'The number of users who opened the feature.' },
      { key: 'B', text: 'The number of social media mentions after launch.' },
      { key: 'C', text: 'Whether users repeatedly schedule payments, complete them successfully, and experience a meaningful improvement in their workflow.' },
      { key: 'D', text: 'The number of engineering hours spent building the feature.' },
    ],
    correctOption: 'C',
    explanation:
      'Adoption is an early signal, but repeated usage and successful outcomes are stronger evidence of sustained value. The relevant measures should also align with the original product objective.',
    competencyTested: 'Outcome-oriented product thinking.',
  },

  // ==========================================
  // 2. PRODUCT STRATEGY (Q6 - Q10)
  // ==========================================
  {
    id: 6,
    category: 'Product Strategy',
    title: 'Choosing a target market',
    scenario:
      'You are launching a B2B invoicing platform. Your potential markets include freelancers, small businesses, and large enterprises. Your team has limited resources, and each segment has different requirements.',
    question: 'What is the best next step?',
    options: [
      { key: 'A', text: 'Target all three segments to maximize market size.' },
      { key: 'B', text: 'Target enterprises because they typically have larger contracts.' },
      { key: 'C', text: 'Evaluate segment attractiveness, customer pain, willingness to pay, competition, and your ability to serve each segment before selecting an initial target.' },
      { key: 'D', text: 'Target freelancers because their requirements are simpler.' },
    ],
    correctOption: 'C',
    explanation:
      'Market size alone does not determine the best entry point. A strong strategy identifies an attractive segment that the company can serve competitively with available resources.',
    competencyTested: 'Market segmentation and strategic focus.',
  },
  {
    id: 7,
    category: 'Product Strategy',
    title: 'Responding to a competitor',
    scenario:
      'A competitor launches a free version of a product that you sell through paid subscriptions. Your sales team wants you to make your entire product free.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Immediately make the entire product free to avoid losing customers.' },
      { key: 'B', text: 'Maintain current pricing without investigating the competitive threat.' },
      { key: 'C', text: "Understand why customers choose each product, assess the competitor's offering and business model, and evaluate targeted responses." },
      { key: 'D', text: "Copy the competitor's free features and remove all premium features." },
    ],
    correctOption: 'C',
    explanation:
      'Competitor actions should inform strategy, not dictate it. The right response depends on customer segments, differentiation, monetization, unit economics, and the competitor’s ability to sustain its model.',
    competencyTested: 'Competitive strategy and commercial judgment.',
  },
  {
    id: 8,
    category: 'Product Strategy',
    title: 'Deciding whether to expand',
    scenario:
      'Your SaaS product has strong adoption among small businesses in India. Leadership wants to expand into Southeast Asia next quarter.',
    question: 'What should you evaluate before committing?',
    options: [
      { key: 'A', text: 'Whether competitors are already operating in Southeast Asia.' },
      { key: 'B', text: 'Whether the market has enough potential, customer needs are similar, localization requirements are manageable, and the business can support expansion.' },
      { key: 'C', text: 'Whether the product can be translated into additional languages.' },
      { key: 'D', text: 'Whether the sales team can begin contacting prospects immediately.' },
    ],
    correctOption: 'B',
    explanation:
      'Expansion requires evidence of market opportunity, product-market fit, operational readiness, regulatory considerations, and an economically viable go-to-market approach.',
    competencyTested: 'Market expansion and strategic planning.',
  },
  {
    id: 9,
    category: 'Product Strategy',
    title: 'Evaluating a new product opportunity',
    scenario:
      'Your company operates a payment processing platform. Leadership proposes building an AI-powered contract management product because AI is attracting significant market attention.',
    question: 'What is the strongest approach?',
    options: [
      { key: 'A', text: 'Build the product quickly to capitalize on the AI trend.' },
      { key: 'B', text: 'Reject the idea because it is outside the existing product category.' },
      { key: 'C', text: 'Assess customer demand, strategic fit, competitive alternatives, feasibility, differentiation, and the business case before deciding whether to invest.' },
      { key: 'D', text: 'Build a complete product before interviewing potential customers.' },
    ],
    correctOption: 'C',
    explanation:
      'New opportunities should be assessed against customer needs and company capabilities. Strategic adjacency can be valuable, but market popularity alone does not justify investment.',
    competencyTested: 'Opportunity assessment and strategic alignment.',
  },
  {
    id: 10,
    category: 'Product Strategy',
    title: 'Making a strategic trade-off',
    scenario:
      'Your product has two potential investments: Improve reliability for existing enterprise customers vs Launch a new feature that could attract additional customers. Reliability issues are causing some enterprise customers to consider leaving, while the new feature has promising early research results.',
    question: 'How should you decide?',
    options: [
      { key: 'A', text: 'Always prioritize new features because they create growth.' },
      { key: 'B', text: 'Always prioritize reliability because existing customers should come first.' },
      { key: 'C', text: 'Compare expected retention impact, growth potential, urgency, strategic objectives, risks, and resource requirements before allocating investment.' },
      { key: 'D', text: "Divide the team's time equally between the two initiatives." },
    ],
    correctOption: 'C',
    explanation:
      'Neither retention nor acquisition should automatically dominate. The decision depends on the severity and probability of customer loss, expected growth, business priorities, and the cost of delaying either initiative.',
    competencyTested: 'Strategic trade-offs and resource allocation.',
  },

  // ==========================================
  // 3. ROOT CAUSE ANALYSIS (RCA) (Q11 - Q15)
  // ==========================================
  {
    id: 11,
    category: 'Root Cause Analysis (RCA)',
    title: 'Conversion decline',
    scenario:
      "Your e-commerce product's purchase conversion rate falls from 4.0% to 2.8% over two weeks.",
    question: 'What should you do first?',
    options: [
      { key: 'A', text: 'Increase advertising spend to compensate for lost conversions.' },
      { key: 'B', text: 'Immediately redesign the checkout page.' },
      { key: 'C', text: 'Validate the data, identify when the decline began, and segment the funnel by device, channel, geography, and user cohort.' },
      { key: 'D', text: 'Introduce a discount for all users.' },
    ],
    correctOption: 'C',
    explanation:
      'First establish whether the decline is real and isolate where and for whom it occurs. This narrows the potential causes before interventions are selected.',
    competencyTested: 'Structured diagnosis and funnel analysis.',
  },
  {
    id: 12,
    category: 'Root Cause Analysis (RCA)',
    title: 'Declining retention',
    scenario:
      "A SaaS product's 30-day retention rate drops from 45% to 30% after a major release.",
    question: 'What is the most useful first investigation?',
    options: [
      { key: 'A', text: 'Increase customer support staffing immediately.' },
      { key: 'B', text: 'Compare retention across cohorts exposed to the release and examine changes in onboarding, core workflows, errors, and usage patterns.' },
      { key: 'C', text: 'Add new features to encourage repeat usage.' },
      { key: 'D', text: 'Increase the marketing budget to acquire more users.' },
    ],
    correctOption: 'B',
    explanation:
      'The timing suggests a possible relationship with the release, but it does not prove causation. Cohort analysis and investigation of the changed experience help identify plausible causes.',
    competencyTested: 'Release analysis and retention diagnosis.',
  },
  {
    id: 13,
    category: 'Root Cause Analysis (RCA)',
    title: 'Payment failure spike',
    scenario:
      "Your payment platform's transaction failure rate increases from 2% to 9% within 30 minutes.",
    question: 'What should you do first?',
    options: [
      { key: 'A', text: 'Stop all transactions permanently until the engineering team finds the cause.' },
      { key: 'B', text: 'Check monitoring and transaction-level data, identify affected payment methods and providers, and investigate recent changes or provider incidents while mitigating customer impact.' },
      { key: 'C', text: 'Send an email to all customers explaining that the payment platform is experiencing issues.' },
      { key: 'D', text: 'Immediately switch every transaction to another payment provider without evaluating its health or capacity.' },
    ],
    correctOption: 'B',
    explanation:
      'The situation calls for rapid triage and impact mitigation. Segmenting failures and checking recent changes can reveal whether the issue is isolated to a provider, payment method, integration, or platform-wide component.',
    competencyTested: 'Incident diagnosis and risk-based response.',
  },
  {
    id: 14,
    category: 'Root Cause Analysis (RCA)',
    title: 'Declining feature adoption',
    scenario:
      "A collaboration tool's document-sharing feature has seen a 35% reduction in usage over the past month.",
    question: 'Which approach is most appropriate?',
    options: [
      { key: 'A', text: 'Add more functionality to document sharing.' },
      { key: 'B', text: 'Investigate instrumentation, changes in user behavior, affected cohorts, competing workflows, and potential usability or reliability issues.' },
      { key: 'C', text: 'Send promotional emails asking users to share more documents.' },
      { key: 'D', text: 'Remove the feature and replace it with a new one.' },
    ],
    correctOption: 'B',
    explanation:
      'A decline in usage can result from measurement issues, changes in user needs, friction, reliability problems, or shifts to another workflow. The cause should be established before acting.',
    competencyTested: 'Behavioral analysis and root cause identification.',
  },
  {
    id: 15,
    category: 'Root Cause Analysis (RCA)',
    title: 'Revenue decline despite stable traffic',
    scenario:
      'A subscription product has stable website traffic and sign-up volume, but monthly revenue has fallen by 20%.',
    question: 'What should you investigate first?',
    options: [
      { key: 'A', text: 'Increase website traffic to recover revenue.' },
      { key: 'B', text: 'Reduce engineering expenditure.' },
      { key: 'C', text: 'Break revenue down into its drivers, including conversion to paid plans, average revenue per customer, cancellations, downgrades, refunds, and payment failures.' },
      { key: 'D', text: 'Launch a new marketing campaign immediately.' },
    ],
    correctOption: 'C',
    explanation:
      'Stable traffic and sign-ups suggest the problem may lie further down the revenue funnel or within the existing customer base. Revenue decomposition helps identify the affected driver.',
    competencyTested: 'Business diagnosis and revenue analysis.',
  },

  // ==========================================
  // 4. METRICS & PRODUCT ANALYTICS (Q16 - Q20)
  // ==========================================
  {
    id: 16,
    category: 'Metrics & Analytics',
    title: 'Selecting a North Star Metric',
    scenario:
      'You manage a collaborative project management product. The team currently uses monthly website visits as its primary success metric.',
    question: 'Which metric is likely to better represent the value users receive from the product?',
    options: [
      { key: 'A', text: 'Total page views.' },
      { key: 'B', text: 'Number of employees at customer companies.' },
      { key: 'C', text: 'Number of teams consistently completing meaningful project work through the platform.' },
      { key: 'D', text: 'Total number of features available.' },
    ],
    correctOption: 'C',
    explanation:
      "A North Star Metric should reflect recurring customer value and connect to sustainable business outcomes. Meaningful completed work is more closely tied to the product's purpose than raw traffic or feature count.",
    competencyTested: 'Metric selection and outcome orientation.',
  },
  {
    id: 17,
    category: 'Metrics & Analytics',
    title: 'Funnel conversion analysis',
    scenario:
      'Your onboarding funnel has the following step counts: 10,000 users sign up; 6,000 complete profile setup; 3,000 connect their first account; 1,500 complete their first transaction.',
    question: 'Where is the largest absolute number of users lost between consecutive steps?',
    options: [
      { key: 'A', text: 'Sign-up to profile setup (4,000 users lost).' },
      { key: 'B', text: 'Profile setup to account connection (3,000 users lost).' },
      { key: 'C', text: 'Account connection to first transaction (1,500 users lost).' },
      { key: 'D', text: 'Sign-up to profile setup, since 4,000 users dropped off.' },
    ],
    correctOption: 'D',
    explanation:
      'Sign-up to profile setup lost 4,000 users (10,000 - 6,000). Between profile setup and account connection, 3,000 were lost (6,000 - 3,000). Between account connection and first transaction, 1,500 were lost (3,000 - 1,500). Thus, Sign-up to profile setup had the largest absolute volume of dropped users.',
    competencyTested: 'Funnel mathematics and analytical precision.',
  },
  {
    id: 18,
    category: 'Metrics & Analytics',
    title: 'Interpreting an A/B test',
    scenario:
      'You test a new checkout design against the existing design. Control conversion: 5.0%. Variant conversion: 5.4%. The experiment has a small sample size, and the result is not statistically conclusive.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Roll out the variant because conversion increased.' },
      { key: 'B', text: 'Reject the variant because the result is not conclusive.' },
      { key: 'C', text: "Assess the experiment's statistical power, practical impact, guardrail metrics, and cost of further testing before deciding whether to continue or roll out." },
      { key: 'D', text: 'Roll out the variant to all users and measure the result afterward.' },
    ],
    correctOption: 'C',
    explanation:
      'A positive observed difference is not sufficient evidence of a reliable effect. The decision should account for uncertainty, potential downside, sample size, and the business importance of the improvement.',
    competencyTested: 'Experimentation and statistical judgment.',
  },
  {
    id: 19,
    category: 'Metrics & Analytics',
    title: 'Understanding retention calculation',
    scenario:
      'A fitness app acquires 5,000 users in January. Of these, 2,000 return during the second month.',
    question: 'What is the January cohort’s month-one retention rate, assuming all 5,000 users are eligible for the measurement?',
    options: [
      { key: 'A', text: '20%' },
      { key: 'B', text: '40%' },
      { key: 'C', text: '60%' },
      { key: 'D', text: '2.5%' },
    ],
    correctOption: 'B',
    explanation:
      'Retention = (users returning in defined period ÷ eligible users in original cohort) × 100. Calculation: 2,000 ÷ 5,000 × 100 = 40%.',
    competencyTested: 'Metric calculation and retention concepts.',
  },
  {
    id: 20,
    category: 'Metrics & Analytics',
    title: 'Choosing a guardrail metric',
    scenario:
      'Your team experiments with a simplified payment flow. The new design increases payment conversion by 8%, but customer complaints about duplicate transactions also increase.',
    question: 'Which approach is best?',
    options: [
      { key: 'A', text: 'Roll out the change because conversion improved.' },
      { key: 'B', text: 'Ignore complaints unless they affect revenue.' },
      { key: 'C', text: 'Evaluate the increase in duplicate transactions alongside conversion, investigate severity, and pause or limit rollout if customer harm is unacceptable.' },
      { key: 'D', text: 'Remove all payment confirmation steps to reduce friction further.' },
    ],
    correctOption: 'C',
    explanation:
      'Conversion is not the only measure of success. A payment experience must also preserve correctness, trust, and reliability. Guardrails prevent a local improvement from creating broader harm.',
    competencyTested: 'Experiment design and risk-aware metrics.',
  },

  // ==========================================
  // 5. PRIORITIZATION & DECISION-MAKING (Q21 - Q25)
  // ==========================================
  {
    id: 21,
    category: 'Prioritization',
    title: 'Choosing between competing features',
    scenario:
      'Your team has capacity for one major improvement. Feature A has High Impact, High Effort; Feature B has Medium Impact, Low Effort; Feature C has Low Impact, Low Effort; Feature D has High Impact, Medium Effort.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Always select Feature B because it is easiest to deliver.' },
      { key: 'B', text: 'Always select Feature A because it has high impact.' },
      { key: 'C', text: 'Compare expected outcomes, confidence, strategic alignment, dependencies, risks, and effort before making the decision.' },
      { key: 'D', text: 'Select Feature C because it is the least expensive.' },
    ],
    correctOption: 'C',
    explanation:
      'Prioritization requires more than comparing impact and effort labels. Confidence, timing, dependencies, and strategic objectives may change the preferred option.',
    competencyTested: 'Prioritization and judgment.',
  },
  {
    id: 22,
    category: 'Prioritization',
    title: 'Applying the RICE framework',
    scenario:
      'Two features have these estimates: Feature A (Reach: 1,000, Impact: 3, Confidence: 80%, Effort: 4); Feature B (Reach: 2,000, Impact: 1, Confidence: 50%, Effort: 5). Formula: RICE = (Reach × Impact × Confidence) / Effort.',
    question: 'Which feature has the higher score?',
    options: [
      { key: 'A', text: 'Feature A, with a score of 600.' },
      { key: 'B', text: 'Feature B, with a score of 200.' },
      { key: 'C', text: 'Both have the same score.' },
      { key: 'D', text: 'The information is insufficient to calculate RICE.' },
    ],
    correctOption: 'A',
    explanation:
      'Feature A: 1,000 × 3 × 0.80 ÷ 4 = 600. Feature B: 2,000 × 1 × 0.50 ÷ 5 = 200. Feature A has a significantly higher score under the quantitative model.',
    competencyTested: 'Prioritization frameworks and quantitative reasoning.',
  },
  {
    id: 23,
    category: 'Prioritization',
    title: 'Handling urgent stakeholder requests',
    scenario:
      'Your CEO requests a new dashboard for an investor meeting in two weeks. The engineering team is already committed to fixing a major reliability issue.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: "Stop the reliability work immediately because the CEO's request is urgent." },
      { key: 'B', text: 'Reject the dashboard request without discussing alternatives.' },
      { key: 'C', text: 'Clarify the minimum outcome required for the meeting, assess reliability risk, and present feasible options with explicit trade-offs.' },
      { key: 'D', text: 'Ask engineering to work overtime to deliver both.' },
    ],
    correctOption: 'C',
    explanation:
      'The PM must make constraints and trade-offs visible, find the smallest useful solution where possible, and avoid making commitments without considering reliability risks and team capacity.',
    competencyTested: 'Prioritization under pressure.',
  },
  {
    id: 24,
    category: 'Prioritization',
    title: 'Managing technical debt',
    scenario:
      'Your product has accumulated technical debt. Feature delivery is slowing, but customers are also requesting several new capabilities.',
    question: 'What is the best approach?',
    options: [
      { key: 'A', text: 'Allocate all engineering capacity to technical debt until it is eliminated.' },
      { key: 'B', text: 'Ignore technical debt and focus only on customer requests.' },
      { key: 'C', text: 'Quantify its impact on delivery speed, reliability, and future costs, then balance debt reduction with customer and business priorities.' },
      { key: 'D', text: 'Ask engineering to resolve the debt without allocating explicit capacity.' },
    ],
    correctOption: 'C',
    explanation:
      'Technical debt should be treated as a product and business trade-off. Its priority depends on its current and expected impact, not simply on the fact that it exists.',
    competencyTested: 'Long-term execution and resource allocation.',
  },
  {
    id: 25,
    category: 'Prioritization',
    title: 'Deciding what not to build',
    scenario:
      'Customers request 15 features, but your team can deliver only three this quarter. The requests come from different segments, and some conflict with your product strategy.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Build the three most frequently requested features.' },
      { key: 'B', text: 'Build the three easiest features.' },
      { key: 'C', text: 'Evaluate requests against strategic goals, customer impact, evidence, opportunity cost, and feasibility, then communicate what will not be built and why.' },
      { key: 'D', text: 'Let engineering choose the three features.' },
    ],
    correctOption: 'C',
    explanation:
      'Good prioritization includes deliberate deprioritization. A PM should make transparent choices based on outcomes and explain the rationale to stakeholders.',
    competencyTested: 'Strategic prioritization and communication.',
  },

  // ==========================================
  // 6. USER RESEARCH & PRODUCT DISCOVERY (Q26 - Q30)
  // ==========================================
  {
    id: 26,
    category: 'User Research & Discovery',
    title: 'Conducting customer interviews',
    scenario:
      'You are researching why small businesses struggle with expense management. You interview a business owner and ask: "Would you use an AI tool that automatically categorizes your expenses?" The owner says yes.',
    question: 'What should you do next?',
    options: [
      { key: 'A', text: 'Treat the answer as validation and begin development.' },
      { key: 'B', text: 'Ask the owner about recent expense-management experiences, current workflows, specific difficulties, and how they solve those problems today.' },
      { key: 'C', text: 'Ask whether they would pay ₹999 per month for the proposed tool.' },
      { key: 'D', text: 'Send the owner a list of planned features and ask them to select their favorites.' },
    ],
    correctOption: 'B',
    explanation:
      'Questions about actual behavior and past experiences provide stronger evidence than hypothetical willingness to use a proposed solution. The goal is to understand the problem before validating a specific feature.',
    competencyTested: 'Customer interviewing and problem discovery.',
  },
  {
    id: 27,
    category: 'User Research & Discovery',
    title: 'Validating an idea before building',
    scenario:
      'You want to build a vendor management platform for small businesses. You have a hypothesis that vendors spend too much time following up on payments. Your engineering team estimates three months to build the product.',
    question: 'What should you do first?',
    options: [
      { key: 'A', text: 'Start development because the hypothesis sounds reasonable.' },
      { key: 'B', text: 'Create a detailed product roadmap for the next year.' },
      { key: 'C', text: 'Validate the problem with target customers and test the proposed value using a low-cost prototype, mock-up, or manual workflow.' },
      { key: 'D', text: 'Ask the engineering team to reduce the estimate.' },
    ],
    correctOption: 'C',
    explanation:
      'Before making a substantial investment, the team should establish whether the problem is real, sufficiently painful, and worth solving. Lightweight experiments can test assumptions at lower cost.',
    competencyTested: 'Discovery, validation, and risk reduction.',
  },
  {
    id: 28,
    category: 'User Research & Discovery',
    title: 'Handling conflicting customer feedback',
    scenario:
      'Five enterprise customers request advanced reporting, while 100 small-business customers request simpler onboarding. Both groups are important to your company.',
    question: 'How should you decide which problem to address?',
    options: [
      { key: 'A', text: 'Prioritize the five enterprise customers because each contributes more revenue.' },
      { key: 'B', text: 'Prioritize the 100 small businesses because they represent more users.' },
      { key: 'C', text: 'Compare the severity and frequency of each problem, affected customer value, retention and growth implications, strategic fit, and implementation cost.' },
      { key: 'D', text: 'Build both features regardless of engineering capacity.' },
    ],
    correctOption: 'C',
    explanation:
      'Customer count and account value are important inputs, but neither determines priority alone. The PM needs to understand the business impact and the nature of each problem.',
    competencyTested: 'Research synthesis and customer segmentation.',
  },
  {
    id: 29,
    category: 'User Research & Discovery',
    title: 'Identifying a misleading research result',
    scenario:
      'You conduct a survey asking 500 users whether they would like a new feature. Eighty percent respond positively.',
    question: 'What can you reasonably conclude?',
    options: [
      { key: 'A', text: 'Eighty percent of users will adopt the feature after launch.' },
      { key: 'B', text: 'The feature will increase revenue by 80%.' },
      { key: 'C', text: 'The survey indicates stated interest among respondents, but adoption and business impact still need validation.' },
      { key: 'D', text: 'The feature should automatically become the team’s highest priority.' },
    ],
    correctOption: 'C',
    explanation:
      'Stated preference is not equivalent to actual behavior. Adoption depends on the underlying problem, product experience, switching costs, and other factors. The survey may also be affected by sampling and question wording.',
    competencyTested: 'Research interpretation and assumption validation.',
  },
  {
    id: 30,
    category: 'User Research & Discovery',
    title: 'Choosing research methods',
    scenario:
      'Your team wants to understand why users abandon a complicated onboarding flow.',
    question: 'Which combination of research methods would provide the strongest starting point?',
    options: [
      { key: 'A', text: 'Conduct only a broad survey asking whether onboarding is easy.' },
      { key: 'B', text: 'Review funnel analytics and session behavior, then interview representative users or observe them completing onboarding.' },
      { key: 'C', text: 'Ask the engineering team why users abandon onboarding.' },
      { key: 'D', text: 'Compare your onboarding screen with a competitor’s screen and copy its design.' },
    ],
    correctOption: 'B',
    explanation:
      'Quantitative data helps identify where abandonment occurs, while qualitative research helps explain why. Combining the two provides a stronger basis for deciding what to improve.',
    competencyTested: 'Research design and triangulation.',
  },

  // ==========================================
  // 7. PRODUCT EXECUTION & DELIVERY (Q31 - Q35)
  // ==========================================
  {
    id: 31,
    category: 'Product Execution & Delivery',
    title: 'Defining an MVP',
    scenario:
      'You are building an MVP for a digital expense management product. The proposed scope includes expense submission, approval workflows, accounting integrations, advanced analytics, custom dashboards, and AI-powered insights. The team has six weeks to launch.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Build every feature with reduced functionality.' },
      { key: 'B', text: 'Launch only the dashboard because it will look impressive to customers.' },
      { key: 'C', text: 'Identify the primary customer problem, define the minimum end-to-end workflow needed to solve it, and defer nonessential capabilities.' },
      { key: 'D', text: 'Delay the launch until every proposed feature is ready.' },
    ],
    correctOption: 'C',
    explanation:
      'An MVP should deliver a complete, meaningful outcome for a defined user and test critical assumptions. It is not simply a collection of incomplete features.',
    competencyTested: 'Scope definition and execution judgment.',
  },
  {
    id: 32,
    category: 'Product Execution & Delivery',
    title: 'Writing acceptance criteria',
    scenario:
      'Engineering receives the requirement: "Users should be able to upload invoices." The team interprets the requirement differently, leading to rework.',
    question: 'What should the PM do?',
    options: [
      { key: 'A', text: 'Ask engineering to use its judgment.' },
      { key: 'B', text: 'Specify relevant user flows, supported file types, file-size limits, validation rules, error states, permissions, and expected outcomes.' },
      { key: 'C', text: 'Write a longer description without defining expected behavior.' },
      { key: 'D', text: 'Ask QA to decide how the feature should work after development.' },
    ],
    correctOption: 'B',
    explanation:
      'Acceptance criteria should make expected behavior clear and testable, including important edge cases. The appropriate detail depends on the feature’s complexity and risk.',
    competencyTested: 'Requirements writing and cross-functional execution.',
  },
  {
    id: 33,
    category: 'Product Execution & Delivery',
    title: 'Managing a delayed release',
    scenario:
      'A product release is scheduled for Friday. On Wednesday, QA identifies a critical defect that could cause customers to lose transaction data. Sales has already communicated the launch date to customers.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Launch on Friday because the date has already been communicated.' },
      { key: 'B', text: 'Ask QA to classify the issue as low priority so the release can proceed.' },
      { key: 'C', text: 'Assess severity and exposure, work with engineering on mitigation, and delay or restrict the release if the risk cannot be acceptably controlled.' },
      { key: 'D', text: "Remove QA from the release decision because product delivery is the PM's responsibility." },
    ],
    correctOption: 'C',
    explanation:
      'Preventing serious customer harm takes precedence over an arbitrary launch date. The PM should communicate the impact, coordinate remediation, and consider safe alternatives such as a limited rollout.',
    competencyTested: 'Release management and risk judgment.',
  },
  {
    id: 34,
    category: 'Product Execution & Delivery',
    title: 'Managing dependencies',
    scenario:
      'Your product team is building a payment reconciliation feature. The launch depends on a third-party banking API, but the provider has not confirmed its delivery date.',
    question: 'How should you manage the dependency?',
    options: [
      { key: 'A', text: 'Continue planning as if the API will arrive on schedule.' },
      { key: 'B', text: 'Delay all work until the provider responds.' },
      { key: 'C', text: 'Identify the critical dependency, establish a contingency plan, test with mocks or sample data where appropriate, and separate independent work from provider-dependent work.' },
      { key: 'D', text: "Ask engineering to bypass the bank's integration requirements." },
    ],
    correctOption: 'C',
    explanation:
      'Good execution makes dependencies visible and reduces avoidable waiting. Mocking can support development, but the final integration must still be validated against the actual provider.',
    competencyTested: 'Dependency management and execution planning.',
  },
  {
    id: 35,
    category: 'Product Execution & Delivery',
    title: 'Defining a successful launch',
    scenario:
      'Your team launches a new invoice approval workflow. The feature is delivered on time and has no major defects, but only 5% of eligible customers use it after one month.',
    question: 'What is the best next step?',
    options: [
      { key: 'A', text: 'Declare success because the delivery met the schedule.' },
      { key: 'B', text: 'Investigate awareness, activation, usability, workflow fit, and customer needs; then decide whether to improve adoption, reposition the feature, or stop investing.' },
      { key: 'C', text: 'Immediately rebuild the entire feature.' },
      { key: 'D', text: 'Measure engineering velocity to determine whether the launch was successful.' },
    ],
    correctOption: 'B',
    explanation:
      'Delivery success and product success are different. A launch must be evaluated against the customer and business outcomes it was intended to achieve.',
    competencyTested: 'Post-launch evaluation and continuous improvement.',
  },

  // ==========================================
  // 8. GROWTH & MONETIZATION (Q36 - Q40)
  // ==========================================
  {
    id: 36,
    category: 'Growth & Monetization',
    title: 'Improving activation',
    scenario:
      'Your B2B SaaS product receives 10,000 sign-ups per month, but only 15% of new users complete their first meaningful action. The team proposes spending more on marketing.',
    question: 'What should you do first?',
    options: [
      { key: 'A', text: 'Increase the marketing budget to acquire more users.' },
      { key: 'B', text: 'Investigate onboarding friction and identify the behaviors associated with users reaching their first meaningful outcome.' },
      { key: 'C', text: 'Offer annual subscriptions to every new user.' },
      { key: 'D', text: 'Add more features to the dashboard.' },
    ],
    correctOption: 'B',
    explanation:
      'If many users fail to reach the product’s initial value, acquiring more users may simply increase the number who fail to activate. Improving activation makes existing acquisition spend significantly more productive.',
    competencyTested: 'Activation and growth analysis.',
  },
  {
    id: 37,
    category: 'Growth & Monetization',
    title: 'Evaluating pricing changes',
    scenario:
      'Your SaaS product charges ₹1,000 per month. Leadership proposes increasing the price to ₹1,500 to improve revenue.',
    question: 'What should you evaluate before implementing the increase?',
    options: [
      { key: 'A', text: 'Whether competitors charge more.' },
      { key: 'B', text: 'Whether the engineering team can implement the new price.' },
      { key: 'C', text: 'Customer value, willingness to pay, segment sensitivity, conversion and churn risks, competitive positioning, and expected revenue impact.' },
      { key: 'D', text: 'Whether the new price looks more premium.' },
    ],
    correctOption: 'C',
    explanation:
      'Higher prices can increase revenue per customer but may reduce conversion or retention. The PM should assess the expected net effect rather than assume that a higher price automatically improves the business.',
    competencyTested: 'Pricing strategy and commercial judgment.',
  },
  {
    id: 38,
    category: 'Growth & Monetization',
    title: 'Understanding unit economics (LTV)',
    scenario:
      'A subscription product generates ₹2,000 in monthly revenue per customer. Its gross margin is 80%, and the average customer remains subscribed for 10 months.',
    question: 'Assuming constant monthly revenue and gross margin, what is the customer’s gross-profit lifetime value before acquisition and other excluded costs?',
    options: [
      { key: 'A', text: '₹2,000' },
      { key: 'B', text: '₹8,000' },
      { key: 'C', text: '₹16,000' },
      { key: 'D', text: '₹20,000' },
    ],
    correctOption: 'C',
    explanation:
      'Gross-profit LTV = Monthly revenue × Gross margin × Customer lifetime = ₹2,000 × 0.80 × 10 = ₹16,000.',
    competencyTested: 'Unit economics and business mathematics.',
  },
  {
    id: 39,
    category: 'Growth & Monetization',
    title: 'Diagnosing growth slowdown',
    scenario:
      'A consumer app’s new-user acquisition has grown by 30% month over month, but monthly active users have remained nearly flat for three months.',
    question: 'What should you investigate?',
    options: [
      { key: 'A', text: 'Whether the company needs more acquisition channels.' },
      { key: 'B', text: 'Whether users are churning, failing to activate, returning less frequently, or being affected by changes in measurement.' },
      { key: 'C', text: 'Whether the app needs a new logo.' },
      { key: 'D', text: 'Whether the acquisition budget can be doubled.' },
    ],
    correctOption: 'B',
    explanation:
      'Active users depend on both new users entering the product and existing users remaining active. Strong acquisition can easily be offset by poor activation or retention (a leaky bucket).',
    competencyTested: 'Growth decomposition and lifecycle analysis.',
  },
  {
    id: 40,
    category: 'Growth & Monetization',
    title: 'Choosing a growth experiment',
    scenario:
      'You want to increase referrals for a professional networking product. Three ideas are proposed: Add a referral incentive; Improve the invitation flow; Send reminder notifications to users who have not invited anyone.',
    question: 'What is the best approach?',
    options: [
      { key: 'A', text: 'Implement all three simultaneously and attribute any improvement to the most popular idea.' },
      { key: 'B', text: 'Choose the idea with the most attractive user interface.' },
      { key: 'C', text: 'Establish a baseline and hypothesis, prioritize an experiment, define the primary metric and guardrails, and measure the outcome.' },
      { key: 'D', text: 'Launch the incentive because financial rewards always improve referrals.' },
    ],
    correctOption: 'C',
    explanation:
      'Experiments should test a specific hypothesis against a defined outcome. Where practical, testing alternatives separately or with a suitable experimental design helps isolate their effects.',
    competencyTested: 'Growth experimentation and measurement.',
  },

  // ==========================================
  // 9. STAKEHOLDER MANAGEMENT (Q41 - Q45)
  // ==========================================
  {
    id: 41,
    category: 'Stakeholder Management',
    title: 'Resolving a stakeholder conflict',
    scenario:
      'The Sales team promises a customer that a feature will be delivered in two weeks. Engineering estimates that it will take six weeks, and the feature is not on the roadmap.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Ask engineering to meet the two-week deadline because the customer has already been promised.' },
      { key: 'B', text: 'Tell Sales that it cannot make product commitments without permission.' },
      { key: 'C', text: "Understand the customer's underlying need, assess the actual effort and business impact, and align Sales and Engineering on feasible options and a realistic commitment." },
      { key: 'D', text: 'Immediately add the feature to the roadmap and remove another feature without consulting stakeholders.' },
    ],
    correctOption: 'C',
    explanation:
      'The PM should resolve the underlying conflict rather than simply favor one team. A smaller solution, alternative workflow, or revised timeline may meet the customer’s need without creating an unrealistic commitment.',
    competencyTested: 'Stakeholder alignment and negotiation.',
  },
  {
    id: 42,
    category: 'Stakeholder Management',
    title: 'Handling a disagreement with engineering',
    scenario:
      'You believe a feature should be launched this quarter because it supports a strategic objective. The engineering lead argues that the proposed architecture will create significant scalability problems.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Insist on the launch because prioritization is the PM’s responsibility.' },
      { key: 'B', text: 'Defer entirely to engineering and abandon the feature.' },
      { key: 'C', text: 'Understand the technical risks, explore alternative implementations, compare the costs of each option, and make a decision based on customer value and long-term implications.' },
      { key: 'D', text: 'Ask leadership to overrule engineering without further discussion.' },
    ],
    correctOption: 'C',
    explanation:
      'Strong PMs combine product judgment with technical input. They neither ignore engineering risks nor automatically abandon customer value because a proposed implementation is difficult.',
    competencyTested: 'Cross-functional decision-making and technical collaboration.',
  },
  {
    id: 43,
    category: 'Stakeholder Management',
    title: 'Communicating a missed target',
    scenario:
      'Your team committed to increasing activation from 20% to 30%. After the quarter, activation reaches only 24%. Leadership asks why the target was missed.',
    question: 'What is the strongest response?',
    options: [
      { key: 'A', text: 'Explain that engineering delivered the features late.' },
      { key: 'B', text: 'Emphasize that activation improved by 4 percentage points and avoid discussing the original target.' },
      { key: 'C', text: 'Present the result against the target, explain the evidence behind the shortfall, distinguish known causes from hypotheses, and describe the corrective actions.' },
      { key: 'D', text: 'Change the target to 24% in the reporting dashboard.' },
    ],
    correctOption: 'C',
    explanation:
      'Effective communication is transparent about outcomes, explains what was learned, and focuses on actions rather than blame. It also preserves the integrity of the original target.',
    competencyTested: 'Accountability and executive communication.',
  },
  {
    id: 44,
    category: 'Stakeholder Management',
    title: 'Handling an urgent executive request',
    scenario:
      'Your CTO asks you to prioritize a technical initiative. Your CEO wants a customer-facing feature delivered in the same sprint. Both claim their request is critical.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Prioritize the CEO’s request because the CEO has greater authority.' },
      { key: 'B', text: 'Prioritize the CTO’s request because technical work is more difficult to estimate.' },
      { key: 'C', text: 'Clarify the intended outcomes, urgency, risks, dependencies, and opportunity costs, then facilitate an explicit decision on priorities and trade-offs.' },
      { key: 'D', text: 'Ask the team to work on both without changing the sprint commitment.' },
    ],
    correctOption: 'C',
    explanation:
      'The PM should establish a shared understanding of business impact and constraints. When priorities genuinely conflict, the decision should be explicit rather than silently transferred to the delivery team.',
    competencyTested: 'Conflict resolution and prioritization.',
  },
  {
    id: 45,
    category: 'Stakeholder Management',
    title: 'Responding to negative customer feedback',
    scenario:
      'An enterprise customer sends an angry email claiming that your product is unreliable and threatens to cancel their contract.',
    question: 'What is the best response?',
    options: [
      { key: 'A', text: 'Explain that the problem is probably caused by the customer’s configuration.' },
      { key: 'B', text: 'Immediately promise that all issues will be fixed within 24 hours.' },
      { key: 'C', text: 'Acknowledge the concern, investigate the reported impact, coordinate the appropriate response, communicate realistic next steps, and follow through.' },
      { key: 'D', text: 'Offer a discount before understanding the problem.' },
    ],
    correctOption: 'C',
    explanation:
      'The response should establish trust through acknowledgment, investigation, realistic commitments, and follow-through. Promising an unverified resolution can create further problems.',
    competencyTested: 'Customer communication and incident ownership.',
  },

  // ==========================================
  // 10. TECHNICAL & SYSTEMS THINKING (Q46 - Q50)
  // ==========================================
  {
    id: 46,
    category: 'Technical & Systems Thinking',
    title: 'Handling a failed API request',
    scenario:
      'Your platform integrates with a banking API to initiate payouts. Sometimes the API times out after a payout request is submitted. Your platform does not know whether the bank processed the transaction.',
    question: 'What is the safest product and engineering approach?',
    options: [
      { key: 'A', text: 'Retry the request repeatedly until the API returns success.' },
      { key: 'B', text: 'Mark the payout as failed whenever a timeout occurs.' },
      { key: 'C', text: 'Use a reliable transaction identifier and idempotency where supported, reconcile the transaction’s actual status, and retry only under controlled conditions.' },
      { key: 'D', text: 'Ask the user to submit the same payout again immediately.' },
    ],
    correctOption: 'C',
    explanation:
      'A timeout does not necessarily mean the bank failed to process the request. Blind retries can create duplicate payouts. Idempotency, status reconciliation, and controlled retry policies help reduce this risk.',
    competencyTested: 'API integration, transaction safety, and reliability.',
  },
  {
    id: 47,
    category: 'Technical & Systems Thinking',
    title: 'Understanding system scalability',
    scenario:
      'Your SaaS platform currently supports 1,000 customers. A major partnership may increase usage tenfold within three months.',
    question: 'What should you do?',
    options: [
      { key: 'A', text: 'Immediately rewrite the entire application using microservices.' },
      { key: 'B', text: 'Assume the existing architecture will scale because it supports current customers.' },
      { key: 'C', text: 'Work with engineering to identify capacity limits, model expected load, review database and service bottlenecks, and test the system against anticipated usage.' },
      { key: 'D', text: 'Delay the partnership until the platform has been completely rebuilt.' },
    ],
    correctOption: 'C',
    explanation:
      'Scalability should be evaluated using evidence about expected load and system constraints. A complete rewrite may be unnecessary, while assuming that the current system will scale creates avoidable risk.',
    competencyTested: 'Scalability planning and technical judgment.',
  },
  {
    id: 48,
    category: 'Technical & Systems Thinking',
    title: 'Managing data security & AI privacy',
    scenario:
      'You are building an AI-powered contract management product. Customers upload confidential agreements containing commercially sensitive information. The team proposes sending all documents to an external AI service to generate summaries.',
    question: 'What should you do before approving the approach?',
    options: [
      { key: 'A', text: 'Proceed because AI summaries improve customer productivity.' },
      { key: 'B', text: 'Allow the integration as long as users accept the terms and conditions.' },
      { key: 'C', text: 'Evaluate data handling, contractual permissions, access controls, retention, provider policies, regulatory obligations, and the risks of exposing sensitive information.' },
      { key: 'D', text: 'Remove all authentication requirements to make the AI integration easier.' },
    ],
    correctOption: 'C',
    explanation:
      'AI integration must account for confidentiality, access control, contractual commitments, applicable law, and the provider’s data practices. The PM should work with security, legal, and engineering teams before approving the design.',
    competencyTested: 'Security awareness, privacy, and responsible AI product management.',
  },
  {
    id: 49,
    category: 'Technical & Systems Thinking',
    title: 'Choosing an integration strategy',
    scenario:
      'Your expense management platform must integrate with SAP, NetSuite, Microsoft Dynamics, and Zoho Books. Each system has different APIs, authentication mechanisms, and data models.',
    question: 'What is the strongest product and technical approach?',
    options: [
      { key: 'A', text: 'Build four completely unrelated integration implementations without shared components.' },
      { key: 'B', text: 'Create a single generic integration and assume every accounting system behaves identically.' },
      { key: 'C', text: 'Define a common integration architecture and canonical data model where appropriate, while handling provider-specific mappings, authentication, errors, and synchronization requirements.' },
      { key: 'D', text: 'Ask every customer to export CSV files manually instead of supporting integrations.' },
    ],
    correctOption: 'C',
    explanation:
      'A shared architecture can reduce duplicated work and improve maintainability, while provider-specific differences still need to be handled explicitly. The right abstraction depends on actual integration requirements.',
    competencyTested: 'Integration architecture and systems thinking.',
  },
  {
    id: 50,
    category: 'Technical & Systems Thinking',
    title: 'Designing for reliability & payment fallbacks',
    scenario:
      'Your payment platform depends on a primary payment provider. When that provider experiences an outage, transactions fail. A second provider is available, but it has different fees and transaction limits.',
    question: 'What should you consider when designing a fallback strategy?',
    options: [
      { key: 'A', text: 'Route every transaction to the second provider immediately, regardless of cost or capability.' },
      { key: 'B', text: 'Keep using the primary provider until the outage is resolved.' },
      { key: 'C', text: 'Define failure detection, eligibility rules, provider health checks, retry behavior, routing constraints, transaction reconciliation, and monitoring for the fallback path.' },
      { key: 'D', text: 'Retry all failed transactions indefinitely through both providers.' },
    ],
    correctOption: 'C',
    explanation:
      'A robust fallback mechanism must consider provider health, transaction compatibility, cost, retry safety, and transaction state. Switching providers without understanding transaction outcomes can create duplicates or inconsistent records.',
    competencyTested: 'Reliability engineering, payment orchestration, and risk-aware product decisions.',
  },
];

// ==========================================
// LAYER 2: PRACTICAL PM CASE STUDIES
// ==========================================
export const PM_CASE_STUDIES: PmCaseStudy[] = [
  {
    id: 'case-1',
    title: 'Build a Product: Small Business Expense Management',
    category: 'Product Thinking & Strategy',
    scenario:
      'Design an expense management product tailored for small businesses (1-50 employees). Existing tools are bloated enterprise ERPs or over-simplistic consumer receipt scanners.',
    contextPoints: [
      'Problem: SMB owners spend ~12 hours/month manually reconciling receipts with credit card statements.',
      'Goal: Launch an MVP within 6 weeks to capture initial early adopters.',
      'Constraints: 1 PM, 2 Full-Stack Engineers, 1 Product Designer.',
    ],
    tasks: [
      '1. Target Segment: Define the primary persona and their core pain point.',
      '2. MVP Scope: Specify the minimum end-to-end user journey that provides immediate value.',
      '3. Differentiation: How does your product win against traditional spreadsheet templates and enterprise tools?',
      '4. North Star Metric: Which recurring value metric proves sustained retention?',
    ],
    rubric: [
      { dimension: 'Problem Framing', weight: '25%', description: 'Clarity on root friction rather than vanity features.' },
      { dimension: 'MVP Scoping', weight: '25%', description: 'Ruthless focus on the critical path without scope creep.' },
      { dimension: 'Differentiation', weight: '25%', description: 'Compelling reason for customers to switch.' },
      { dimension: 'Metrics & Retention', weight: '25%', description: 'Leading indicator of long-term value.' },
    ],
  },
  {
    id: 'case-2',
    title: 'Diagnose a Problem: Improve Payment Success Rates',
    category: 'Root Cause Analysis & Incident Response',
    scenario:
      'You are the PM of a payment platform processing merchant checkouts. Over the past 4 weeks, payment success rate fell from 96% to 88% while transaction volume jumped 40% and two new providers were integrated.',
    contextPoints: [
      'Success rate dropped from 96% to 88%.',
      'Transaction volume increased by 40%.',
      'Two new payment gateway providers were recently integrated.',
      'Customer complaints about failed and duplicate payments have tripled.',
    ],
    tasks: [
      '1. Problem Definition: What immediate telemetry and logs would you request?',
      '2. RCA Segmentation: How would you segment data to isolate the root cause?',
      '3. Plausible Hypotheses: Propose 3 distinct hypotheses and how to test each.',
      '4. Immediate Mitigation: What steps reduce merchant and buyer churn today?',
      '5. Long-term Prevention: What architectural guardrails prevent recurrence?',
      '6. Metric Guardrails: Define the primary recovery metric and critical safety guardrails.',
    ],
    rubric: [
      { dimension: 'Problem Framing', weight: '15%', description: 'Triage speed and clear boundary definition.' },
      { dimension: 'Analytical Approach', weight: '25%', description: 'Data segmentation across methods, providers, and devices.' },
      { dimension: 'Hypothesis Quality', weight: '15%', description: 'Plausible technical and behavioral drivers.' },
      { dimension: 'Immediate Mitigation', weight: '15%', description: 'Fallback routing and customer impact minimization.' },
      { dimension: 'Long-term Solution', weight: '15%', description: 'Idempotency and circuit-breaker orchestration.' },
      { dimension: 'Metrics & Validation', weight: '15%', description: 'Success and guardrail monitoring.' },
    ],
  },
  {
    id: 'case-3',
    title: 'Create a Strategy: Scale B2B SaaS from 500 to 2,000 Customers',
    category: 'Product Strategy & Growth',
    scenario:
      'Your B2B SaaS product has strong PMF among design agencies. Leadership sets an annual goal to quadruple customer count from 500 to 2,000 accounts.',
    contextPoints: [
      'Current ACV: $2,400/yr ($200/month).',
      'Primary acquisition channel: Organic word-of-mouth and outbound sales.',
      'Churn rate: 1.2% monthly.',
    ],
    tasks: [
      '1. Market Expansion: Should you expand downmarket (freelancers), upmarket (enterprise), or expand adjacent verticals?',
      '2. Product-Led Loops: How can existing agency collaboration drive organic customer acquisition?',
      '3. Unit Economics: How do you protect LTV/CAC payback while quadrupling volume?',
      '4. Execution Milestones: Outline quarterly milestones to derisk growth.',
    ],
    rubric: [
      { dimension: 'Market Positioning', weight: '25%', description: 'Clear strategic rationale for chosen target segment.' },
      { dimension: 'Growth Loops', weight: '25%', description: 'Self-sustaining PLG mechanisms.' },
      { dimension: 'Monetization & Economics', weight: '25%', description: 'Healthy unit economics and margin preservation.' },
      { dimension: 'Risk Management', weight: '25%', description: 'Anticipating scaling bottlenecks.' },
    ],
  },
  {
    id: 'case-4',
    title: 'Prioritize a Roadmap: 10 Competing Demands with Limited Capacity',
    category: 'Prioritization & Trade-offs',
    scenario:
      'You are leading a squad of 4 engineers and 1 designer. Sales, CEO, Support, and Engineering Lead have brought 10 competing demands for next quarter. You can only ship 3.',
    contextPoints: [
      'CEO wants AI Co-pilot for pitch deck showcase.',
      'Sales needs Salesforce integration to close a $50k deal.',
      'Engineering demands refactoring database queries causing occasional latency spikes.',
      'Users complain about complex multi-step export workflows.',
    ],
    tasks: [
      '1. Framework Application: Which prioritization framework would you apply and why?',
      '2. Trade-off Matrix: How do you evaluate the $50k sales deal vs technical latency?',
      '3. Stakeholder Alignment: How do you communicate what is NOT being built without alienating the CEO or Sales?',
      '4. Squad Morale: How do you maintain engineering trust regarding technical debt?',
    ],
    rubric: [
      { dimension: 'Framework Rigor', weight: '25%', description: 'Objective quantitative model applied with strategic nuance.' },
      { dimension: 'Executive Trade-offs', weight: '25%', description: 'Balancing short-term revenue with long-term platform health.' },
      { dimension: 'Communication', weight: '25%', description: 'Empathic, transparent deprioritization rationale.' },
      { dimension: 'Actionability', weight: '25%', description: 'Clear roadmap that engineering can reliably deliver.' },
    ],
  },
  {
    id: 'case-5',
    title: 'Launch an AI Feature: Enterprise AI Contract Review Assistant',
    category: 'Technical Thinking & AI Product Management',
    scenario:
      'Introduce an LLM-powered contract review assistant for enterprise legal and procurement teams to flag risk clauses in vendor agreements.',
    contextPoints: [
      'Customer contracts contain highly confidential pricing and intellectual property clauses.',
      'Hallucinations could lead to severe legal and financial liabilities for clients.',
      'Legal teams are risk-averse and skeptical of unverified AI outputs.',
    ],
    tasks: [
      '1. User Trust & UX: How do you design the interface to indicate confidence levels and human-in-the-loop review?',
      '2. Security & Compliance: What data retention and zero-day training guarantees must you demand from LLM providers?',
      '3. Evaluation & Benchmarks: How do you measure accuracy, hallucination rates, and recall before general availability?',
      '4. Pricing & Packaging: Should this be an add-on seat fee or consumption-based token pricing?',
    ],
    rubric: [
      { dimension: 'AI Product UX', weight: '25%', description: 'Human-in-the-loop design and error state transparency.' },
      { dimension: 'Security & Privacy', weight: '25%', description: 'Enterprise data sovereignty and zero-retention compliance.' },
      { dimension: 'Model Evaluation', weight: '25%', description: 'Objective golden test sets and precision/recall evaluation.' },
      { dimension: 'Commercialization', weight: '25%', description: 'Value-aligned pricing model.' },
    ],
  },
];
