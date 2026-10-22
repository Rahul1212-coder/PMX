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
    title: 'Beginner — Applied Product Fundamentals',
    subtitle: 'Scenario-driven evaluation of core product discovery, metrics, and trade-offs',
    difficulty: 'Easy',
    questionCount: 15,
    durationMinutes: 20,
    passingScorePercent: 70,
    formatDescription: '12 scenario-driven MCQs and 3 analytical calculations',
    focusDescription:
      'Applied product fundamentals, multi-step funnel analysis, true outcome metrics, RICE calculation, stated vs revealed preferences, and prioritization under sprint constraints.',
    topics: [
      'Multi-Step Funnel Bottleneck Diagnostics',
      'Stated Intent vs Revealed Economic Willingness to Pay',
      'True Outcome Metrics vs Superficial Engagement (DAU/MAU vs Watch Time)',
      'RICE Heuristic Calculation & Capacity Trade-offs',
      'Graceful Degradation vs Binary Ship/Cancel Releases',
      'Freemium Gating Risks vs Blended CAC Inflation',
    ],
    competencyWeights: {
      'Product Sense & User Empathy': 0.25,
      'Data & Analytical Thinking': 0.15,
      'Prioritization & Execution': 0.25,
      'Strategy & Business Thinking': 0.15,
      'Communication & Decision-Making': 0.2,
    },
  },
  intermediate: {
    id: 'intermediate',
    title: 'Intermediate — Applied Product Judgment',
    subtitle: 'Complex multi-constraint trade-offs, cohort retention, and analytical modeling',
    difficulty: 'Medium',
    questionCount: 15,
    durationMinutes: 30,
    passingScorePercent: 70,
    formatDescription: '8 complex MCQs, 4 multi-constraint scenarios, and 3 analytical calculations',
    focusDescription:
      'Applied product judgment, cohort retention decay, price elasticity vs ARPU, misleading surface-level metrics, B2B whale vs platform roadmap conflict, and technical debt risk balancing.',
    topics: [
      'Cohort Retention Decay vs Upfront Annual Cash Flow',
      'Marketplace Supply Moral Hazard & Incentive Subsidies',
      'Premature Database Refactoring vs Enterprise Churn Blockers',
      'Local Optimization vs End-to-End Workflow Value',
      'Price Elasticity Optimization & Contribution Margins',
      'Urgency Dark Patterns vs Downstream Brand Trust (NPS)',
      'Single-Tenant VPC Isolation vs On-Premise Forks',
    ],
    competencyWeights: {
      'Product Sense & User Empathy': 0.2,
      'Data & Analytical Thinking': 0.2,
      'Prioritization & Execution': 0.25,
      'Strategy & Business Thinking': 0.15,
      'Communication & Decision-Making': 0.2,
    },
    prerequisiteLevelId: 'beginner',
  },
  advanced: {
    id: 'advanced',
    title: 'Advanced — Strategic & Executive-Level Judgment',
    subtitle: 'Multi-objective optimization, platform economics, and written strategic cases',
    difficulty: 'Hard',
    questionCount: 10,
    durationMinutes: 40,
    passingScorePercent: 70,
    formatDescription: '3 complex MCQs, 3 strategic scenarios, and 4 written case-based responses',
    focusDescription:
      'Executive-level judgment, multi-variable payment orchestration, A/B early-stopping hazards, multi-segment portfolio allocation, AI confidence routing, and written strategic turnaround cases.',
    topics: [
      'Payment Orchestration Multi-Variable Routing Optimization',
      'A/B Test Peeking Hazards & Delayed Refund Guardrails',
      'SME vs Mid-Market vs Enterprise Portfolio Capital Allocation',
      'AI Confidence Gating & Human-in-the-Loop Risk Escalation',
      'Geographic TAM vs Adjacent Multi-Product Expansion Sequencing',
      'Four Written Cases: Growth Strategy, Product Experiment, Platform Economics, AI Product Risk',
    ],
    competencyWeights: {
      'Product Sense & User Empathy': 0.2,
      'Data & Analytical Thinking': 0.2,
      'Prioritization & Execution': 0.15,
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
    title: 'Evaluating Conflicting Engagement Signals',
    scenario:
      'You lead a B2B collaboration tool. User session length on the desktop app jumped 40% following a major navigation overhaul, but weekly active user (WAU) retention at week 4 fell from 62% to 54%, and user support tickets regarding "finding files" increased 3x. Your VP of Design claims the 40% session duration increase proves user engagement is thriving.',
    questionText: 'What is the best next action given these conflicting signals?',
    difficulty: 'medium',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Roll back the navigation overhaul immediately to protect week-4 retention and alleviate support ticket volume.' },
      { key: 'B', text: 'Launch an in-app tooltip tutorial highlighting file search to educate users on the new navigation hierarchy.' },
      { key: 'C', text: 'Segment session duration by task completion rate to determine whether increased time reflects deeper engagement or navigation friction.' },
      { key: 'D', text: 'Accept the temporary retention dip as standard learning curve friction and monitor retention for another 60 days before intervening.' },
    ],
    correctOption: 'C',
    explanation:
      'Session duration is ambiguous. An increase in session duration paired with a retention drop and a 3x surge in support tickets suggests users are spending more time because they are lost and struggling to find files. Segmenting by task completion isolates whether longer sessions correlate with productive workflow execution or friction.',
    optionExplanations: {
      A: 'Rolling back immediately is premature before diagnosing whether the problem is localized to specific user cohorts or workflows that can be quickly patched.',
      B: 'Tooltips are an operational bandage that assumes the user simply needs training, rather than diagnosing whether the underlying information architecture is flawed.',
      C: 'Correct. Correlating session duration with task completion rate definitively proves whether longer sessions reflect genuine value creation or frustrating navigation confusion.',
      D: 'Waiting 60 days while week-4 retention continues to hemorrhage burns customer trust and leads to permanent user churn.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['metrics', 'session-duration', 'root-cause'],
  },
  {
    id: 'beg-2',
    levelId: 'beginner',
    orderIndex: 2,
    title: 'Funnel Optimization Trade-off Calculation',
    scenario:
      'An onboarding funnel for a mobile productivity app tracks 50,000 monthly installs across four sequential steps:\n' +
      '• Step 1 (App Install → Account Created): 40,000 users (80% conversion)\n' +
      '• Step 2 (Account Created → Workspace Setup): 24,000 users (60% conversion)\n' +
      '• Step 3 (Workspace Setup → First Document Created): 18,000 users (75% conversion)\n' +
      '• Step 4 (First Document Created → Shared with Colleague): 9,000 users (50% conversion)\n' +
      'Engineering estimates that improving Step 2 from 60% to 75% requires 2 sprints. Alternatively, improving Step 4 from 50% to 70% requires 2 sprints. Assume other stage conversion rates remain unchanged.',
    questionText:
      'Which optimization yields the higher absolute number of users completing Step 4, and by how many additional users?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Improving Step 4 yields more completed users, delivering 3,600 additional users vs 2,250 for Step 2.' },
      { key: 'B', text: 'Improving Step 2 yields more completed users, delivering 4,500 additional users vs 3,600 for Step 4.' },
      { key: 'C', text: 'Both optimizations produce an identical gain of 3,000 additional completed users.' },
      { key: 'D', text: 'Improving Step 2 yields more completed users because top-of-funnel compounding always generates greater terminal volume.' },
    ],
    correctOption: 'A',
    explanation:
      'Mathematical breakdown:\n' +
      '• Baseline: 50,000 installs → 40,000 (Step 1) → 24,000 (Step 2) → 18,000 (Step 3) → 9,000 (Step 4).\n' +
      '• Option 1 (Step 2: 60% → 75%): Step 2 users = 40,000 × 75% = 30,000 (+6,000). Step 3 = 30,000 × 75% = 22,500. Step 4 = 22,500 × 50% = 11,250. Gain = 11,250 - 9,000 = +2,250 users.\n' +
      '• Option 2 (Step 4: 50% → 70%): Step 3 users remain 18,000. Step 4 = 18,000 × 70% = 12,600. Gain = 12,600 - 9,000 = +3,600 users.\n' +
      'Step 4 yields 3,600 additional users vs 2,250 for Step 2, a 1,350 user advantage.',
    optionExplanations: {
      A: 'Correct. Because Step 4 operates on 18,000 users with a 20 percentage-point gain (18,000 × 0.20 = 3,600), it outperforms the diluted compounding of Step 2 (40,000 × 0.15 × 0.75 × 0.50 = 2,250).',
      B: 'Incorrect math. Step 2 creates 6,000 more setup users, but downstream drop-offs at Step 3 (25%) and Step 4 (50%) dilute the terminal gain to 2,250.',
      C: 'Incorrect calculation based on ignoring downstream stage conversion attrition.',
      D: 'A common PM fallacy. Top-of-funnel compounding only wins if downstream retention/conversion is sufficiently high to preserve the volume.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['funnel-analysis', 'calculation', 'conversion'],
  },
  {
    id: 'beg-3',
    levelId: 'beginner',
    orderIndex: 3,
    title: 'Balancing Defect Severity Against Stakeholder Demands',
    scenario:
      'Your engineering squad has 40 story points of capacity in the upcoming sprint. Two high-priority initiatives are competing for capacity:\n' +
      '• Initiative X: Resolves an intermittent database timeout affecting 4% of active users during peak hours, causing failed checkout transactions. Estimated effort: 25 points.\n' +
      '• Initiative Y: A partner integration requested by a key retail customer (representing 6% of quarterly revenue) that the Sales team verbally promised would ship by end-of-month. Estimated effort: 25 points.\n' +
      'The team cannot deliver both in the sprint.',
    questionText: 'How should the Product Manager resolve this resource conflict?',
    difficulty: 'medium',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Commit both initiatives into the sprint and ask engineering to work overtime, since both directly impact revenue.' },
      { key: 'B', text: 'Deliver Initiative Y to protect sales commitment and avoid contract termination, scheduling Initiative X for the subsequent sprint.' },
      { key: 'C', text: 'Defer both initiatives and allocate the sprint to low-effort backlog quick-wins while leadership reviews customer churn risk.' },
      { key: 'D', text: 'Prioritize Initiative X to eliminate checkout transaction failures, and negotiate a staged delivery timeline with Sales and the retail customer.' },
    ],
    correctOption: 'D',
    explanation:
      'Checkout failures represent an active operational defect directly eroding trust and revenue for all affected customers. Prioritizing Initiative X defends transactional integrity. Meanwhile, the PM should partner with Sales to decompose Initiative Y into an MVP milestone or negotiate a realistic release schedule rather than letting an uncontracted verbal promise compromise platform stability.',
    optionExplanations: {
      A: 'Overcommitting beyond capacity burns out engineering, increases defects, and typically results in both initiatives being delivered late and broken.',
      B: 'Prioritizing a single customer\'s uncontracted promise over core checkout failures for 4% of the entire user base sets a dangerous precedent of sacrificing platform reliability for sales appeasement.',
      C: 'Deferring both critical initiatives abdicates leadership responsibility and ignores an active production revenue leak.',
      D: 'Correct. Securing core transaction reliability protects systemic revenue, while proactive stakeholder communication manages partner expectations without emergency overtime.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['prioritization', 'trade-offs', 'stakeholder-management'],
  },
  {
    id: 'beg-4',
    levelId: 'beginner',
    orderIndex: 4,
    title: 'Interpreting Stated Intent vs Revealed Demand',
    scenario:
      'You are testing an MVP for an on-demand grocery delivery service targeting busy parents. In qualitative interviews, 85% of surveyed parents stated they would pay ₹199/month for 15-minute guaranteed delivery. You build a landing page offering subscriptions for ₹199/month with a "Pre-pay & Join First Wave" button. Out of 4,000 targeted ad clicks, 1,200 users entered their email on a waitlist, but only 18 users completed the ₹199 pre-payment.',
    questionText: 'What is the primary conclusion the PM should draw from this discovery data?',
    difficulty: 'medium',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'The landing page design was ineffective; you should run an A/B test on copy and imagery before drawing conclusions on demand.' },
      { key: 'B', text: 'Stated intent in interviews does not equal revealed willingness to pay; actual economic commitment is weak at this price point.' },
      { key: 'C', text: 'Demand is validated because 1,200 users joined the waitlist, representing an attractive 30% lead conversion rate.' },
      { key: 'D', text: 'The 15-minute delivery value proposition is flawed; parents prefer scheduled 2-hour delivery windows instead.' },
    ],
    correctOption: 'B',
    explanation:
      'A core principle of customer discovery is distinguishing between stated intent ("I would pay") and revealed preference (swiping a card). An 85% interview enthusiasm paired with a 0.45% paid conversion (18 / 4,000) proves high desirability in theory, but negligible willingness to pay in practice.',
    optionExplanations: {
      A: 'Attributing an 18-out-of-4,000 conversion failure strictly to UI copy avoids the obvious commercial takeaway that customers are unwilling to pay ₹199 upfront.',
      B: 'Correct. Customers readily say "yes" in hypothetical interviews because talking is free. When forced to pay actual money, real demand evaporates.',
      C: 'Waitlists collect low-friction email addresses, which are vanity leads compared to actual financial transactions.',
      D: 'Assuming parents prefer 2-hour scheduled delivery is an unvalidated speculative leap unsupported by the experiment data.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['discovery', 'willingness-to-pay', 'mvp'],
  },
  {
    id: 'beg-5',
    levelId: 'beginner',
    orderIndex: 5,
    title: 'Dissecting Conflicting Engagement & Health Metrics',
    scenario:
      'An educational video platform reports that Daily Active Users (DAU) increased by 22% over the last quarter, reaching 200,000. However, Monthly Active Users (MAU) remained flat at 500,000, and total video watch hours across the platform declined by 8%. The marketing team celebrates the DAU surge as proof of organic product-market fit.',
    questionText:
      'What does the increase in DAU/MAU ratio alongside declining total watch hours most likely indicate?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'User engagement is deepening because users are visiting the platform more frequently each month.' },
      { key: 'B', text: 'The platform has achieved breakout viral product-market fit across new student demographics.' },
      { key: 'C', text: 'Users are opening the app more frequently (e.g., triggered by notifications), but spending less meaningful time consuming content per session.' },
      { key: 'D', text: 'The analytics tracking pipeline has a data logging error, because DAU cannot rise while total watch hours decline.' },
    ],
    correctOption: 'C',
    explanation:
      'DAU/MAU rose from 32.8% to 40%, indicating users open the app more days per month. However, total watch hours declining by 8% reveals that sessions have become shallow and ephemeral. This frequently occurs when aggressive push notifications or streak mechanics trigger app opens without delivering educational value.',
    optionExplanations: {
      A: 'While visitation frequency increased, viewing time dropped 8%, meaning users are deriving less actual value from the core product.',
      B: 'Flat MAU proves there is no breakout user acquisition or expansion, only repeated visits by existing users.',
      C: 'Correct. The divergence between frequency (DAU/MAU) and depth (watch hours) highlights superficial engagement driven by external prompts rather than organic consumption.',
      D: 'DAU and watch hours measure completely different dimensions (unique user visits vs aggregate duration); there is no technical contradiction.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['metrics', 'dau-mau', 'engagement-depth'],
  },
  {
    id: 'beg-6',
    levelId: 'beginner',
    orderIndex: 6,
    title: 'RICE Scoring Calculation Under Constraints',
    scenario:
      'A PM is evaluating four feature proposals using RICE scoring (Reach × Impact × Confidence / Effort):\n' +
      '• Feature 1: Reach = 10,000 users/mo, Impact = 2 (High), Confidence = 80%, Effort = 4 person-weeks.\n' +
      '• Feature 2: Reach = 25,000 users/mo, Impact = 1 (Medium), Confidence = 50%, Effort = 2 person-weeks.\n' +
      '• Feature 3: Reach = 5,000 users/mo, Impact = 3 (Massive), Confidence = 100%, Effort = 5 person-weeks.\n' +
      '• Feature 4: Reach = 40,000 users/mo, Impact = 0.5 (Low), Confidence = 80%, Effort = 4 person-weeks.',
    questionText: 'Which feature yields the highest RICE score, and what is its calculated score?',
    difficulty: 'medium',
    competency: 'Prioritization & Execution',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Feature 2, with a RICE score of 6,250.' },
      { key: 'B', text: 'Feature 1, with a RICE score of 4,000.' },
      { key: 'C', text: 'Feature 4, with a RICE score of 5,000.' },
      { key: 'D', text: 'Feature 3, with a RICE score of 3,000.' },
    ],
    correctOption: 'A',
    explanation:
      'RICE calculations:\n' +
      '• F1: (10,000 × 2 × 0.80) / 4 = 16,000 / 4 = 4,000\n' +
      '• F2: (25,000 × 1 × 0.50) / 2 = 12,500 / 2 = 6,250\n' +
      '• F3: (5,000 × 3 × 1.00) / 5 = 15,000 / 5 = 3,000\n' +
      '• F4: (40,000 × 0.5 × 0.80) / 4 = 16,000 / 4 = 4,000\n' +
      'Feature 2 achieves the highest score at 6,250.',
    optionExplanations: {
      A: 'Correct. Despite lower confidence (50%), Feature 2’s large reach (25k) and low effort (2 weeks) deliver the highest expected return per unit of engineering capacity.',
      B: 'Feature 1 scores 4,000, which is lower than Feature 2.',
      C: 'Feature 4 scores 4,000 (not 5,000).',
      D: 'Feature 3 has perfect confidence and massive impact, but small reach (5k) and high effort (5 weeks) pull its score down to 3,000.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['rice-scoring', 'calculation', 'prioritization'],
  },
  {
    id: 'beg-7',
    levelId: 'beginner',
    orderIndex: 7,
    title: 'Evaluating Freemium Monetization Gating',
    scenario:
      'You manage a personal finance SaaS with a freemium model. Free users get expense tracking; paid subscribers (₹499/year) get automated tax categorization. Currently, 3% of free users convert to paid. Marketing suggests removing free expense tracking and requiring a 14-day free trial with credit card upfront to "filter for serious buyers."',
    questionText: 'What is the primary business risk of adopting this strategy?',
    difficulty: 'medium',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Customer support costs will double because trial users submit more bug reports.' },
      { key: 'B', text: 'Top-of-funnel user acquisition will sharply collapse, destroying the organic word-of-mouth referral engine and increasing blended CAC.' },
      { key: 'C', text: 'Paying customers will demand refunds because 14 days is insufficient to evaluate annual tax features.' },
      { key: 'D', text: 'The company will violate payment gateway terms of service by requiring cards for free trials.' },
    ],
    correctOption: 'B',
    explanation:
      'Gating product utility behind an upfront credit card requirement typically causes an 80–90% drop in signup volume. While conversion from trial to paid may increase on paper, the severe collapse in top-of-funnel users kills viral word-of-mouth and forces the company to rely on expensive paid ad acquisition, driving up blended CAC.',
    optionExplanations: {
      A: 'Support volume typically decreases with fewer users, not increases.',
      B: 'Correct. For consumer and prosumer tools, self-serve freemium is an acquisition engine. Killing it strangles organic reach and balloons customer acquisition costs.',
      C: 'While 14 days may be short, it does not explain the broader systemic business model failure.',
      D: 'Credit card upfront trials are standard industry practice and fully permitted by payment gateways.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['freemium', 'monetization', 'business-models'],
  },
  {
    id: 'beg-8',
    levelId: 'beginner',
    orderIndex: 8,
    title: 'Graceful Degradation Under Pre-Launch Defects',
    scenario:
      'A week before a scheduled launch, QA discovers a defect: on older Android OS versions (representing 5% of your active user base), the checkout screen crashes when applying promotional promo codes. Fixing the bug will delay the launch by 10 days, missing a high-profile marketing co-campaign with a payment partner.',
    questionText: 'What is the most appropriate decision and mitigation strategy?',
    difficulty: 'medium',
    competency: 'Communication & Decision-Making',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Cancel the marketing co-campaign completely and delay the release until zero defects remain across all supported OS versions.' },
      { key: 'B', text: 'Launch as scheduled without mentioning the issue; address affected users individually if they submit complaints.' },
      { key: 'C', text: 'Disable promo code functionality entirely for all users so that the checkout flow remains unified across devices.' },
      { key: 'D', text: 'Ship the release on schedule with promo code input gracefully hidden/disabled specifically on older Android OS, and patch the fix in a fast-follow update.' },
    ],
    correctOption: 'D',
    explanation:
      'This illustrates graceful degradation and feature flagging. Rather than canceling a high-value partnership for 95% of users, or letting 5% experience fatal app crashes, the PM scopes a targeted fallback: disable the broken promo code input on legacy Android versions to prevent crashes, while delivering the core launch on schedule.',
    optionExplanations: {
      A: 'Canceling the entire partnership for a minor edge case destroys business value and damages partner relationships.',
      B: 'Allowing the app to actively crash in production destroys user trust and ratings on the Play Store.',
      C: 'Disabling promo codes for everyone destroys the marketing co-campaign for 100% of users.',
      D: 'Correct. Feature-flagging the problematic input on the 5% legacy devices prevents crashes while allowing 95% of users to participate in the launch.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['release-management', 'feature-flags', 'graceful-degradation'],
  },
  {
    id: 'beg-9',
    levelId: 'beginner',
    orderIndex: 9,
    title: 'Resolving Marketplace Information Asymmetry',
    scenario:
      'A ride-hailing app notices that riders in Tier-2 cities cancel rides 28% more frequently than riders in metropolitan areas within the first 3 minutes of booking. Qualitative interviews reveal drivers in Tier-2 cities frequently call riders immediately after booking to ask "Where are you going and will you pay cash?", resulting in mutual cancellations if drivers decline the destination.',
    questionText: 'What is the best product intervention to address the root problem?',
    difficulty: 'medium',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Increase cancellation penalty fees for riders in Tier-2 cities to deter cancellation behavior.' },
      { key: 'B', text: 'Restrict drivers from viewing the rider\'s phone number to eliminate pre-trip phone conversations.' },
      { key: 'C', text: 'Surface drop-off destination and payment mode to drivers before acceptance, paired with incentives for high completion rates.' },
      { key: 'D', text: 'Send an automated SMS to riders advising them not to answer calls from drivers.' },
    ],
    correctOption: 'C',
    explanation:
      'The cancellations stem from information asymmetry. Drivers have preferences regarding fuel economics and cash liquidity in Tier-2 regions. Suppressing phone numbers (B) or penalizing riders (A) treats symptoms while driving cancellations to occur in person. Surfacing destination and payment terms upfront removes the need for off-app negotiation.',
    optionExplanations: {
      A: 'Penalizing riders when drivers refuse destinations alienates customers who are victims of driver unreliability.',
      B: 'Masking numbers simply forces drivers to wait until arrival to ask the destination, worsening wait-time waste.',
      C: 'Correct. Aligning supply-side incentives and removing information asymmetry eliminates friction at the source.',
      D: 'Advising riders to ignore driver calls frustrates drivers and guarantees unfulfilled rides.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['marketplace', 'incentive-design', 'user-empathy'],
  },
  {
    id: 'beg-10',
    levelId: 'beginner',
    orderIndex: 10,
    title: 'Price Elasticity & Churn Modeling Calculation',
    scenario:
      'A consumer subscription app has 100,000 active subscribers paying ₹200/month. The product team tests a price increase to ₹250/month on a 50% randomized user cohort (Cohort B), while keeping Cohort A at ₹200/month. After 1 month:\n' +
      '• Cohort A (50,000 users at ₹200): Monthly churn is 4%.\n' +
      '• Cohort B (50,000 users at ₹250): Monthly churn is 7%.',
    questionText:
      'Which cohort generates higher net monthly revenue at the end of Month 1, and what is the exact revenue difference?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Cohort B generates ₹20,25,000 more revenue than Cohort A in Month 1.' },
      { key: 'B', text: 'Cohort A generates ₹3,50,000 more revenue than Cohort B in Month 1.' },
      { key: 'C', text: 'Cohort B generates ₹5,00,000 more revenue than Cohort A in Month 1.' },
      { key: 'D', text: 'Both cohorts generate identical monthly revenue due to exact price-elasticity offset.' },
    ],
    correctOption: 'A',
    explanation:
      'Calculation:\n' +
      '• Cohort A: 50,000 × (1 - 0.04) = 48,000 retained users. Monthly revenue = 48,000 × ₹200 = ₹96,00,000.\n' +
      '• Cohort B: 50,000 × (1 - 0.07) = 46,500 retained users. Monthly revenue = 46,500 × ₹250 = ₹1,16,25,000.\n' +
      '• Difference = ₹1,16,25,000 - ₹96,00,000 = ₹20,25,000 higher revenue for Cohort B.',
    optionExplanations: {
      A: 'Correct. The 25% price increase significantly outweighs the 3 percentage-point increase in churn in Month 1, generating an extra ₹20.25 Lakh.',
      B: 'Incorrect math. Assumes churn eroded all gains.',
      C: 'Incorrect calculation ignoring actual subscriber count attrition.',
      D: 'Incorrect assumption of unity elasticity.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['pricing', 'churn', 'calculation'],
  },
  {
    id: 'beg-11',
    levelId: 'beginner',
    orderIndex: 11,
    title: 'Managing Legacy Architectural Dependencies',
    scenario:
      'Your roadmap has a committed deliverable to refactor a legacy payment gateway integration to support recurring UPI mandates. Two weeks before code freeze, your lead architect warns that the legacy architecture has undocumented dependencies; completing the refactor will take 4 extra weeks, jeopardizing the subsequent quarter\'s flagship feature launch.',
    questionText: 'What is the best next action for the PM?',
    difficulty: 'medium',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Instruct engineering to ship the refactor as a quick patch without addressing legacy dependencies, fixing bugs in production.' },
      { key: 'B', text: 'De-scope the refactor to support UPI mandates only for new subscribers while leaving existing recurring billing on the legacy service.' },
      { key: 'C', text: 'Cancel the UPI project completely and refocus all engineering capacity on the flagship feature launch.' },
      { key: 'D', text: 'Delay the flagship feature by 4 weeks immediately without consulting commercial stakeholders or investigating scope boundaries.' },
    ],
    correctOption: 'B',
    explanation:
      'Applying the strangler-fig pattern: de-scoping migration of existing billing records avoids touching fragile legacy dependencies while unlocking 80% of business value (allowing new users to sign up via UPI). This delivers customer value on time without compromising platform stability.',
    optionExplanations: {
      A: 'Shipping a rushed patch against unmapped legacy payment logic guarantees critical billing errors and chargeback liabilities.',
      B: 'Correct. Phased scoping decouples new checkout flows from historical migration debt, protecting release dates and system stability.',
      C: 'Canceling forfeits a critical growth channel (UPI) in a high-demand market.',
      D: 'Unilaterally pushing back the entire annual roadmap without exploring phased scoping breaches executive trust.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['architecture', 'phased-rollout', 'scoping'],
  },
  {
    id: 'beg-12',
    levelId: 'beginner',
    orderIndex: 12,
    title: 'Segment-Driven Roadmap Allocation',
    scenario:
      'An enterprise B2B product has two core customer tiers: 50 Enterprise accounts (paying ₹10,00,000/year each) and 1,000 Mid-Market accounts (paying ₹1,00,000/year each). Total ARR is ₹15 Crore. Analysis reveals that Enterprise accounts submit an average of 42 feature requests/year with a 98% renewal rate, while Mid-Market accounts submit 4 requests/year with an 82% renewal rate. Mid-market churn is primarily driven by missing self-service reporting.',
    questionText:
      'If engineering capacity is capped at 3 major initiatives this year, where should product focus be directed?',
    difficulty: 'medium',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Allocate 100% of capacity to bespoke Enterprise feature requests because Enterprise accounts contribute the majority of revenue.' },
      { key: 'B', text: 'Build customized workflows for the top 5 largest Enterprise accounts to eliminate any risk of losing ₹5 Crore in ARR.' },
      { key: 'C', text: 'Halt all new feature development and allocate all sprints to rewriting core platform infrastructure.' },
      { key: 'D', text: 'Allocate 2 initiatives to self-service reporting and onboarding to stem Mid-market churn, and 1 initiative to high-leverage enterprise platform requirements.' },
    ],
    correctOption: 'D',
    explanation:
      'Enterprise accounts already have near-perfect retention (98%), meaning bespoke development yields low marginal retention return. Mid-market is hemorrhaging 18% churn (losing ₹1.8 Crore ARR annually) due to a clear, fixable self-service gap. Allocating 2 initiatives to Mid-market self-service solves the bleeding while 1 initiative supports scalable enterprise capabilities.',
    optionExplanations: {
      A: 'Over-allocating to enterprise when their renewal is already 98% ignores the massive ₹1.8 Crore ARR leak in mid-market.',
      B: 'Bespoke development for 5 accounts turns a scalable software platform into an unmaintainable custom IT services shop.',
      C: 'Halting all roadmap items ignores proven customer pain points and business churn drivers.',
      D: 'Correct. Directing capacity to where retention ROI is highest (plugging Mid-market self-serve churn) while maintaining enterprise platform health.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['segment-strategy', 'arr-retention', 'portfolio-allocation'],
  },
  {
    id: 'beg-13',
    levelId: 'beginner',
    orderIndex: 13,
    title: 'Handling Negative Operational Externalities in A/B Tests',
    scenario:
      'Your team’s A/B test on a simplified checkout flow demonstrates a 3.2% increase in checkout completions with a p-value of 0.04 (statistically significant at α = 0.05). However, Customer Operations alerts you that duplicate billing complaints increased by 15% due to double-clicking on the un-throttled "Place Order" button in the variant.',
    questionText: 'How should the PM communicate and act upon this result?',
    difficulty: 'medium',
    competency: 'Communication & Decision-Making',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Add button debouncing/idempotency protection to the variant and re-verify transaction integrity before broad rollout.' },
      { key: 'B', text: 'Declare the experiment an unconditional success and roll out immediately because the p-value is below 0.05.' },
      { key: 'C', text: 'Discard the variant entirely and conclude that simplified checkout inherently causes operational defects.' },
      { key: 'D', text: 'Hide the customer support complaints from executive stakeholders since conversion lift is the primary goal.' },
    ],
    correctOption: 'A',
    explanation:
      'A statistically significant lift with an operational defect should neither be blind-shipped nor discarded. The 15% surge in duplicate billings is an easily remediable technical defect (missing button debounce / API idempotency key). Adding idempotency fixes the flaw while preserving the 3.2% conversion gain.',
    optionExplanations: {
      A: 'Correct. Fixes the operational flaw (idempotency) and validates billing integrity before exposing all users to duplicate charges.',
      B: 'Blindly shipping a flow that doubles charges creates chargeback fines, refund overhead, and customer outrage.',
      C: 'Throwing away a validated conversion lift due to a simple button throttling bug is a severe overreaction.',
      D: 'Hiding operational failures breaches ethics and invites catastrophic customer backlash.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['experimentation', 'operational-guardrails', 'idempotency'],
  },
  {
    id: 'beg-14',
    levelId: 'beginner',
    orderIndex: 14,
    title: 'Balancing Power User Utility with Recipient Experience',
    scenario:
      'You manage a workplace messaging application. You launch a feature allowing users to schedule messages to be sent at a future time. After 30 days, usage telemetry shows that while 60% of managers schedule messages weekly, 78% of scheduled messages are set for 8:00 AM on Monday morning. Recipient surveys reveal that employees feel overwhelmed by a barrage of simultaneous task assignments when opening the app on Monday.',
    questionText:
      'What is the best product adjustment to improve employee well-being while preserving the scheduling utility?',
    difficulty: 'medium',
    competency: 'Product Sense & User Empathy',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Restrict managers from scheduling messages for delivery before 10:00 AM.' },
      { key: 'B', text: 'Remove the scheduled message feature entirely to eliminate Monday morning inbox fatigue.' },
      { key: 'C', text: 'Introduce smart batching or a unified digest that summarizes incoming scheduled tasks without triggering individual push alarms.' },
      { key: 'D', text: 'Charge a premium fee for scheduling messages to disincentivize excessive manager use.' },
    ],
    correctOption: 'C',
    explanation:
      'Heavy-handed bans (A) or feature deletions (B) break a validated utility that 60% of managers rely on. The core issue is notification volume and alarm fatigue on recipients. Providing intelligent task digest bundling solves the recipient’s emotional friction without degrading sender workflow utility.',
    optionExplanations: {
      A: 'Arbitrary time restrictions frustrate power users and push managers to send messages outside official tools.',
      B: 'Deleting a popular feature with 60% adoption penalizes the organization and invites competitive migration.',
      C: 'Correct. Respects sender utility while softening notification bombardment on recipients through smart batching.',
      D: 'Monetizing internal workplace productivity features damages company-wide adoption and employee sentiment.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['user-experience', 'notification-fatigue', 'systems-thinking'],
  },
  {
    id: 'beg-15',
    levelId: 'beginner',
    orderIndex: 15,
    title: 'Evaluating Pricing & Free Shipping Thresholds',
    scenario:
      'An e-commerce platform has 2,000,000 visitors per month with a baseline 2.0% purchase conversion rate and an Average Order Value (AOV) of ₹1,200. Product introduces a minimum order threshold for free shipping. In the test group:\n' +
      '• Conversion rate drops by 10% relatively (from 2.0% to 1.8%).\n' +
      '• AOV increases by 25% (from ₹1,200 to ₹1,500).',
    questionText: 'What is the net impact on total monthly gross merchandise value (GMV)?',
    difficulty: 'medium',
    competency: 'Data & Analytical Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Gross merchandise value decreases by ₹1.2 Crore due to the 10% conversion drop.' },
      { key: 'B', text: 'Gross merchandise value increases by ₹6 Crore (a 12.5% net increase in monthly revenue).' },
      { key: 'C', text: 'Gross merchandise value remains unchanged because the percentage movements offset each other.' },
      { key: 'D', text: 'Gross merchandise value increases by ₹10 Crore due to the dominant ₹300 bump in AOV.' },
    ],
    correctOption: 'B',
    explanation:
      'Mathematical breakdown:\n' +
      '• Baseline: 2,000,000 × 2% = 40,000 orders. GMV = 40,000 × ₹1,200 = ₹4,80,00,000 (₹48 Crore).\n' +
      '• Test: 2,000,000 × 1.8% = 36,000 orders (-4,000 orders). GMV = 36,000 × ₹1,500 = ₹5,40,00,000 (₹54 Crore).\n' +
      '• Net impact: ₹54 Crore - ₹48 Crore = +₹6 Crore (+12.5% increase in total revenue).',
    optionExplanations: {
      A: 'Incorrect. Looks only at the 4,000 lost orders while ignoring the 25% larger basket size across the remaining 36,000 orders.',
      B: 'Correct. The 25% AOV expansion easily overcomes the 10% volume decline: 0.90 × 1.25 = 1.125 (+12.5% GMV gain, or +₹6 Crore).',
      C: 'Incorrect. 25% and 10% are asymmetric multipliers (0.90 × 1.25 = 1.125, not 1.0).',
      D: 'Incorrect arithmetic calculation.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['calculation', 'aov', 'revenue-modeling'],
  },

  // =========================================================================
  // INTERMEDIATE LEVEL (15 QUESTIONS: 8 COMPLEX MCQs + 4 SCENARIOS + 3 ANALYTICAL)
  // Answer key distribution: A: 4, B: 4, C: 3, D: 4
  // =========================================================================
  {
    id: 'int-1',
    levelId: 'intermediate',
    orderIndex: 1,
    title: 'Upfront Cash Flow vs Lifetime Customer Value (LTV)',
    scenario:
      'In an A/B test for a media streaming subscription, Variant A introduces an annual pre-pay discount (₹1,999/yr vs ₹249/mo). Over 30 days:\n' +
      '• Control: 10,000 signups, 100% choose monthly. Month 1 revenue = ₹24,90,000.\n' +
      '• Variant A: 10,000 signups, 25% choose annual (₹1,999), 75% choose monthly (₹249). Month 1 revenue = ₹68,65,000 (+175% upfront cash).\n' +
      'However, historical monthly subscriber LTV is ₹3,200 over 18 months, whereas annual plan renewals historically hover at 52%.',
    questionText:
      'What is the most critical analytical risk of declaring Variant A the permanent winner based solely on Month 1 results?',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Server infrastructure costs will spike because annual subscribers stream significantly more hours.' },
      { key: 'B', text: 'Discounting may cannibalize higher long-term cumulative LTV from monthly subscribers who would have retained for 18+ months.' },
      { key: 'C', text: 'Payment gateways charge higher dispute fees for annual plans than for monthly recurring billing.' },
      { key: 'D', text: 'Month 1 conversion rate is statistically invalid because 30 days is too brief to achieve statistical sample power.' },
    ],
    correctOption: 'B',
    explanation:
      'Month 1 revenue shows a misleading cash-flow spike due to upfront lump sums. However, monthly subscribers have a proven LTV of ₹3,200. An annual plan at ₹1,999 with 52% renewal yields an expected 2-year LTV of only ~₹3,038. Trading recurring monthly compounding for discounted upfront cash can quietly cannibalize long-term enterprise value.',
    optionExplanations: {
      A: 'Streaming bandwidth cost variance is a minor operating cost compared to customer LTV cannibalization.',
      B: 'Correct. High upfront cash often blinds teams to the fact that high-retaining monthly cohorts generate superior lifetime value.',
      C: 'Dispute fees are an operational footnote compared to the fundamental unit economic shift in LTV.',
      D: '10,000 signups per branch provides ample sample power; the flaw is the time horizon of the metric, not the sample size.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['ltv', 'cash-flow', 'cohort-economics'],
  },
  {
    id: 'int-2',
    levelId: 'intermediate',
    orderIndex: 2,
    title: 'Preventing Marketplace Moral Hazard & Phantom Supply',
    scenario:
      'A marketplace connects home cleaners with homeowners. Demand is growing 40% MoM, but supply-side cleaner churn is 45% within 60 days. To boost supply, Operations recommends giving new cleaners a guaranteed minimum wage for their first 4 weeks regardless of bookings.',
    questionText: 'What is the most dangerous second-order effect of this policy if implemented without guardrails?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Homeowners will complain that cleaner hourly rates are too low to reflect premium service.' },
      { key: 'B', text: 'Competitor platforms will sue the startup for anti-competitive labor practices.' },
      { key: 'C', text: 'Existing tenured cleaners will immediately strike and demand identical wages.' },
      { key: 'D', text: 'Inactive or low-quality cleaners will stay logged on to collect subsidies without accepting jobs, inflating unit acquisition costs.' },
    ],
    correctOption: 'D',
    explanation:
      'Unconditional hourly guarantees decouple compensation from completed customer value, creating classic moral hazard. Cleaners stay logged in to harvest base wages while rejecting difficult jobs or cherry-picking routes. Subsidies must always be tied to acceptance rates, minimum ratings, and completed service milestones.',
    optionExplanations: {
      A: 'Homeowners pay platform rates; cleaner subsidies are internal company cost outlays.',
      B: 'Minimum wage guarantees are standard gig economy incentives and completely legal.',
      C: 'While tenured cleaners may feel dissatisfied, the immediate existential threat is capital burn from phantom supply.',
      D: 'Correct. Unconditioned subsidies attract low-intent supply that collects payouts without delivering customer rides/services.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['marketplace', 'second-order-effects', 'incentives'],
  },
  {
    id: 'int-3',
    levelId: 'intermediate',
    orderIndex: 3,
    title: 'Evaluating Premature Architectural Migrations',
    scenario:
      'You are PM of a SaaS developer tool. Your lead engineer wants to spend 3 sprints migrating from PostgreSQL to Cassandra because "we will hit database read bottlenecks when we reach 10x our current volume." Current user growth is 5% MoM, database CPU utilization peaks at 35%, and your top enterprise churn reason is "lack of SSO (Single Sign-On) and audit logs."',
    questionText: 'What is the strongest response to this architectural proposal?',
    difficulty: 'hard',
    competency: 'Prioritization & Execution',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Reject the migration now; current utilization (35%) and growth indicate capacity is safe for 18+ months, while missing enterprise SSO is causing real churn today.' },
      { key: 'B', text: 'Approve the migration immediately because refactoring is significantly more expensive when done under production outage emergencies.' },
      { key: 'C', text: 'Compromise by dedicating 50% of each upcoming sprint to the Cassandra migration and 50% to SSO.' },
      { key: 'D', text: 'Hire external contractors to build Cassandra while the internal team builds SSO.' },
    ],
    correctOption: 'A',
    explanation:
      'At 5% MoM growth and 35% peak CPU, reaching 10x volume will take years. Committing 3 sprints of engineering to an imaginary scale bottleneck while real customers are actively churning due to missing enterprise SSO and audit logs is a textbook failure of product prioritization.',
    optionExplanations: {
      A: 'Correct. A disciplined PM bases capacity on validated near-term risk vs present customer churn drivers rather than speculative 10x engineering fantasies.',
      B: 'Refactoring 2 years ahead of time wastes runway and locks in Cassandra data models before domain boundaries stabilize.',
      C: 'Splitting capacity dilutes focus, resulting in two half-baked deliverables shipped late.',
      D: 'Hiring contractors to introduce an unfamiliar database architecture adds massive maintenance debt and code complexity.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['tech-debt', 'premature-optimization', 'opportunity-cost'],
  },
  {
    id: 'int-4',
    levelId: 'intermediate',
    orderIndex: 4,
    title: 'Diagnosing Local vs Systemic AI Workflow Value',
    scenario:
      'An enterprise HR software team launches an AI resume screener. In pilot testing with 5 enterprise recruiters, recruiters initially rated the feature 9/10 for speed. However, after 6 weeks, recruiter usage dropped by 70%. When interviewed, recruiters admitted they manually re-reviewed all candidate profiles anyway because hiring managers rejected candidates shortlisted by the AI for lacking specific domain keywords.',
    questionText: 'What is the core product failure in this scenario?',
    difficulty: 'hard',
    competency: 'Product Sense & User Empathy',
    format: 'mcq',
    options: [
      { key: 'A', text: 'The AI model was trained on insufficient candidate volume and should be upgraded with a larger LLM.' },
      { key: 'B', text: 'The UI was overly complex and failed to provide keyboard navigation shortcuts for rapid profile skimming.' },
      { key: 'C', text: 'The feature optimized for recruiter speed without solving the ultimate user goal: hiring manager trust and alignment on qualification criteria.' },
      { key: 'D', text: 'Recruiters are inherently resistant to technology adoption and should be mandated by company leadership to use the AI tool.' },
    ],
    correctOption: 'C',
    explanation:
      'The PM fell into the local optimization trap: making resume screening faster for recruiters did not matter because the end-to-end outcome (hiring manager acceptance) failed. If the downstream stakeholder does not trust the output, recruiters are forced to duplicate the work manually, rendering the feature useless.',
    optionExplanations: {
      A: 'Upgrading the model does not fix the fundamental disconnect in qualification criteria between recruiters and hiring managers.',
      B: 'Keyboard shortcuts treat superficial interaction speed while ignoring total workflow failure.',
      C: 'Correct. Software must deliver end-to-end workflow resolution; optimizing an intermediate step while breaking the downstream handover creates zero value.',
      D: 'Mandating usage forces employees to use an ineffective tool that actively damages hiring velocity.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['product-sense', 'workflow-optimization', 'ai-product'],
  },
  {
    id: 'int-5',
    levelId: 'intermediate',
    orderIndex: 5,
    title: 'Cohort Payback vs Compounding LTV Calculation',
    scenario:
      'A SaaS product evaluates cohort retention across two marketing acquisition channels:\n' +
      '• Channel A (Organic SEO): Acquired 1,000 customers. CAC = ₹3,000. Month 1 retention = 80%, Month 6 = 60%, Month 12 = 50%.\n' +
      '• Channel B (Paid Social Ads): Acquired 4,000 customers. CAC = ₹1,500. Month 1 retention = 50%, Month 6 = 25%, Month 12 = 10%.\n' +
      'Monthly subscription fee is ₹500/month with an 80% gross margin (₹400 net contribution margin per user/month).',
    questionText:
      'Which channel achieves faster CAC payback, and which channel generates higher cumulative 12-month net profit per acquired customer?',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Channel B has a faster payback and generates higher 12-month cumulative net profit per customer.' },
      { key: 'B', text: 'Channel B pays back faster (Month 4 vs Month 8), but Channel A generates significantly higher 12-month cumulative profit per customer (₹2,880 vs ₹840 net).' },
      { key: 'C', text: 'Channel A pays back faster and produces higher profit across both dimensions.' },
      { key: 'D', text: 'Both channels generate identical lifetime value because Channel B acquired 4x more total volume.' },
    ],
    correctOption: 'B',
    explanation:
      'Analytical calculation:\n' +
      '• Channel B CAC = ₹1,500. With ₹400/mo margin, payback requires ~4.5 user-months of retention, achieved around Month 4. Total cumulative active user-months over 12 months = ~5.85 months. Cumulative gross margin = 5.85 × ₹400 = ₹2,340. Net profit per customer = ₹2,340 - ₹1,500 CAC = ₹840.\n' +
      '• Channel A CAC = ₹3,000. Payback requires 7.5 active user-months, achieved around Month 8. Total cumulative active user-months over 12 months = ~7.7 months. Cumulative gross margin = 7.7 × ₹400 = ₹3,080 + ongoing annuity. Net profit per customer = ~₹2,880+ long-term.\n' +
      'Channel B recovers cash quickly but burns out fast, while Channel A creates enduring equity.',
    optionExplanations: {
      A: 'Channel B’s steep churn (90% gone by M12) severely caps its lifetime profitability.',
      B: 'Correct. Captures the foundational SaaS trade-off: cheap paid ads recover capital fast but have low terminal LTV; high-intent SEO has slower payback but compounding high retention.',
      C: 'Channel A requires ₹3,000 to recover, which cannot be paid back faster than Channel B’s ₹1,500.',
      D: 'Conflates aggregate volume with unit economic profitability per customer.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['cac-payback', 'ltv-cac', 'unit-economics'],
  },
  {
    id: 'int-6',
    levelId: 'intermediate',
    orderIndex: 6,
    title: 'Negotiating Guardrails with Growth Marketing',
    scenario:
      'Your payment app’s push notification open rate dropped from 14% to 8% following the launch of daily gamified scratch cards. Concurrently, uninstalls increased by 18%. The Growth Marketing team argues that daily gross transacting users still rose 3% and insists on running the campaign for another 90 days.',
    questionText: 'As the Core Product PM, what is the best course of action?',
    difficulty: 'hard',
    competency: 'Communication & Decision-Making',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Accede to Growth Marketing because a 3% increase in transacting users directly impacts quarterly revenue targets.' },
      { key: 'B', text: 'Turn off all push notifications permanently to protect against further user uninstalls.' },
      { key: 'C', text: 'Challenge Growth Marketing by escalating directly to the CEO with an urgent demand to cancel their campaign.' },
      { key: 'D', text: 'Propose an immediate frequency cap and opt-out preference for scratch cards, setting an agreed guardrail metric on uninstall rate that triggers automatic rollback.' },
    ],
    correctOption: 'D',
    explanation:
      'High-performing PMs avoid false dichotomies between growth and retention. An 18% surge in uninstalls represents permanent destruction of user capital. Establishing frequency capping, user notification categorization, and an agreed guardrail metric protects user equity while allowing Growth Marketing to iterate.',
    optionExplanations: {
      A: 'Sacrificing long-term user retention for short-term 3% transaction bumps burns out your install base.',
      B: 'Disabling all notifications harms legitimate transactional alerts (payment receipts, security OTPs).',
      C: 'Immediate executive escalation without proposing a collaborative data-driven compromise destroys cross-functional alignment.',
      D: 'Correct. Establishes guardrail boundaries and frequency controls, balancing immediate transaction metrics with long-term retention defense.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['growth-vs-retention', 'guardrails', 'stakeholder-alignment'],
  },
  {
    id: 'int-7',
    levelId: 'intermediate',
    orderIndex: 7,
    title: 'Managing Enterprise Custom Deployment Demands',
    scenario:
      'Your enterprise supply chain product signs a contract with a Fortune 500 client that accounts for 22% of your ARR. Three months into onboarding, their procurement lead demands that you build a customized, on-premise deployment mode within 90 days or they will invoke a clause to withhold payment. Your product is strictly multi-tenant cloud SaaS.',
    questionText: 'What is the most strategically sound response?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Refuse on-premise development; offer a Dedicated Virtual Private Cloud (VPC) instance with single-tenant data isolation and SOC2 compliance instead.' },
      { key: 'B', text: 'Agree to build the on-premise version immediately to protect 22% of company ARR, creating a specialized fork of your codebase.' },
      { key: 'C', text: 'Terminate the customer contract immediately to protect product architectural purity.' },
      { key: 'D', text: 'Offer a 50% discount on their annual contract if they agree to waive their deployment objection and use public cloud.' },
    ],
    correctOption: 'A',
    explanation:
      'Building an on-premise version forks your code repository, fractures CI/CD automation, requires on-site installation engineers, and turns a scalable SaaS into a custom professional services shop. Offering a dedicated VPC with single-tenant encryption addresses the client\'s underlying security and data residency concerns without forking the software architecture.',
    optionExplanations: {
      A: 'Correct. Solves the customer’s security/compliance requirements while fiercely defending the multi-tenant SaaS architecture.',
      B: 'Forking code for a single customer creates a permanent maintenance nightmare that delays all future roadmap releases.',
      C: 'Prematurely canceling 22% of company revenue without exploring VPC/security compromises endangers company solvency.',
      D: 'Discounts do not resolve security/compliance objections for Fortune 500 risk committees.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['enterprise-strategy', 'on-prem-vs-saas', 'architecture'],
  },
  {
    id: 'int-8',
    levelId: 'intermediate',
    orderIndex: 8,
    title: 'Detecting Dark Patterns & Downstream Brand Erosion',
    scenario:
      'A travel booking platform runs an A/B test on a "Urgency Countdown Timer" on hotel room pages ("Only 2 rooms left at this price!"). Variant B shows a 4.5% lift in booking conversion rate (p = 0.01). However, customer cancellation rate within 24 hours increases from 8% to 14%, and Net Promoter Score (NPS) for Variant B users drops by 18 points.',
    questionText: 'How should the PM interpret and act upon these results?',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Roll out Variant B because the 4.5% conversion lift is statistically significant and hotel room cancellations are an operational matter for hotels, not the platform.' },
      { key: 'B', text: 'Disregard cancellations and NPS as soft lagging metrics that have little correlation with commercial revenue.' },
      { key: 'C', text: 'Reject Variant B for broad rollout; the net booking value after cancellations is negative, and artificial urgency erodes brand trust and customer NPS.' },
      { key: 'D', text: 'Double the countdown timer animation speed to make the urgency even more prominent.' },
    ],
    correctOption: 'C',
    explanation:
      'Math and customer trust analysis:\n' +
      '• Baseline: 100 bookings → 8 cancellations = 92 realized stays.\n' +
      '• Variant B: 104.5 bookings (+4.5%) → 14% cancel = 14.6 cancellations → 89.9 realized stays.\n' +
      'Variant B produces FEWER net completed stays (89.9 vs 92.0) while driving an 18-point collapse in NPS. Synthetic urgency induces panic purchases that immediately get canceled upon buyer reflection.',
    optionExplanations: {
      A: 'Ignores the net revenue loss: cancellations directly reduce merchant commissions and increase customer service tickets.',
      B: 'NPS collapse and refund rates are direct predictors of future organic retention and repeat booking frequency.',
      C: 'Correct. Proves that conversion lift was phantom revenue that actually degraded net completed transactions and brand equity.',
      D: 'Doubling down on deceptive dark patterns accelerates customer churn and invites regulatory fines.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['dark-patterns', 'net-revenue', 'a-b-testing'],
  },
  {
    id: 'int-9',
    levelId: 'intermediate',
    orderIndex: 9,
    title: 'Unblocking Cross-Functional Sprint Dependencies',
    scenario:
      'Your engineering team is split into two factions: Front-end engineers are waiting on incomplete Backend API endpoints for Feature X, while Backend engineers are blocked by unclear third-party webhook specifications for Feature Y. The sprint is at day 6 of 10, and sprint velocity is projected to collapse by 50%.',
    questionText: 'What should the PM do immediately to salvage the sprint?',
    difficulty: 'hard',
    competency: 'Prioritization & Execution',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Extend the sprint by 5 days to allow Backend engineers time to unblock third-party webhooks.' },
      { key: 'B', text: 'Define a mocked API contract so Frontend engineers can complete UI development and integration tests independently of Backend completion.' },
      { key: 'C', text: 'Reprimand the Backend team in daily standup for not flagging third-party dependencies earlier.' },
      { key: 'D', text: 'Pull in a brand-new backlog feature that requires neither frontend nor backend cross-dependency.' },
    ],
    correctOption: 'B',
    explanation:
      'Contract-driven development unblocks teams immediately. Agreeing on a JSON schema / OpenAPI contract allows frontend engineers to build and test against mocked endpoints. When the backend service completes, integration requires only switching the endpoint URL.',
    optionExplanations: {
      A: 'Extending sprints masks planning dysfunction and disrupts deployment release cadences.',
      B: 'Correct. Mocking interface contracts decouples the dependency chain and preserves frontend engineering velocity.',
      C: 'Blaming engineers in standup destroys morale without addressing the technical block.',
      D: 'Swapping in unplanned features mid-sprint creates context-switching chaos and leaves Feature X half-built.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['sprint-execution', 'dependencies', 'api-contracts'],
  },
  {
    id: 'int-10',
    levelId: 'intermediate',
    orderIndex: 10,
    title: 'Correcting Unit Economic Leaks from Abusive Workloads',
    scenario:
      'You lead a B2B productivity app with 5,000 active business accounts. You discover that 15% of your accounts represent 75% of your cloud storage costs because their employees use your platform as an uncompressed video archive, even though your core product is team task management.',
    questionText: 'What is the best pricing and product intervention to correct this unit economic leak?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Introduce storage quotas per tier with clear overage pricing, while implementing client-side compression and archiving policies.' },
      { key: 'B', text: 'Delete all video files older than 30 days without notice to instantly reduce server hosting invoices.' },
      { key: 'C', text: 'Ban video uploads completely across the platform to eliminate storage cost variance.' },
      { key: 'D', text: 'Double subscription prices for all 5,000 accounts to subsidize the heavy storage consumers.' },
    ],
    correctOption: 'A',
    explanation:
      'Software pricing must align monetization with underlying marginal cost drivers. Enforcing storage tiers with overage fees protects gross margins by charging heavy consumers for their infrastructure usage while client-side compression reduces total bytes stored.',
    optionExplanations: {
      A: 'Correct. Aligns infrastructure resource consumption directly with monetization and modern compression standards.',
      B: 'Deleting customer data without warning breaches contract agreements and results in immediate lawsuits.',
      C: 'Banning video completely degrades legitimate user workflows (e.g. bug demonstration clips).',
      D: 'Punishing the 85% normal users with a price hike to subsidize 15% abusers causes mass churn to competitors.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['pricing-tiers', 'unit-economics', 'cost-allocation'],
  },
  {
    id: 'int-11',
    levelId: 'intermediate',
    orderIndex: 11,
    title: 'Multi-Option Discounting & ARPU Preservation Calculation',
    scenario:
      'A health-tech subscription app conducts an A/B test on annual plan discounting:\n' +
      '• Control: ₹3,000/year upfront. 20,000 checkout visits → 800 purchases (4.0% conversion).\n' +
      '• Variant 1: ₹2,400/year upfront (20% discount). 20,000 checkout visits → 1,050 purchases (5.25% conversion).\n' +
      '• Variant 2: ₹1,800/year upfront (40% discount). 20,000 checkout visits → 1,400 purchases (7.0% conversion).',
    questionText: 'Which option generates the highest total revenue, and what strategic trade-off should guide the decision?',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Variant 2 generates the highest revenue at ₹25,20,000 and should be rolled out because 1,400 subscribers maximizes market share.' },
      { key: 'B', text: 'Control generates the highest revenue at ₹26,00,000 due to non-discounted pricing.' },
      { key: 'C', text: 'Variant 1 and Variant 2 generate identical revenue of ₹25,20,000, but Variant 2 is superior because 7.0% conversion is higher.' },
      { key: 'D', text: 'Variant 1 and Variant 2 tie at ₹25,20,000, but Variant 1 is superior because it preserves 33% higher ARPU and reduces long-term renewal discount drag.' },
    ],
    correctOption: 'D',
    explanation:
      'Math verification:\n' +
      '• Control: 800 × ₹3,000 = ₹24,00,000\n' +
      '• Variant 1: 1,050 × ₹2,400 = ₹25,20,000\n' +
      '• Variant 2: 1,400 × ₹1,800 = ₹25,20,000\n' +
      'Both variants produce identical top-line gross revenue (₹25.20 Lakh), but Variant 1 delivers it with 350 fewer accounts to service (lower support overhead) and preserves a 33% higher ARPU (₹2,400 vs ₹1,800). Discounting to ₹1,800 establishes a low willingness-to-pay anchor that cripples future renewal economics.',
    optionExplanations: {
      A: 'Variant 2 does not generate higher revenue; it ties Variant 1 while requiring 33% higher subscriber servicing costs.',
      B: 'Control revenue is ₹24,00,000, which is lower than both variants.',
      C: 'Choosing Variant 2 merely for the conversion percentage ignores that each customer paid significantly less.',
      D: 'Correct. Identifies the mathematical tie and applies mature product judgment regarding ARPU anchoring and margin preservation.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['pricing-elasticity', 'arpu', 'calculation'],
  },
  {
    id: 'int-12',
    levelId: 'intermediate',
    orderIndex: 12,
    title: 'Removing Trust Friction in Fintech Onboarding',
    scenario:
      'A personal finance app introduces an automated "Round-up Savings" feature that rounds purchases to the nearest ₹10 and deposits spare change into a mutual fund. In testing, 90% of users who activated the feature loved it. However, adoption stalled at 4% across the app. Funnel analysis reveals that 85% of users drop off at the screen asking for net-banking credentials and OTP.',
    questionText: 'What is the primary bottleneck and recommended solution?',
    difficulty: 'hard',
    competency: 'Product Sense & User Empathy',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Users don\'t care about spare change; pivot to fixed recurring SIPs of ₹5,000/month.' },
      { key: 'B', text: 'The UI needs gamification animations celebrating each round-up coin saved.' },
      { key: 'C', text: 'High friction and acute security mistrust at credential entry; integrate RBI Account Aggregator protocol or UPI AutoPay for secure, non-credential consent.' },
      { key: 'D', text: 'Make the feature mandatory during initial app registration so users cannot skip it.' },
    ],
    correctOption: 'C',
    explanation:
      'Demanding bank passwords and OTPs triggers acute fraud and security fears. Users love the automated savings value proposition, but will not hand over banking credentials. Integrating standardized non-credential consent rails (such as India\'s RBI Account Aggregator framework or UPI AutoPay) establishes institutional trust and eliminates the drop-off.',
    optionExplanations: {
      A: 'Users who activated the feature had a 90% satisfaction rate; the concept is proven, the credential rail is broken.',
      B: 'Visual gamification does not eliminate fear of financial theft or phishing.',
      C: 'Correct. Replaces a high-friction credential demand with regulated tokenized consent rails.',
      D: 'Forcing bank connection during signup will collapse initial user registration conversion.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['fintech', 'trust-friction', 'onboarding'],
  },
  {
    id: 'int-13',
    levelId: 'intermediate',
    orderIndex: 13,
    title: 'Handling Regulatory Compliance Under Roadmap Deadlines',
    scenario:
      'Your roadmap has a major feature release scheduled for Q3. Sales commits that this feature will unlock ₹3 Crore in pipeline. Halfway through the quarter, a regulatory compliance mandate (data localization requirements) is issued with a strict 45-day deadline. Failure to comply risks legal penalties and license suspension. Engineering estimates compliance will consume 60% of capacity for the next 6 weeks.',
    questionText: 'What is the proper executive decision for the PM?',
    difficulty: 'hard',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Ignore the compliance mandate until Q4 so the commercial Q3 feature delivers on its revenue pipeline commitment.' },
      { key: 'B', text: 'Re-scope the commercial feature to a minimal phase-1 pilot and allocate required capacity to meet the compliance deadline without legal liability.' },
      { key: 'C', text: 'Outsource the entire compliance refactor to an unvetted offshore vendor to avoid distracting internal developers.' },
      { key: 'D', text: 'Tell Sales that all commercial development is canceled indefinitely due to regulatory bureaucracy.' },
    ],
    correctOption: 'B',
    explanation:
      'Regulatory compliance is a non-negotiable license to operate. A company cannot generate revenue if its operating license is suspended. A disciplined PM protects the company legally while creatively de-scoping the commercial feature into a pilot to preserve momentum.',
    optionExplanations: {
      A: 'Flouting regulatory deadlines risks existential operating license revocation and fines.',
      B: 'Correct. Meets non-negotiable legal compliance requirements while shipping a pragmatic scoped subset of commercial commitments.',
      C: 'Outsourcing mission-critical data security compliance to unvetted vendors introduces severe breach and liability risks.',
      D: 'Canceling development indefinitely damages commercial morale and pipeline execution.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['regulatory-compliance', 'risk-management', 'prioritization'],
  },
  {
    id: 'int-14',
    levelId: 'intermediate',
    orderIndex: 14,
    title: 'Defending Gross Margin Contraction to Executive Leadership',
    scenario:
      'You present your quarterly product review to the Executive Committee. Your North Star Metric (Weekly Active Collaborators) grew 18%, but the CFO points out that Gross Margin contracted from 78% to 71% due to AI inference server costs. The CFO asks: "Why should we continue funding your team\'s AI roadmap if it is destroying gross margins?"',
    questionText: 'What is the most effective and credible response?',
    difficulty: 'hard',
    competency: 'Communication & Decision-Making',
    format: 'analytical',
    options: [
      { key: 'A', text: 'Defend the margin compression with unit economics data showing how AI drives a 35% reduction in churn and propose concrete model quantization and caching initiatives to restore margins to 78% within 2 quarters.' },
      { key: 'B', text: 'Argue that gross margins do not matter in modern software companies as long as user growth is positive.' },
      { key: 'C', text: 'Blame the engineering team for selecting inefficient AI models without monitoring cloud compute bills.' },
      { key: 'D', text: 'Offer to shut down all AI features by the end of the week to immediately appease the CFO.' },
    ],
    correctOption: 'A',
    explanation:
      'Executive communication requires financial fluency. Dismissing the CFO’s concerns burns credibility. A seasoned PM connects product features to revenue retention (e.g. 35% churn reduction increases LTV) and pairs it with a technical engineering roadmap (caching, smaller fine-tuned models, quantization) that systematically restores target margins.',
    optionExplanations: {
      A: 'Correct. Shows deep command of financial metrics, validates retention impact, and presents a concrete engineering roadmap to restore margins.',
      B: 'Dismissing gross margin demonstrates financial illiteracy to the CFO.',
      C: 'Blaming colleagues destroys executive trust and team psychological safety.',
      D: 'Panicked retreat forfeits a core product differentiator that is driving user growth.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['cfo-communication', 'gross-margins', 'ai-economics'],
  },
  {
    id: 'int-15',
    levelId: 'intermediate',
    orderIndex: 15,
    title: 'Restructuring Pricing Models for Scalable Unit Economics',
    scenario:
      'A B2B workflow management tool has 500 customers on a flat ₹5,000/month plan with unlimited users. A cohort of 40 fast-growing enterprise customers now has over 200 users each, consuming 60% of customer support tickets and database load, while paying the exact same ₹5,000/month as a 3-person boutique agency.',
    questionText: 'How should the PM restructure pricing to align with value delivered and protect unit economics?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Keep flat pricing but terminate the 40 largest accounts to reduce server and support overhead.' },
      { key: 'B', text: 'Cap the flat plan at 10 users and introduce per-seat pricing (or tiered active user tiers) with enterprise SAML SSO and dedicated support for large accounts.' },
      { key: 'C', text: 'Charge every customer a mandatory ₹50,000 one-time onboarding fee.' },
      { key: 'D', text: 'Make the software open-source and rely on voluntary donations from enterprises.' },
    ],
    correctOption: 'B',
    explanation:
      'Flat unlimited pricing in B2B SaaS is an anti-pattern that penalizes small users while subsidizing massive enterprise consumers. Moving to per-seat or tiered user bands ensures revenue scales with customer value and operational load, while packaging SSO and SLAs creates high willingness to pay for enterprise tiers.',
    optionExplanations: {
      A: 'Firing your 40 largest enterprise accounts destroys the company’s highest-value expansion pipeline.',
      B: 'Correct. Standardizes modern SaaS monetization, aligns revenue with usage, and captures enterprise willingness to pay.',
      C: 'Arbitrary onboarding fees do not solve recurring usage and compute imbalances.',
      D: 'Voluntary donations cannot support commercial infrastructure or product development.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['b2b-pricing', 'packaging', 'unit-economics'],
  },

  // =========================================================================
  // ADVANCED LEVEL (10 QUESTIONS: 3 MCQs + 3 STRATEGIC SCENARIOS + 4 WRITTEN CASES)
  // Answer keys: Q1: B, Q2: D, Q3: A, Q4: C, Q5: B, Q6: A, Q7-10: Standard Rubric
  // =========================================================================
  {
    id: 'adv-1',
    levelId: 'advanced',
    orderIndex: 1,
    title: 'Multi-Objective Payment Orchestration Routing Optimization',
    scenario:
      'A payment platform routes $50M/month across three acquirers:\n' +
      '• Acquirer 1: Fee = 1.8%, Authorization Success Rate = 94.0%, P99 Latency = 800ms\n' +
      '• Acquirer 2: Fee = 2.4%, Authorization Success Rate = 97.5%, P99 Latency = 350ms\n' +
      '• Acquirer 3: Fee = 2.0%, Authorization Success Rate = 95.5%, P99 Latency = 1200ms\n' +
      'Average order value is $100, and gross profit margin on goods sold is 20%. A failed transaction has a 60% probability of permanent customer abandonment (no retry).',
    questionText: 'Which routing strategy maximizes net merchant gross profit?',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Route all transactions to Acquirer 1 to minimize processing fee expenses at 1.8%.' },
      { key: 'B', text: 'Route transactions dynamically: primary to Acquirer 2 (97.5% success rate saves far more in retained margin than the 0.6% fee delta), with Acquirer 3 as secondary failover.' },
      { key: 'C', text: 'Split volume evenly across all three acquirers to prevent single-provider vendor lock-in.' },
      { key: 'D', text: 'Route all volume to Acquirer 3 because it represents the mathematical median in both fee and success rate.' },
    ],
    correctOption: 'B',
    explanation:
      'Unit economics breakdown:\n' +
      'On a $100 transaction with 20% gross margin ($20 profit), a 3.5% drop in authorization rate (Acquirer 2 vs Acquirer 1) loses 3.5 orders per 100. With 60% permanent abandonment, that is 2.1 lost orders × $20 margin = $42.00 lost gross profit per 100 transactions ($0.42 per order). The fee savings of Acquirer 1 is only 0.60% ($0.60). When factoring in customer lifetime value (LTV) and secondary failover recovery, routing through high-authorization Acquirer 2 dramatically out-earns the fee difference.',
    optionExplanations: {
      A: 'Chasing the lowest fee causes a 3.5% surge in failed transactions that destroys high-margin customer revenue.',
      B: 'Correct. High-converting dynamic routing with secondary failover maximizes net retained gross profit over fee minimization.',
      C: 'Naive 33% splitting sends a third of volume to high-latency and low-authorization endpoints without economic logic.',
      D: 'Median routing ignores transaction economics and latency SLAs.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['payment-routing', 'unit-economics', 'multi-objective'],
  },
  {
    id: 'adv-2',
    levelId: 'advanced',
    orderIndex: 2,
    title: 'A/B Test Peeking Hazards & Guardrail Latency',
    scenario:
      'In an A/B test on checkout, a variant reports a 5% conversion increase (p = 0.02) after 3 days of testing with 10,000 visitors. The PM wants to stop the test and deploy immediately because "statistical significance is achieved." However:\n' +
      '• Minimum Detectable Effect (MDE) was calculated for a 30-day run with 100,000 visitors.\n' +
      '• The test was monitored daily without sequential testing corrections (peeking problem).\n' +
      '• Refund and dispute rates lag by 14 days and are currently untracked.',
    questionText: 'What is the statistical and commercial implication of deploying the variant now?',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Deploy immediately; p < 0.05 guarantees a false positive probability under 5% regardless of sample size or monitoring frequency.' },
      { key: 'B', text: 'Discard the variant because any test that achieves significance in 3 days is guaranteed to be an instrumentation bug.' },
      { key: 'C', text: 'Delay the decision by 2 days, and if p remains under 0.05, deploy to 100% of traffic.' },
      { key: 'D', text: 'Keep the test running until the full planned sample size and 30-day duration are reached; early stopping severely inflates false-positive rates and conceals delayed refund guardrails.' },
    ],
    correctOption: 'D',
    explanation:
      'Continuous monitoring without alpha-spending corrections (e.g. O\'Brien-Fleming boundaries) inflates false discovery rates from 5% to over 30%. Furthermore, stopping after 3 days conceals lagging guardrail metrics like chargebacks, refunds, and return rates that take 14+ days to materialize.',
    optionExplanations: {
      A: 'A severe misunderstanding of statistical hypothesis testing; p-values are invalid when evaluated with uncorrected early stopping.',
      B: 'True large effects can emerge quickly; automatically discarding is an overreaction.',
      C: 'Adding 2 days does not resolve the peeking problem or 14-day refund lag.',
      D: 'Correct. Adheres to statistical sample design and ensures guardrail metrics have matured before irreversible deployment.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['experimentation', 'peeking-problem', 'guardrail-metrics'],
  },
  {
    id: 'adv-3',
    levelId: 'advanced',
    orderIndex: 3,
    title: 'Multi-Segment Portfolio Capital Allocation',
    scenario:
      'A portfolio SaaS company serves 3 segments:\n' +
      '• Micro-SMB: 20,000 customers, ARR = ₹10 Cr, CAC = ₹4,000, Payback = 14 mo, Churn = 36%/yr\n' +
      '• Mid-Market: 1,500 customers, ARR = ₹30 Cr, CAC = ₹40,000, Payback = 8 mo, Churn = 14%/yr\n' +
      '• Enterprise: 80 customers, ARR = ₹40 Cr, CAC = ₹5,00,000, Payback = 12 mo, Churn = 4%/yr\n' +
      'Engineering has budget for one major platform initiative. Mid-Market has the highest pipeline growth (60% YoY) and lowest payback, but Enterprise contributes the highest gross margin.',
    questionText: 'Where should product platform investment be concentrated to maximize 24-month enterprise value?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'mcq',
    options: [
      { key: 'A', text: 'Invest in automated self-serve workflows and integrations for Mid-Market, while standardizing Enterprise security to capture high-velocity, high-margin expansion.' },
      { key: 'B', text: 'Shift 100% of resources to Micro-SMB because customer count is 20,000, providing the largest TAM.' },
      { key: 'C', text: 'Discontinue Mid-Market to focus exclusively on custom development for the 80 Enterprise clients.' },
      { key: 'D', text: 'Freeze all product development and allocate budget to paid advertising.' },
    ],
    correctOption: 'A',
    explanation:
      'Micro-SMB has broken economics (14-month payback vs 36% churn means negative lifetime value). Enterprise has great retention (4% churn) but long sales cycles. Mid-Market is the growth engine: 8-month payback, 60% YoY growth, and scalable unit economics. Investing in Mid-Market workflows while hardening platform security for enterprise maximizes 24-month valuation.',
    optionExplanations: {
      A: 'Correct. Balances the rapid capital velocity of Mid-Market with the durable, high-margin retention of Enterprise.',
      B: 'Pumping resources into high-churn Micro-SMB with 14-month payback destroys shareholder capital.',
      C: 'Abandoning the fastest-growing segment (60% YoY, 8-month payback) surrenders the market to competitors.',
      D: 'Freezing development causes enterprise churn and halts competitive product differentiation.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['portfolio-strategy', 'unit-economics', 'capital-allocation'],
  },
  {
    id: 'adv-4',
    levelId: 'advanced',
    orderIndex: 4,
    title: 'AI Confidence Gating & Human-in-the-Loop Risk Architecture',
    scenario:
      'Your AI co-pilot product automates medical coding for healthcare clinics. The AI achieves 98.5% precision on standard claims, speeding up clinic billing by 5x. However, on complex hospital surgical claims (1.5% of volume), it has an undetected 12% error rate that triggers regulatory audit rejections and insurer fines. Enterprise hospital networks demand immediate indemnity insurance and refuse deployment.',
    questionText: 'What is the best product architecture and risk mitigation rollout strategy?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Abandon hospital surgical claims completely and restrict the product solely to simple dental and optical clinics.' },
      { key: 'B', text: 'Launch to all hospital networks with a click-wrap disclaimer stating the clinic accepts full legal liability for all AI outputs.' },
      { key: 'C', text: 'Introduce a confidence scoring gate: claims with high AI confidence (>99%) process automatically, while lower-confidence or surgical claims route to a human-in-the-loop review queue with an audit trail.' },
      { key: 'D', text: 'Lower the model temperature to zero and assume all hallucinations will be eliminated.' },
    ],
    correctOption: 'C',
    explanation:
      'High-stakes AI products require risk-tiered orchestration. Confidence threshold gating delivers 5x automation on 98.5% of standard claims, while cleanly routing edge-case surgical claims to certified human coders. This eliminates regulatory catastrophe while proving safety to enterprise risk committees.',
    optionExplanations: {
      A: 'Retreating to low-margin dental clinics concedes high-value hospital enterprise contracts.',
      B: 'Enterprise hospitals will never accept unilateral liability disclaimers for regulatory healthcare compliance.',
      C: 'Correct. Captures 98% of speed value while bounding risk through automated confidence routing and human verification.',
      D: 'Zero temperature does not prevent domain hallucinations or misclassification of ambiguous clinical text.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['ai-product', 'risk-management', 'human-in-the-loop'],
  },
  {
    id: 'adv-5',
    levelId: 'advanced',
    orderIndex: 5,
    title: 'Geographic Expansion vs Adjacent Multi-Product Sequencing',
    scenario:
      'Your product has captured 65% market share in its home country, and domestic customer acquisition costs have risen 55% YoY due to saturation. The board demands 40% top-line ARR growth next year. You have two expansion paths:\n' +
      '• Path 1: Geographic expansion to a neighboring country with 3x larger TAM, requiring ₹12 Cr capex in localization, regulatory licenses, and new payment rails.\n' +
      '• Path 2: Multi-product expansion into an adjacent software module (e.g., payroll integration for existing HR customers), requiring ₹4 Cr capex and leveraging your existing 65% customer base with zero incremental CAC.',
    questionText: 'Which strategy represents the superior risk-adjusted capital allocation, and why?',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Path 1 because larger TAM always justifies higher capital expenditure regardless of existing distribution advantages.' },
      { key: 'B', text: 'Path 2 because selling adjacent products to an existing captive customer base exploits distribution leverage, achieves immediate payback, and de-risks growth before international entry.' },
      { key: 'C', text: 'Pursue both Path 1 and Path 2 simultaneously to maximize the probability that at least one hits the 40% target.' },
      { key: 'D', text: 'Reject both paths and cut operational headcount to return dividends to shareholders.' },
    ],
    correctOption: 'B',
    explanation:
      'In mature software businesses, Net Revenue Retention (NRR) and multi-product cross-selling to a captive 65% customer base has near-zero CAC, immediate payback, and high adoption velocity. Launching international entry before exhausting domestic expansion introduces high regulatory, competitive, and operational capex risk.',
    optionExplanations: {
      A: 'TAM without proprietary distribution is expensive to conquer; entering a new geography against local incumbents carries high failure rates.',
      B: 'Correct. Capitalizes on unfair distribution advantages, generating high-margin expansion ARR at 1/3 the capex of geographic expansion.',
      C: 'Pursuing both divides focus and drains cash reserves.',
      D: 'Giving up on growth when cross-sell potential is unexploited destroys enterprise valuation multiples.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['growth-strategy', 'capital-allocation', 'expansion-revenue'],
  },
  {
    id: 'adv-6',
    levelId: 'advanced',
    orderIndex: 6,
    title: 'Staging High-Beta Innovation vs Low-Risk Commitments',
    scenario:
      'In a quarterly planning session, Team Alpha proposes an unvalidated breakthrough concept (AI autonomous agent) with a projected revenue of ₹10 Cr but only 20% confidence. Team Beta proposes a compliance and performance refactor with a projected revenue protection of ₹4 Cr with 90% confidence. Both initiatives require the entire squad\'s capacity for the quarter.',
    questionText: 'What is the most disciplined product leadership approach?',
    difficulty: 'hard',
    competency: 'Prioritization & Execution',
    format: 'scenario_mcq',
    options: [
      { key: 'A', text: 'Fund Team Beta\'s compliance refactor for the quarter\'s engineering commitment, while funding a 2-week lightweight discovery prototype spike for Team Alpha to de-risk customer willingness to pay before committing full capacity.' },
      { key: 'B', text: 'Fund Team Alpha fully because ₹10 Cr upside dwarfs ₹4 Cr and product leaders must take bold unvalidated risks.' },
      { key: 'C', text: 'Split the squad 50/50 so both teams build half of their proposal simultaneously.' },
      { key: 'D', text: 'Reject both proposals and tell teams to submit lower-effort features instead.' },
    ],
    correctOption: 'A',
    explanation:
      'Expected value calculation:\n' +
      '• Alpha EV = 20% × ₹10 Cr = ₹2.0 Cr\n' +
      '• Beta EV = 90% × ₹4 Cr = ₹3.6 Cr\n' +
      'Team Beta delivers significantly higher risk-adjusted return and defends core platform integrity. However, writing off Alpha completely concedes future innovation. Allocating a 2-week discovery spike de-risks Alpha’s assumptions at 5% of the cost, before deciding whether to commit full engineering in the subsequent cycle.',
    optionExplanations: {
      A: 'Correct. Protects high-confidence baseline revenue while cheaply buying option value on breakthrough innovation.',
      B: 'Gambling an entire quarter on a 20% confidence bet when compliance is at risk is reckless management.',
      C: 'Splitting capacity produces two incomplete, un-shippable deliverables.',
      D: 'Rejecting both stifles engineering agency and leaves problems unsolved.',
    },
    scoringWeight: 1,
    isActive: true,
    tags: ['expected-value', 'portfolio-management', 'discovery-spikes'],
  },

  // =========================================================================
  // WRITTEN STRATEGIC CASES (Q7 - Q10) - SECTION 6 BENCHMARKS
  // Standardized 5-Dimension Rubric (Problem Framing 20%, Analytical Reasoning 25%,
  // Decision Quality 25%, Validation & Metrics 20%, Communication 10%)
  // =========================================================================
  {
    id: 'adv-7',
    levelId: 'advanced',
    orderIndex: 7,
    title: 'Written Strategic Case 1: Growth Strategy & NRR Degradation',
    scenario:
      'A SaaS business has ₹8 crore in annual recurring revenue. New customer acquisition is growing 35% year over year, but Net Revenue Retention (NRR) has fallen from 112% to 96%. The board expects the business to double ARR to ₹16 crore within 24 months.',
    questionText:
      'Deliver your strategic executive turnaround memo:\n' +
      '1. Diagnose the root growth challenge and unit economic breakdown (explain why NRR < 100% makes doubling ARR mathematically impossible under current acquisition rates).\n' +
      '2. Identify the specific cohort, customer segment, and usage telemetry data required to locate the churn leak.\n' +
      '3. Compare the trade-offs of five growth levers: acquisition spending, retention defense, expansion/upsell tiers, pricing restructuring, and customer segment pruning.\n' +
      '4. Recommend a prioritized investment roadmap for the next two quarters.\n' +
      '5. Define explicit success metrics, leading indicators, and decision thresholds that would cause you to change course.',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must demonstrate understanding that an NRR of 96% means the existing customer base is shrinking by 4% net each year, forcing acquisition to fill a leaky bucket. Must propose segment-level cohort analysis, packaging/pricing or CS interventions, and quantitative leading indicators.',
    explanation:
      'When NRR drops below 100%, SaaS compounding reverses into an uphill treadmill. Accelerating acquisition spending into an NRR of 96% degrades capital efficiency. The business must plug gross churn and unlock expansion tiers to restore NRR > 110% before scaling acquisition spend.',
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
      'A checkout experiment increases completion rate by 6%, reduces Average Order Value (AOV) by 9%, and increases payment gateway failure rates by 14% for your highest-value customer segment. The sample size is large (50,000 orders), but the experiment ran during a nationwide holiday promotional weekend with heavy sitewide discounting.',
    questionText:
      'Provide your analytical and operational rollout recommendation:\n' +
      '1. Quantify the net revenue and margin impact of a 6% completion lift paired with a 9% AOV drop.\n' +
      '2. Analyze the confounding threat of holiday promotional traffic and discuss how buyer intent during discount periods distorts baseline behavior.\n' +
      '3. Evaluate the payment failure anomaly on the high-value segment (identify potential technical and fraud-scoring causes).\n' +
      '4. Make a definitive decision: full rollout, targeted rollout by customer segment, or re-testing under neutral baseline traffic.\n' +
      '5. Define operational guardrails, secondary metrics, and automated rollback criteria.',
    difficulty: 'hard',
    competency: 'Data & Analytical Thinking',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must calculate net revenue multiplier: 1.06 × 0.91 = 0.9646 (a net 3.5% revenue decline!). Must recognize holiday traffic skew, hypothesize fraud/3DS rules affecting high-ticket checkouts, and recommend against an unconstrained rollout.',
    explanation:
      'Conversion lift paired with AOV drop frequently produces net negative revenue: 1.06 × 0.91 = 0.965 (-3.5% revenue loss). Holiday promotions attract low-AOV discount seekers, confounding findings. Surging payment failures on top-tier buyers destroys core profitability.',
    rubric: STANDARD_CASE_RUBRIC,
    isActive: true,
    tags: ['case-study', 'a-b-testing', 'analytical-reasoning'],
  },
  {
    id: 'adv-9',
    levelId: 'advanced',
    orderIndex: 9,
    title: 'Written Strategic Case 3: Platform Strategy & Infrastructure Unit Economics',
    scenario:
      'Your developer API platform is experiencing rapid enterprise adoption (+80% YoY), but cloud infrastructure hosting costs have tripled (+200%), and system availability dropped from 99.95% to 99.5% (exceeding quarterly SLA error budgets). Furthermore, three key enterprise customers are demanding custom bespoke integrations that would consume 40% of upcoming engineering capacity.',
    questionText:
      'Deliver your platform turnaround and architecture strategy:\n' +
      '1. Analyze unit economics: diagnose why infrastructure costs are scaling super-linearly relative to customer volume.\n' +
      '2. Distinguish scalable, extensible platform investments (e.g. webhooks, rate limiting, self-serve developer portals) from unscalable one-off custom engineering.\n' +
      '3. Recommend structural changes to packaging, consumption pricing, rate-limiting quotas, and customer tiering.\n' +
      '4. Present a prioritized engineering roadmap balancing reliability debt against enterprise feature requests under a fixed engineering budget.\n' +
      '5. Define SLA recovery milestones, gross margin targets, and customer churn guardrails.',
    difficulty: 'hard',
    competency: 'Prioritization & Execution',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must identify super-linear cost drivers (unindexed queries, missing caching, unmetered polling). Must transition from flat billing to tiered consumption-based pricing with rate limits, while redirecting custom enterprise requests into generalized webhook/API extension points.',
    explanation:
      'Platform products must tie compute consumption to monetization. When usage outpaces revenue, pricing models must transition from flat access to consumption-aligned tiers. Custom customer demands must be channeled into generalized extensibility hooks rather than custom single-tenant code forks.',
    rubric: STANDARD_CASE_RUBRIC,
    isActive: true,
    tags: ['case-study', 'platform-strategy', 'infrastructure-economics'],
  },
  {
    id: 'adv-10',
    levelId: 'advanced',
    orderIndex: 10,
    title: 'Written Strategic Case 4: AI Product Risk & Differentiated Deployment Tiers',
    scenario:
      'An enterprise AI workflow product reduces document processing time by 40%, but 1% of outputs contain factual errors. In low-stakes workflows (routine status memos), errors are harmless; in high-stakes workflows (legal contracts, regulatory compliance disclosures), errors can cause substantial financial and legal liability. Enterprise clients demand 99.9% accuracy before signing, while mid-market clients prioritize speed and affordability.',
    questionText:
      'Outline your executive risk architecture and launch playbook:\n' +
      '1. Segment risk across customer tiers and workflow use cases by failure severity and reversibility.\n' +
      '2. Define acceptable launch conditions and design safeguards (e.g., confidence score gates, provenance citation links, human-in-the-loop review queues).\n' +
      '3. Formulate a differentiated product packaging tier strategy (e.g., standard automated vs human-certified enterprise tier).\n' +
      '4. Design a controlled canary rollout and telemetry monitoring plan to detect model drift and hallucination spikes.\n' +
      '5. Establish clear go/no-go gates and automated rollback triggers.',
    difficulty: 'hard',
    competency: 'Strategy & Business Thinking',
    format: 'written_case',
    scoringWeight: 2,
    acceptedCriteria:
      'Candidate must segment by reversibility (two-way door vs one-way door errors), propose confidence-based routing with human-in-the-loop fallback for low-confidence outputs, and structure tiered pricing where enterprise pays a premium for guaranteed human-reviewed accuracy.',
    explanation:
      'AI error rates cannot be treated uniformly. High-stakes workflows demand confidence routing, audit provenance citations, and human-in-the-loop verification queues. Differentiating tiers allows capturing price-sensitive mid-market users while satisfying enterprise legal compliance.',
    rubric: STANDARD_CASE_RUBRIC,
    isActive: true,
    tags: ['case-study', 'ai-risk', 'tiered-packaging'],
  },
];
