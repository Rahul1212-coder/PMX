import {
  DailyChallenge,
  ChallengeQuestion,
  PublicDailyChallenge,
  PublicChallengeQuestion,
  AchievementDefinition,
  WeeklyQuest,
} from '@/types/gamification';

/**
 * Standard Curated Achievement Definitions
 */
export const INITIAL_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_challenge',
    name: 'First Challenge',
    description: 'Complete your first PMVerse Daily 5 challenge.',
    icon: '🎯',
    category: 'challenge',
    xpReward: 30,
    rarity: 'Common',
    unlockCriteria: { totalChallengesCompleted: 1 },
    active: true,
  },
  {
    id: 'consistency_starter',
    name: 'Consistency Starter',
    description: 'Maintain a 3-day PM challenge streak.',
    icon: '🔥',
    category: 'streak',
    xpReward: 50,
    rarity: 'Common',
    unlockCriteria: { streakMilestone: 3 },
    active: true,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day daily challenge streak.',
    icon: '⚡',
    category: 'streak',
    xpReward: 100,
    rarity: 'Rare',
    unlockCriteria: { streakMilestone: 7 },
    active: true,
  },
  {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'Achieve an unbroken 30-day PM learning streak.',
    icon: '👑',
    category: 'streak',
    xpReward: 300,
    rarity: 'Epic',
    unlockCriteria: { streakMilestone: 3 },
    active: true,
  },
  {
    id: 'perfect_five',
    name: 'Perfect Five',
    description: 'Answer all 5 questions correctly with 100% accuracy in a single Daily 5.',
    icon: '💎',
    category: 'accuracy',
    xpReward: 75,
    rarity: 'Rare',
    unlockCriteria: { perfectScore: true },
    active: true,
  },
  {
    id: 'quest_completer',
    name: 'Quest Completer',
    description: 'Complete all three weekly quests in a single competition sprint.',
    icon: '📜',
    category: 'challenge',
    xpReward: 50,
    rarity: 'Common',
    unlockCriteria: { questCompleted: true },
    active: true,
  },
  {
    id: 'pm_strategist',
    name: 'Product Strategist',
    description: 'Earn over 700 XP and advance to Level 4 Product Strategist.',
    icon: '🧠',
    category: 'accuracy',
    xpReward: 100,
    rarity: 'Rare',
    unlockCriteria: { minLevel: 4 },
    active: true,
  },
  {
    id: 'arena_champion',
    name: 'Arena Champion',
    description: 'Place in the top 3 on the weekly PMVerse Arena leaderboard.',
    icon: '🏆',
    category: 'arena',
    xpReward: 200,
    rarity: 'Legendary',
    unlockCriteria: { arenaPodium: true },
    active: true,
  },
];

/**
 * 14 Canonical Daily 5 Challenges with deep, realistic PM scenarios,
 * plausible options, and comprehensive distractor explanations.
 */
export const CURATED_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'dc_metrics_retention',
    challengeDate: '2026-10-26',
    title: 'SaaS Activation & "Aha Moment" Friction',
    theme: 'Metrics & Funnels',
    description: 'Diagnose user drop-off, optimize time-to-first-value, and prevent vanity metric traps in a B2B productivity tool.',
    difficulty: 'intermediate',
    timezone: 'UTC',
    publicationStatus: 'published',
    createdAt: '2026-10-26T00:00:00Z',
    questions: [
      {
        id: 'q_ret_1',
        challengeId: 'dc_metrics_retention',
        orderIndex: 1,
        skillCategory: 'Metrics',
        difficulty: 'intermediate',
        scenario: 'A collaboration tool sees 80,000 monthly signups, but Day-1 retention dropped from 38% to 22% over the last quarter. Day-30 retention for users who create at least 2 boards remains high at 64%. The onboarding flow currently requires a 5-step workspace setup before reaching the editor.',
        questionText: 'Which product intervention should you prioritize first to diagnose and restore Day-1 retention?',
        options: [
          { id: 'A', text: 'Implement an interactive tooltip tour that forces users to step through all board editing features.' },
          { id: 'B', text: 'Analyze drop-off per onboarding step and A/B test a template-based bypass that deposits new users directly into an interactive sample board.' },
          { id: 'C', text: 'Send an automated email sequence offering 1-on-1 customer success onboarding calls to all newly signed-up accounts.' },
          { id: 'D', text: 'Lower sign-up friction by removing email verification and Google single sign-on.' }
        ],
        correctOption: 'B',
        explanation: 'Users are dropping off during the 5-step workspace configuration before experiencing the core product value. Measuring funnel drop-off per step and testing a template-based direct entry directly reduces Time-to-First-Value (TTFV) and connects them to the known retention correlation (creating boards).',
        optionExplanations: {
          A: 'Forced multi-step product tours increase cognitive fatigue and bounce rates without addressing setup friction.',
          B: 'Correct. Diagnoses the exact bottleneck in the 5-step setup and accelerates time-to-value by skipping upfront configuration.',
          C: 'High manual overhead that does not scale to 80,000 signups/mo and fails to resolve the self-serve product flaw.',
          D: 'Removing email verification invites spam and low-intent signups, artificially boosting registrations while degrading retention quality.'
        },
        points: 20
      },
      {
        id: 'q_ret_2',
        challengeId: 'dc_metrics_retention',
        orderIndex: 2,
        skillCategory: 'Experimentation',
        difficulty: 'intermediate',
        scenario: 'Your growth squad tests a 1-click template picker versus a blank canvas onboarding. The variant shows a +14% lift in Day-1 board creations (p = 0.02), but Day-7 active sessions show a -3% dip (p = 0.18). The engineering team recommends rolling out the variant immediately to celebrate the Day-1 activation win.',
        questionText: 'How should you proceed with this experiment decision?',
        options: [
          { id: 'A', text: 'Roll out the variant immediately because Day-1 activation is the primary north star metric of the onboarding team.' },
          { id: 'B', text: 'Hold the rollout; run cohort retention analysis for 14 more days to determine if low-effort template creation produces hollow activations that fail to sustain real weekly engagement.' },
          { id: 'C', text: 'Discard the experiment as inconclusive and immediately revert to the original blank canvas.' },
          { id: 'D', text: 'Increase ad spend to compensate for the Day-7 dip with higher volume.' }
        ],
        correctOption: 'B',
        explanation: 'A quick activation lift that leads to a negative downstream retention trend often indicates "shallow activation"—users clicked a template easily but did not develop an authentic workflow habit. A PM must protect downstream retention guardrails and avoid shipping superficial vanity metrics.',
        optionExplanations: {
          A: 'Optimizing Day-1 at the expense of Day-7 retention destroys long-term customer lifetime value.',
          B: 'Correct. Verifies whether template users actually return and engage, or if low friction merely inflated low-intent board creation.',
          C: 'Prematurely killing an experiment with a statistically significant early signal prevents diagnosing why the drop-off occurs downstream.',
          D: 'Pouring acquisition spend into a leaking bucket wastes marketing capital.'
        },
        points: 20
      },
      {
        id: 'q_ret_3',
        challengeId: 'dc_metrics_retention',
        orderIndex: 3,
        skillCategory: 'Prioritization',
        difficulty: 'advanced',
        scenario: 'You have a 6-week engineering sprint and 3 feature proposals to improve mid-funnel conversion: (1) Native Slack notifications (High reach, Med dev cost), (2) Real-time collaborative cursor presence (Med reach, High dev cost), (3) Offline document caching (Low reach, High dev cost). Customer interview qualitative feedback shows 70% of lost users cited "I didn\'t know my teammates were waiting for my feedback."',
        questionText: 'Applying RICE and qualitative root-cause alignment, what should you prioritize?',
        options: [
          { id: 'A', text: 'Offline document caching to support road warrior consultants.' },
          { id: 'B', text: 'Real-time collaborative cursor presence because it provides the most visual WOW factor in sales demos.' },
          { id: 'C', text: 'Native Slack notifications with actionable deep links to unblock teammate collaboration loops.' },
          { id: 'D', text: 'Split the engineering team evenly across all three projects to make progress on all fronts.' }
        ],
        correctOption: 'C',
        explanation: 'Slack notifications directly tackle the primary qualitative blocker ("teammates waiting for feedback"), close the collaboration loop with high reach, and deliver strong ROI relative to implementation complexity compared to collaborative presence or offline caching.',
        optionExplanations: {
          A: 'Offline caching serves an edge persona with low reach and does not address the core team collaboration feedback loop.',
          B: 'Real-time cursors look great in demos but do not notify an absent teammate who is offline in another window.',
          C: 'Correct. Directly targets the 70% user pain point, re-engages teammates where they already work, and achieves the highest RICE efficiency.',
          D: 'Splitting small teams leads to context switching, delays all deliverables, and fails to ship anything to production on time.'
        },
        points: 20
      },
      {
        id: 'q_ret_4',
        challengeId: 'dc_metrics_retention',
        orderIndex: 4,
        skillCategory: 'Strategy',
        difficulty: 'advanced',
        scenario: 'Your SaaS product charges $15/seat/month. Data shows 30% of accounts have 1 "power user" creator and 15 "view-only" stakeholders who log in once a month. Enterprise sales reps complain deals stall because prospects refuse to buy 16 paid licenses for 15 passive consumers.',
        questionText: 'Which pricing strategy modification balances customer expansion with revenue predictability?',
        options: [
          { id: 'A', text: 'Make all seats free and monetize solely through unpredictable third-party data analytics brokering.' },
          { id: 'B', text: 'Introduce a "Creator vs Viewer" tiering model with unlimited free view-only seats and $25/month for active creators.' },
          { id: 'C', text: 'Double the seat price to $30/month for all users to make up for lost expansion revenue.' },
          { id: 'D', text: 'Block view-only users from logging in unless an annual enterprise contract is signed.' }
        ],
        correctOption: 'B',
        explanation: 'The "Creator vs Viewer" model (popularized by Figma, Miro, and Notion) removes viral adoption friction by letting stakeholders view free, while monetizing active value creation at a higher per-seat rate. This drives viral team expansion inside enterprise accounts.',
        optionExplanations: {
          A: 'Data brokering alienates enterprise buyers, creates severe GDPR/SOC-2 compliance liabilities, and eliminates SaaS recurring revenue.',
          B: 'Correct. Unblocks viral adoption across passive consumers while capturing premium willingness-to-pay from core creators.',
          C: 'Increasing prices on non-value-creating seats compounds customer friction and accelerates competitor substitution.',
          D: 'Hard access paywalls kill organic internal word-of-mouth adoption.'
        },
        points: 20
      },
      {
        id: 'q_ret_5',
        challengeId: 'dc_metrics_retention',
        orderIndex: 5,
        skillCategory: 'Execution',
        difficulty: 'intermediate',
        scenario: 'A major security vulnerability requires an immediate library patch that will freeze all feature development for 1 sprint. The sales VP demands that you ship a custom reporting export promised to a $100k prospect closing in 4 days.',
        questionText: 'As Principal PM, how should you navigate this trade-off?',
        options: [
          { id: 'A', text: 'Bypass the security patch to close the $100k deal; patch the system after the contract is executed.' },
          { id: 'B', text: 'Enforce the security patch as non-negotiable platform hygiene, work with sales to offer the prospect a manually generated CSV report and contractual SLA commitment for the automated export in the following release.' },
          { id: 'C', text: 'Secretly deploy unreviewed code directly to production over the weekend.' },
          { id: 'D', text: 'Reject the sales request without offering any alternative or communication.' }
        ],
        correctOption: 'B',
        explanation: 'Security and data protection are foundational non-negotiables for any product. Compromising security exposes the entire platform to breaches. Offering a pragmatic bridge solution (manual CSV export + roadmap contract rider) preserves customer trust while keeping the platform secure.',
        optionExplanations: {
          A: 'Gambling with platform security for short-term revenue risks catastrophic data leaks, legal liability, and brand destruction.',
          B: 'Correct. Holds the line on critical security while creatively solving the enterprise buyer’s immediate operational need.',
          C: 'Violates change management, SOC-2 compliance, and deployment safety protocols.',
          D: 'Antagonistic stakeholder management destroys engineering-sales alignment.'
        },
        points: 20
      }
    ]
  },
  {
    id: 'dc_growth_activation',
    challengeDate: '2026-10-27',
    title: 'Fintech Onboarding & KYC Conversion Optimization',
    theme: 'Growth & Compliance',
    description: 'Solve steep drop-offs during identity verification while satisfying regulatory compliance and fraud prevention constraints.',
    difficulty: 'advanced',
    timezone: 'UTC',
    publicationStatus: 'published',
    createdAt: '2026-10-26T00:00:00Z',
    questions: [
      {
        id: 'q_fin_1',
        challengeId: 'dc_growth_activation',
        orderIndex: 1,
        skillCategory: 'Growth',
        difficulty: 'intermediate',
        scenario: 'A neo-banking app requires government ID verification (KYC). 58% of users abandon at the photo upload screen. Usability logs show 40% of camera capture attempts fail due to glare, blurriness, or low room lighting, causing generic error messages.',
        questionText: 'Which product intervention best tackles the root cause of this KYC drop-off?',
        options: [
          { id: 'A', text: 'Remove identity verification entirely from the onboarding flow and allow unverified money transfers.' },
          { id: 'B', text: 'Implement real-time edge computer-vision guidance (e.g., "Hold steady", "Move away from glare", auto-capture upon focus) combined with specific recovery messaging.' },
          { id: 'C', text: 'Offer a $10 cash bonus to anyone who fails verification more than three times.' },
          { id: 'D', text: 'Force users to visit a physical bank branch with paper photocopies.' }
        ],
        correctOption: 'B',
        explanation: 'The primary friction is physical failure of image capture and confusing generic errors. Real-time feedback and assisted edge auto-capture solve the exact mechanical failure without weakening regulatory compliance.',
        optionExplanations: {
          A: 'Violates AML/KYC banking regulations, leading to immediate regulatory shutdown and banking partner revocation.',
          B: 'Correct. Resolves the mechanical capture failure at the source while preserving regulatory compliance.',
          C: 'Incentivizes fraud and rewards failed attempts without fixing the underlying camera UX friction.',
          D: 'Eliminates the digital convenience value proposition of a neo-bank.'
        },
        points: 20
      },
      {
        id: 'q_fin_2',
        challengeId: 'dc_growth_activation',
        orderIndex: 2,
        skillCategory: 'Metrics',
        difficulty: 'advanced',
        scenario: 'To reduce fraud, the risk team enabled a strict automated fraud heuristic. Fraudulent account creations plummeted by 90%, but legitimate user onboarding conversion fell from 65% to 41%. The false positive rate is estimated at 32%.',
        questionText: 'What is the most balanced framework to evaluate this risk vs growth trade-off?',
        options: [
          { id: 'A', text: 'Ignore user conversion; zero fraud is the only acceptable metric in financial services.' },
          { id: 'B', text: 'Calculate the Net Financial Impact: (Customer Lifetime Value of legitimate users lost to false positives) vs (Expected losses saved from blocked fraudulent users), and route borderline scores to rapid manual review rather than hard rejection.' },
          { id: 'C', text: 'Completely disable the fraud engine and absorb all chargeback losses.' },
          { id: 'D', text: 'Only allow users who are referred by existing employees to register.' }
        ],
        correctOption: 'B',
        explanation: 'Zero fraud with zero users is a failure mode. A mature PM evaluates Net Financial Value, balancing LTV of lost legitimate users against fraud loss avoidance. Tiered routing (auto-approve clear, manual review borderline, auto-reject extreme) maximizes conversion.',
        optionExplanations: {
          A: 'A risk team that eliminates all risk also eliminates all business growth.',
          B: 'Correct. Quantifies trade-offs rigorously in dollars and provides a graduated review threshold instead of binary rejection.',
          C: 'Exposes the platform to organized fraud syndicates and card testing attacks.',
          D: 'Completely halts product scalability.'
        },
        points: 20
      },
      {
        id: 'q_fin_3',
        challengeId: 'dc_growth_activation',
        orderIndex: 3,
        skillCategory: 'Discovery',
        difficulty: 'intermediate',
        scenario: 'User interviews reveal that millennials are reluctant to enter their Social Security / National ID number on step 1 of signup before seeing interest rates or available savings yields.',
        questionText: 'Which UX restructuring strategy aligns user psychology with conversion optimization?',
        options: [
          { id: 'A', text: 'Hide the fact that KYC will ever be needed until after money is deposited.' },
          { id: 'B', text: 'Implement progressive profiling: allow users to explore rates, customize savings goals, and simulate returns first; only mandate ID verification at the point of initiating an account opening or fund transfer.' },
          { id: 'C', text: 'Threaten users that rates will increase if they do not provide their ID within 60 seconds.' },
          { id: 'D', text: 'Delete user accounts if they hesitate on the ID screen for more than 2 minutes.' }
        ],
        correctOption: 'B',
        explanation: 'Progressive profiling builds value perception and trust before demanding high-sensitivity personal information. When users have already invested effort in configuring their goals, the motivation to complete KYC is significantly higher.',
        optionExplanations: {
          A: 'Deceptive UX that creates user outrage when funds are locked without prior disclosure.',
          B: 'Correct. Establishes reciprocal value first; users are far more willing to complete KYC once they have customized their accounts.',
          C: 'Manipulative dark patterns that erode trust in a financial brand.',
          D: 'Hostile friction that artificially damages conversion.'
        },
        points: 20
      },
      {
        id: 'q_fin_4',
        challengeId: 'dc_growth_activation',
        orderIndex: 4,
        skillCategory: 'Prioritization',
        difficulty: 'advanced',
        scenario: 'Engineering velocity has dropped 40% due to legacy monolith banking integrations. The team estimates an 8-week refactor into microservices will delay a requested cryptocurrency wallet feature promised to investors.',
        questionText: 'How should you communicate and prioritize this architectural decision?',
        options: [
          { id: 'A', text: 'Ignore technical debt indefinitely until the database crashes.' },
          { id: 'B', text: 'Present the engineering health metrics (deployment cycle time, incident frequency, maintenance cost) to stakeholders, sequence critical infrastructure refactoring in 2-week increments paired with incremental feature milestones, and align investor expectations on platform reliability.' },
          { id: 'C', text: 'Cancel all commercial features forever and become an infrastructure-only team.' },
          { id: 'D', text: 'Ship the crypto wallet using insecure quick-and-dirty scripts without unit tests.' }
        ],
        correctOption: 'B',
        explanation: 'Technical debt must be framed in business outcomes (cycle time, outages, compliance risk). Incremental refactoring paired with tangible commercial deliverables manages investor expectations while preventing platform collapse.',
        optionExplanations: {
          A: 'Neglecting debt in fintech results in data corruption, compliance fines, and critical system downtime.',
          B: 'Correct. Bridges technical realities with business impact through clear metrics and staged execution.',
          C: 'Disregards business viability and investor commitments.',
          D: 'Incurring severe security shortcuts in crypto or financial features invites catastrophic hacks.'
        },
        points: 20
      },
      {
        id: 'q_fin_5',
        challengeId: 'dc_growth_activation',
        orderIndex: 5,
        skillCategory: 'Execution',
        difficulty: 'intermediate',
        scenario: 'A third-party identity verification vendor suffers a 4-hour global API outage. New signups are failing with "Internal Server Error" alerts.',
        questionText: 'What immediate tactical incident response should the PM coordinate?',
        options: [
          { id: 'A', text: 'Do nothing and wait for the vendor to fix their servers.' },
          { id: 'B', text: 'Display a transparent status notification to incoming users explaining verification is undergoing maintenance, queue unverified signups gracefully in a "Pending Review" holding state, and trigger automatic re-submission when the fallback verification provider responds.' },
          { id: 'C', text: 'Delete all users who tried to sign up during the outage.' },
          { id: 'D', text: 'Tweet blaming the vendor by name publicly while disabling the app completely.' }
        ],
        correctOption: 'B',
        explanation: 'A resilient product architecture handles third-party vendor failures gracefully through informative user communication, request queuing, and automated retries rather than crashing with 500 errors.',
        optionExplanations: {
          A: 'Passive negligence that results in thousands of abandoned potential customers.',
          B: 'Correct. Minimizes user frustration, queues intent, and enables seamless recovery without data loss.',
          C: 'Destroys user leads and email contacts unnecessarily.',
          D: 'Unprofessional PR conduct that damages brand reputation.'
        },
        points: 20
      }
    ]
  },
  {
    id: 'dc_marketplace_liquidity',
    challengeDate: '2026-10-28',
    title: 'Marketplace Liquidity & Merchant Retention',
    theme: 'Marketplaces & Network Effects',
    description: 'Balance two-sided marketplace demand vs supply, reduce merchant churn, and optimize take rates.',
    difficulty: 'advanced',
    timezone: 'UTC',
    publicationStatus: 'published',
    createdAt: '2026-10-26T00:00:00Z',
    questions: [
      {
        id: 'q_mkt_1',
        challengeId: 'dc_marketplace_liquidity',
        orderIndex: 1,
        skillCategory: 'Strategy',
        difficulty: 'advanced',
        scenario: 'An on-demand home services marketplace faces a severe supply-side constraint: 40% of customer requests in peak metro areas go unfulfilled because skilled service providers turn off the app after 3 PM.',
        questionText: 'Which product intervention directly incentivizes afternoon supply liquidity without inflating customer-facing prices excessively?',
        options: [
          { id: 'A', text: 'Ban service providers from the platform if they work fewer than 8 consecutive hours.' },
          { id: 'B', text: 'Implement dynamic surge payouts (boosted take-home pay funded by a modest peak convenience fee), combined with scheduled booking guarantees for afternoon slots.' },
          { id: 'C', text: 'Shut down the consumer mobile app every day at 2:59 PM.' },
          { id: 'D', text: 'Hire 10,000 full-time contractors regardless of demand variance.' }
        ],
        correctOption: 'B',
        explanation: 'Dynamic supply incentives and scheduled booking commitments address provider willingness to work during peak demand hours by guaranteeing predictable income density.',
        optionExplanations: {
          A: 'Draconian provider lock-in drives independent service pros to competing platforms.',
          B: 'Correct. Uses economic incentives (surge bonuses + route density) to balance marketplace supply and demand.',
          C: 'Surrenders 40% of marketplace GMV to competitors.',
          D: 'Creates astronomical fixed payroll liabilities that ruin unit economics.'
        },
        points: 20
      },
      {
        id: 'q_mkt_2',
        challengeId: 'dc_marketplace_liquidity',
        orderIndex: 2,
        skillCategory: 'Metrics',
        difficulty: 'intermediate',
        scenario: 'The leadership team celebrates a milestone: total registered service providers grew by 60% this quarter. However, customer fulfillment time slowed down by 25% and refund requests rose 18%.',
        questionText: 'What critical marketplace metric did the team overlook by focusing on raw registered providers?',
        options: [
          { id: 'A', text: 'Provider app icon tap count.' },
          { id: 'B', text: 'Liquidity & Active Supply Utilization: percentage of providers who accept at least 3 jobs per week and maintain a >= 4.8 star fulfillment rating within target geographic zones.' },
          { id: 'C', text: 'Number of pages in the provider terms of service document.' },
          { id: 'D', text: 'Total Instagram followers of newly onboarded providers.' }
        ],
        correctOption: 'B',
        explanation: 'Raw registration is a classic vanity metric. Marketplace health requires active, reliable, geographically matched supply utilization with acceptable quality control.',
        optionExplanations: {
          A: 'Taps are trivial interaction metrics unrelated to job completion.',
          B: 'Correct. Focuses on actionable operational liquidity and quality rather than vanity registration headcounts.',
          C: 'Legal documentation length has no bearing on marketplace transactions.',
          D: 'Social vanity metrics do not drive localized marketplace fulfillment.'
        },
        points: 20
      },
      {
        id: 'q_mkt_3',
        challengeId: 'dc_marketplace_liquidity',
        orderIndex: 3,
        skillCategory: 'Prioritization',
        difficulty: 'intermediate',
        scenario: 'Disintermediation (buyers and sellers transacting off-platform to avoid the 15% marketplace fee) has risen to an estimated 22% of repeat transactions.',
        questionText: 'What is the most effective product strategy to combat platform disintermediation?',
        options: [
          { id: 'A', text: 'Sue all customers who chat about off-platform payments.' },
          { id: 'B', text: 'Provide indispensable on-platform utility that cannot be replicated off-platform: automated invoice factoring, guaranteed payment escrow, free property damage insurance, and reputation portability.' },
          { id: 'C', text: 'Increase the marketplace fee to 35% to collect more money from the users who stay.' },
          { id: 'D', text: 'Disable in-app messaging and replace it with automated robotic voice calls.' }
        ],
        correctOption: 'B',
        explanation: 'Users leak off-platform when the take rate exceeds the value delivered. Adding proprietary workflow value (insurance, instant payout, dispute resolution, escrow) makes staying on-platform significantly more valuable than the fee saved.',
        optionExplanations: {
          A: 'Suing users is legally impossible at scale and causes massive negative viral backlash.',
          B: 'Correct. Increases the retention surplus by delivering tangible software and protection benefits that outweigh the fee.',
          C: 'Increasing fees dramatically accelerates disintermediation.',
          D: 'Crippling communication destroys user experience and conversion.'
        },
        points: 20
      },
      {
        id: 'q_mkt_4',
        challengeId: 'dc_marketplace_liquidity',
        orderIndex: 4,
        skillCategory: 'Experimentation',
        difficulty: 'advanced',
        scenario: 'To improve match rates, you test algorithm A (nearest provider by distance) vs algorithm B (highest-rated provider within 15 miles). Algorithm B increases customer NPS (+12 points) but increases provider travel time by 35%, causing provider churn in suburban areas.',
        questionText: 'How should you tune the matchmaking logic?',
        options: [
          { id: 'A', text: 'Discard provider feedback completely since only paying customers matter.' },
          { id: 'B', text: 'Develop a composite scoring function that weights rating, travel distance, and current provider load dynamically, capping maximum travel radius during high traffic windows.' },
          { id: 'C', text: 'Select providers purely by alphabetical order of their first name.' },
          { id: 'D', text: 'Force providers to pay for their own helicopter transit.' }
        ],
        correctOption: 'B',
        explanation: 'Two-sided marketplaces fail if either side is abused. A composite algorithm balances customer quality expectations with provider economic sustainability.',
        optionExplanations: {
          A: 'Ignoring supply health leads to supply starvation, causing long wait times and marketplace collapse.',
          B: 'Correct. Balances the two competing constraints through composite multi-objective optimization.',
          C: 'Arbitrary matching ignores both quality and physics.',
          D: 'Absurd operational fantasy.'
        },
        points: 20
      },
      {
        id: 'q_mkt_5',
        challengeId: 'dc_marketplace_liquidity',
        orderIndex: 5,
        skillCategory: 'Execution',
        difficulty: 'intermediate',
        scenario: 'A competitor launches in your primary city with zero commission fees for 6 months, heavily backed by venture capital subsidy. Several top merchants announce they are leaving your platform.',
        questionText: 'What is the most disciplined counter-strategy?',
        options: [
          { id: 'A', text: 'Immediately match zero commission and deplete your startup cash reserves within 60 days.' },
          { id: 'B', text: 'Focus on demand-side lock-in (exclusive customer loyalty points, enterprise contracts, integration into corporate perks) while offering top merchants volume-based rebates and premium software tools that competitors lack.' },
          { id: 'C', text: 'Shut down operations and surrender the market without a fight.' },
          { id: 'D', text: 'Post false reviews on the competitor’s App Store page.' }
        ],
        correctOption: 'B',
        explanation: 'Subsidies are temporary; real liquidity and demand are permanent defensibility. Merchants go where the buyers are. Locking in customer demand and delivering operational software retains merchants when predatory pricing burns out.',
        optionExplanations: {
          A: 'Competing in a price-slashing war against a far better-funded competitor leads to bankruptcy.',
          B: 'Correct. Leverages superior buyer volume, software utility, and volume rebates to retain merchant allegiance.',
          C: 'Defeatist approach that abandons established market share.',
          D: 'Unethical and illegal tactic that risks platform de-listing.'
        },
        points: 20
      }
    ]
  }
];

/**
 * Returns the canonical challenge for a given calendar date (YYYY-MM-DD).
 * Deterministically rotates through curated challenges or retrieves matching date.
 */
export function getCanonicalDailyChallenge(dateStr: string): DailyChallenge {
  const exactMatch = CURATED_DAILY_CHALLENGES.find(
    (c) => c.challengeDate === dateStr && c.publicationStatus === 'published'
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Deterministic daily hash rotation across question bank
  const dateNum = dateStr.split('-').reduce((acc, part) => acc * 31 + parseInt(part, 10), 0);
  const challengeIndex = Math.abs(dateNum) % CURATED_DAILY_CHALLENGES.length;
  const template = CURATED_DAILY_CHALLENGES[challengeIndex];

  return {
    ...template,
    id: `dc_${dateStr.replace(/-/g, '')}`,
    challengeDate: dateStr,
    questions: template.questions.map((q, idx) => ({
      ...q,
      challengeId: `dc_${dateStr.replace(/-/g, '')}`,
      id: `dq_${dateStr.replace(/-/g, '')}_${idx + 1}`,
    })),
  };
}

/**
 * Strips sensitive answer keys from challenges for client delivery
 */
export function stripAnswersFromChallenge(
  challenge: DailyChallenge,
  secondsUntilReset = 86400
): PublicDailyChallenge {
  const publicQuestions: PublicChallengeQuestion[] = challenge.questions.map((q) => ({
    id: q.id,
    challengeId: q.challengeId,
    orderIndex: q.orderIndex,
    scenario: q.scenario,
    questionText: q.questionText,
    skillCategory: q.skillCategory,
    difficulty: q.difficulty,
    options: q.options,
    points: q.points,
  }));

  return {
    id: challenge.id,
    challengeDate: challenge.challengeDate,
    title: challenge.title,
    theme: challenge.theme,
    description: challenge.description,
    difficulty: challenge.difficulty,
    timezone: challenge.timezone,
    publicationStatus: challenge.publicationStatus,
    questions: publicQuestions,
    publishedAt: challenge.publishedAt,
    timeRemainingSeconds: secondsUntilReset,
  };
}

/**
 * Standard 3 Weekly Quests
 */
export function getActiveWeeklyQuests(now = new Date()): WeeklyQuest[] {
  // Determine start of current week (Monday 00:00 UTC) and end (Sunday 23:59:59 UTC)
  const d = new Date(now);
  const day = d.getUTCDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMon);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  const weekYear = `${monday.getUTCFullYear()}-W${Math.ceil((monday.getUTCDate() + 6) / 7)}`;

  return [
    {
      id: `quest_daily_3_${weekYear}`,
      title: 'Daily Habit Builder',
      description: 'Complete the PMVerse Daily 5 on 3 distinct days this week.',
      questType: 'daily_count',
      targetCount: 3,
      xpReward: 50,
      startsAt: monday.toISOString(),
      endsAt: sunday.toISOString(),
      active: true,
    },
    {
      id: `quest_accuracy_80_${weekYear}`,
      title: 'Precision Thinking',
      description: 'Score 80% or higher (at least 4/5 correct) on any Daily 5 challenge.',
      questType: 'score_threshold',
      targetCount: 1,
      xpReward: 50,
      startsAt: monday.toISOString(),
      endsAt: sunday.toISOString(),
      active: true,
    },
    {
      id: `quest_deep_dive_${weekYear}`,
      title: 'Strategic Teardown',
      description: 'Submit an eligible solution for this week\'s Case Study Competition.',
      questType: 'case_study',
      targetCount: 1,
      xpReward: 75,
      startsAt: monday.toISOString(),
      endsAt: sunday.toISOString(),
      active: true,
    },
  ];
}
