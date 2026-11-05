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
    id: 'habit_builder',
    name: '14-Day Habit Builder',
    description: 'Maintain a 14-day daily PM challenge streak.',
    icon: '🌟',
    category: 'streak',
    xpReward: 150,
    rarity: 'Rare',
    unlockCriteria: { streakMilestone: 14 },
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
    unlockCriteria: { streakMilestone: 30 },
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
    id: 'arena_contender',
    name: 'Arena Contender',
    description: 'Score at least 100 points in weekly PMVerse Arena competition.',
    icon: '⚔️',
    category: 'arena',
    xpReward: 50,
    rarity: 'Common',
    unlockCriteria: { minWeeklyArenaScore: 100 },
    active: true,
  },
  {
    id: 'arena_titan',
    name: 'Arena Titan',
    description: 'Accumulate 300+ Arena points across daily challenges.',
    icon: '🛡️',
    category: 'arena',
    xpReward: 150,
    rarity: 'Epic',
    unlockCriteria: { minWeeklyArenaScore: 300 },
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
  {
    id: 'sprint_centurion',
    name: 'Sprint Centurion',
    description: 'Complete 5 Daily 5 challenges in a single calendar week.',
    icon: '🎖️',
    category: 'challenge',
    xpReward: 100,
    rarity: 'Rare',
    unlockCriteria: { weeklyChallengesCompleted: 5 },
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
          { id: 'A', text: 'Implement an interactive guided walkthrough that obligates new users to click through every canvas tool before creating their first project.' },
          { id: 'B', text: 'Instrument step-by-step drop-off tracking and test a template-first bypass that deposits users straight into an editable sample project.' },
          { id: 'C', text: 'Deploy automated email sequences offering scheduled onboarding consultations with customer success managers for all newly registered accounts.' },
          { id: 'D', text: 'Remove workspace configuration entirely and auto-generate default team settings based on common domain suffixes detected during signup.' }
        ],
        correctOption: 'B',
        explanation: 'Users drop off during the multi-step configuration before experiencing the core product value. Measuring funnel leakage at each step and testing a template-first bypass accelerates Time-to-First-Value (TTFV) and connects users directly to the known retention driver (board creation).',
        optionExplanations: {
          A: 'Forced linear feature walkthroughs introduce cognitive fatigue and increase drop-off without solving workspace setup friction.',
          B: 'Diagnoses the precise drop-off step and accelerates time-to-first-value by bypassing upfront blank canvas workspace configuration.',
          C: 'High-touch customer success calls cannot scale to 80,000 monthly signups and mask underlying self-serve onboarding friction.',
          D: 'Auto-configuring workspaces by email domain causes permission errors and data leakage between uncoordinated enterprise employees.'
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
          { id: 'A', text: 'Ship the template variant immediately across all cohorts to lock in the statistically significant Day-1 board activation improvements.' },
          { id: 'B', text: 'Increase paid performance marketing spend to bring in more top-of-funnel users and overcome the non-significant Day-7 engagement dip.' },
          { id: 'C', text: 'Terminate the experiment immediately and revert to the blank canvas baseline to eliminate any risk of negative downstream retention.' },
          { id: 'D', text: 'Hold the rollout and track cohort retention for two additional weeks to determine if low-effort templates produce hollow activations.' }
        ],
        correctOption: 'D',
        explanation: 'A quick activation lift accompanied by a negative downstream retention trend frequently signals shallow activation—users clicked a template easily but failed to establish an ongoing workflow habit. Mature PMs protect downstream retention guardrails before shipping top-of-funnel wins.',
        optionExplanations: {
          A: 'Celebrating early Day-1 activation while ignoring a negative downstream retention trend creates shallow habituation that hurts long-term LTV.',
          B: 'Pouring paid acquisition spend into an onboarding funnel with unconfirmed retention leaks wastes marketing budget on churning cohorts.',
          C: 'Prematurely terminating the test with an underpowered p=0.18 signal discards valuable behavioral learnings without identifying root causes.',
          D: 'Verifies whether low-friction template creation translates into authentic ongoing habit formation before committing to full rollout.'
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
          { id: 'A', text: 'Build local offline document caching with background sync so traveling executives can edit documents without active internet access.' },
          { id: 'B', text: 'Ship real-time cursor presence and live avatars to maximize visual collaboration appeal during enterprise executive sales demos.' },
          { id: 'C', text: 'Implement native Slack notifications with actionable deep links to re-engage teammates and unblock asynchronous feedback cycles.' },
          { id: 'D', text: 'Allocate engineering capacity equally across all three initiatives to ensure balanced incremental progress on every requested feature.' }
        ],
        correctOption: 'C',
        explanation: 'Slack notifications directly unblock the primary qualitative friction point ("teammates waiting for feedback"), close the collaboration loop with high reach, and achieve superior RICE efficiency relative to the high engineering complexity of presence or offline caching.',
        optionExplanations: {
          A: 'Offline editing solves an edge persona requirement with high implementation complexity, failing to address core team drop-off.',
          B: 'Real-time cursors look compelling in product demos but fail to notify or bring back teammates who are working in separate applications.',
          C: 'Directly solves the primary 70% qualitative bottleneck by meeting users where they communicate, yielding highest RICE efficiency.',
          D: 'Dividing sprint capacity across competing complex features fragments focus, increases context switching, and delays time-to-market.'
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
          { id: 'A', text: 'Transition to a Creator and Viewer model offering unlimited free view-only seats while increasing active creator licenses to $25 monthly.' },
          { id: 'B', text: 'Enforce a strict minimum account threshold of 10 paid seats to eliminate small deals and maximize initial contract value commitments.' },
          { id: 'C', text: 'Discount all sixteen seats uniformly by 50% to incentivize annual enterprise contracts while preserving the per-seat billing structure.' },
          { id: 'D', text: 'Switch entirely to unmetered usage billing based on API requests, abandoning seat-based subscription tiers across all market segments.' }
        ],
        correctOption: 'A',
        explanation: 'The Creator vs Viewer model (pioneered by Figma, Miro, and Notion) removes viral adoption friction by allowing passive stakeholders to read freely, while monetizing core content creators at a higher price point. This unblocks enterprise expansion without cannibalizing ACV.',
        optionExplanations: {
          A: 'Removes viral adoption friction by allowing passive stakeholders to read freely, while monetizing core content creators at a higher price.',
          B: 'Mandating minimum seat thresholds kills bottom-up product-led growth and drives prospective enterprise champions to un-gated competitors.',
          C: 'Across-the-board discounting lowers average revenue per account without resolving the core customer objection of paying for passive viewers.',
          D: 'Pure usage/API pricing introduces extreme revenue unpredictability for collaboration tools and confuses enterprise procurement planning.'
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
          { id: 'A', text: 'Delay the security patch until the following sprint to ensure the sales team closes the $100k contract before quarterly quota deadlines.' },
          { id: 'B', text: 'Prioritize the security patch as non-negotiable hygiene while providing sales with a manual data export and a roadmap delivery commitment.' },
          { id: 'C', text: 'Reassign infrastructure engineers to build the export feature while junior frontend developers apply the security library updates solo.' },
          { id: 'D', text: 'Reject the sales request entirely and mandate that commercial teams handle client communication without product team coordination.' }
        ],
        correctOption: 'B',
        explanation: 'Platform security and customer data protection are foundational non-negotiables. Compromising them invites existential compliance and reputation risk. A seasoned PM protects platform integrity while creatively unblocking commercial teams through an operational bridge.',
        optionExplanations: {
          A: 'Compromising core platform security for a single contract risks catastrophic data breaches, SOC-2 non-compliance, and severe legal liability.',
          B: 'Maintains platform integrity as non-negotiable while creatively satisfying the prospective client immediate business need via an operational bridge.',
          C: 'Splitting engineering focus on critical security vulnerabilities risks botching the patch while rushing an unstable export into production.',
          D: 'Hostile stonewalling of revenue teams destroys cross-functional alignment and fails to explore pragmatic short-term bridge solutions.'
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
          { id: 'A', text: 'Replace camera capture with manual document transcription forms to bypass device hardware limitations and camera access permissions.' },
          { id: 'B', text: 'Contract an offshore manual review agency to visually inspect rejected blurry photos within forty-eight hours of user submission attempts.' },
          { id: 'C', text: 'Embed on-device computer vision to provide real-time frame guidance and automated capture once glare and edge alignment thresholds pass.' },
          { id: 'D', text: 'Defer document upload until after the user completes their first external debit card deposit of at least twenty-five dollars in funds.' }
        ],
        correctOption: 'C',
        explanation: 'The primary friction is mechanical failure during capture coupled with uninformative errors. Real-time edge computer-vision feedback and automatic capture directly resolve the capture failure without increasing fraud exposure or regulatory non-compliance.',
        optionExplanations: {
          A: 'Manual forms introduce extreme typing friction, increase submission errors, and fail anti-money laundering proof-of-possession regulations.',
          B: 'A 48-hour manual review backlog destroys conversion momentum; users abandon the application and open accounts with instant competitors.',
          C: 'Solves the physical capture defect at the source with instant edge guidance, eliminating user frustration while maintaining KYC compliance.',
          D: 'Accepting deposits before verifying identity breaches financial regulations in most jurisdictions and exposes the platform to chargeback fraud.'
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
          { id: 'A', text: 'Quantify Net Financial Impact by weighing lost legitimate customer lifetime value against fraud losses, routing borderline scores to review.' },
          { id: 'B', text: 'Maintain the strict heuristic rules indefinitely because regulatory compliance and zero fraud tolerance override user growth priorities.' },
          { id: 'C', text: 'Roll back fraud rules completely to restore 65% onboarding conversion and absorb resulting chargeback liabilities through marketing funds.' },
          { id: 'D', text: 'Require all flagged accounts to provide three personal character references and physical notarized bank statements via registered post.' }
        ],
        correctOption: 'A',
        explanation: 'Treating risk management as zero-sum destroys business viability. A mature PM evaluates Net Financial Impact (LTV of lost legitimate users versus fraud losses avoided) and introduces tiered risk thresholds (auto-pass, rapid review, auto-block) to optimize conversion.',
        optionExplanations: {
          A: 'Quantifies the business trade-off in financial terms and implements tiered risk routing to recover legitimate users while blocking true fraud.',
          B: 'Eliminating all risk also eliminates commercial growth; a 32% false positive rate destroys valuable customer acquisition investments.',
          C: 'Completely disabling fraud defenses leaves the platform vulnerable to automated card testing syndicates and organized financial crime.',
          D: 'Requiring notarized postal verification creates extreme friction that drives good users away while fraudsters easily move to other targets.'
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
          { id: 'A', text: 'Offer an instant fifty-dollar registration bounty to incentivize users to complete sensitive national ID input on the initial screen.' },
          { id: 'B', text: 'Mask the legal requirement by labeling the national identity input field as an optional identity security check during the onboarding flow.' },
          { id: 'C', text: 'Require users to authenticate via their primary social media profile to substitute for government tax identification verification checks.' },
          { id: 'D', text: 'Adopt progressive profiling by letting users explore yields and model portfolio goals first, requesting verification only upon account opening.' }
        ],
        correctOption: 'D',
        explanation: 'Progressive profiling establishes perceived value and brand credibility before asking for highly sensitive personal data. Once users have invested effort in tailoring their financial goals, their commitment to complete regulatory verification is substantially higher.',
        optionExplanations: {
          A: 'Cash bonuses attract mercenary incentive-farmers and fraudulent identity rings without establishing genuine user trust in the financial product.',
          B: 'Deceptively labeling mandatory compliance fields destroys customer trust and triggers regulatory penalties for misleading consumer disclosures.',
          C: 'Third-party social authentication does not fulfill legal AML/KYC obligations for government tax identification and customer due diligence.',
          D: 'Builds reciprocal value and trust first; users are far more willing to complete sensitive identity checks once they have invested in configuring goals.'
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
          { id: 'A', text: 'Postpone all core banking infrastructure refactoring indefinitely to deliver the cryptocurrency wallet ahead of investor deadline milestones.' },
          { id: 'B', text: 'Frame engineering debt around deployment cycle times and incidents, sequencing refactoring in two-week milestones alongside feature delivery.' },
          { id: 'C', text: 'Halt all commercial feature development for two full quarters to rewrite the entire legacy monolith architecture from the ground up.' },
          { id: 'D', text: 'Outsource the cryptocurrency wallet entirely to an unvetted offshore development vendor to avoid using internal engineering resources.' }
        ],
        correctOption: 'B',
        explanation: 'Technical debt must be translated into business outcomes (deployment frequency, defect rates, system outages). Phasing architectural refactoring into incremental 2-week milestones preserves delivery predictability while managing investor expectations.',
        optionExplanations: {
          A: 'Ignoring compounding architectural debt in core banking systems leads to critical transaction outages, ledger inconsistencies, and audit fines.',
          B: 'Translates technical debt into tangible business risks (release frequency, outages) and balances stability with ongoing commercial delivery.',
          C: 'A multi-quarter total feature freeze disengages customers, frustrates business stakeholders, and rarely succeeds due to shifting technical scope.',
          D: 'Outsourcing complex financial and crypto components to unvetted external vendors creates massive security vulnerabilities and compliance risks.'
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
          { id: 'A', text: 'Display a transparent status notice, queue applicant verification payloads in a secured holding state, and auto-retry via secondary fallback.' },
          { id: 'B', text: 'Disable the user registration endpoint entirely and display an uninformative generic maintenance banner until vendor operations recover.' },
          { id: 'C', text: 'Temporarily bypass identity verification checks for incoming signups and allow unverified accounts to initiate unrestricted fund transfers.' },
          { id: 'D', text: 'Issue a public statement redirecting all arriving users to competitor financial applications while internal engineers monitor the vendor.' }
        ],
        correctOption: 'A',
        explanation: 'A resilient onboarding architecture handles vendor degradation gracefully through clear user communication, secure asynchronous queuing, and automated retries rather than throwing raw server errors or halting customer acquisition.',
        optionExplanations: {
          A: 'Maintains a transparent user experience, securely captures onboarding intent, and automates recovery without losing prospective customers.',
          B: 'Hard error pages create user confusion, burn paid marketing acquisition spend, and abandon users with zero expectations of service recovery.',
          C: 'Disabling verification controls during third-party downtime breaches banking compliance rules and invites immediate exploitation by bad actors.',
          D: 'Publicly directing prospective customers to competitor platforms permanently surrenders market share and inflicts severe brand reputational damage.'
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
          { id: 'A', text: 'Institute penalty deactivation strikes against any service providers who log offline before completing eight hours of daily shift coverage.' },
          { id: 'B', text: 'Subsidize customer job fees entirely out of venture reserves during afternoon periods to stimulate higher demand volume in suburban zones.' },
          { id: 'C', text: 'Cap customer booking requests at twenty percent of normal volume after three in the afternoon to eliminate visible unfulfilled metrics.' },
          { id: 'D', text: 'Deploy dynamic peak incentive guarantees and route clustering that bundle nearby afternoon jobs to maximize hourly provider earnings.' }
        ],
        correctOption: 'D',
        explanation: 'Marketplace liquidity is fundamentally economic. Dynamic earnings guarantees and route clustering increase provider earnings density per hour, encouraging afternoon availability without passing punishing surge premiums to consumers.',
        optionExplanations: {
          A: 'Mandating rigid shift minimums violates independent contractor autonomy, invites legal reclassification challenges, and drives workers to rivals.',
          B: 'Subsidizing consumer demand when supply is already severely constrained worsens unfulfilled booking rates and increases customer dissatisfaction.',
          C: 'Artificially throttling customer demand masks supply shortages rather than solving provider utilization and sacrifices platform gross merchandise value.',
          D: 'Aligns provider economics: guaranteed hourly earnings floors and geographic job clustering make afternoon shifts predictably lucrative.'
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
          { id: 'A', text: 'Cumulative app install totals and social media impression counts across paid acquisition campaigns targeted at prospective contractors.' },
          { id: 'B', text: 'Active supply utilization: the share of providers completing at least three weekly jobs within target response times and quality bands.' },
          { id: 'C', text: 'Total profile update submissions and background check processing duration logged in the administrative merchant onboarding portal.' },
          { id: 'D', text: 'Aggregate customer service chat ticket volume categorized by billing inquiries rather than localized fulfillment response speeds.' }
        ],
        correctOption: 'B',
        explanation: 'Registered accounts is a classic vanity metric. Marketplace health requires active, reliable, geographically matched supply utilization with acceptable quality control rather than dormant registrations.',
        optionExplanations: {
          A: 'App downloads and impressions are top-of-funnel marketing metrics that provide zero insight into marketplace liquidity or fulfillment quality.',
          B: 'Measures true marketplace health: reliable, actively engaged supply that fulfills customer demand within established operational quality benchmarks.',
          C: 'Onboarding administrative throughput is an internal operational metric that does not reflect actual in-market provider availability or service delivery.',
          D: 'Support ticket volume is a lagging symptom of operational distress rather than a primary health indicator for two-sided market balancing.'
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
          { id: 'A', text: 'Embed proprietary workflow value including automated invoicing, instant payouts, liability coverage, and milestone dispute protection.' },
          { id: 'B', text: 'Block all direct phone and chat messaging between buyers and providers, restricting communication to pre-approved automated SMS templates.' },
          { id: 'C', text: 'Increase the platform commission rate from fifteen to twenty-five percent to extract higher revenue from non-disintermediated transactions.' },
          { id: 'D', text: 'Require buyers to place an upfront non-refundable security deposit of five hundred dollars into platform escrow prior to any initial booking.' }
        ],
        correctOption: 'A',
        explanation: 'Users transact off-platform when the take rate exceeds perceived value. Providing indispensable workflow utility (factoring, insurance, dispute escrow, portable reputation) makes staying on-platform significantly more valuable than the fee avoided.',
        optionExplanations: {
          A: 'Increases platform retention surplus: delivering business tools, insurance, and payment guarantees makes staying on-platform far more valuable than the fee.',
          B: 'Crippling in-app communication damages customer experience, causes job specification errors, and motivates users to exchange off-platform contact info.',
          C: 'Raising take rates increases the financial incentive for both buyers and providers to bypass the platform on repeat transactions.',
          D: 'Mandating steep upfront non-refundable deposits creates severe friction that destroys customer conversion before the first transaction occurs.'
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
          { id: 'A', text: 'Standardize exclusively on algorithm B because customer NPS is the primary guiding north star metric for the marketplace product team.' },
          { id: 'B', text: 'Discard algorithm B completely and revert to pure distance matching, ignoring customer feedback and service quality discrepancies.' },
          { id: 'C', text: 'Formulate a multi-objective composite score weighing distance, ratings, and current workload, setting dynamic radius limits during traffic.' },
          { id: 'D', text: 'Match providers purely based on historical seniority on the platform, prioritizing longest-tenured contractors for all customer bookings.' }
        ],
        correctOption: 'C',
        explanation: 'Two-sided marketplaces fail if either side is exploited. A composite matchmaking algorithm dynamically balances customer expectations with provider economic sustainability, preventing supply churn.',
        optionExplanations: {
          A: 'Optimizing purely for customer satisfaction while ignoring provider burnout causes high supply churn, eventually degrading service availability.',
          B: 'Reverting to pure proximity matching sacrifices customer satisfaction and assigns low-quality providers when superior options are nearby.',
          C: 'Dynamically balances customer quality expectations with provider travel economics through multi-objective optimization and geographic constraints.',
          D: 'Prioritizing platform tenure creates unfair monopolies for early participants and starves newer, high-performing providers of job opportunities.'
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
          { id: 'A', text: 'Match zero percent commission rates across all merchant tiers immediately and exhaust operational cash reserves within ninety days.' },
          { id: 'B', text: 'Litigate against departing merchants for breach of exclusivity and petition municipal regulatory boards to prohibit fee discounting.' },
          { id: 'C', text: 'Pivot the marketplace into a direct service provider by acquiring company vehicles and transitioning all independent pros onto payroll.' },
          { id: 'D', text: 'Reinforce buyer-side demand density through corporate partnerships while offering tiered volume rebates and merchant workflow tools.' }
        ],
        correctOption: 'D',
        explanation: 'Merchants follow liquid consumer demand. Defending buyer density while offering volume incentives and workflow software creates structural lock-in that outlasts competitor capital subsidies.',
        optionExplanations: {
          A: 'Entering an un-subsidized price war against a heavily funded competitor drains startup capital without establishing lasting competitive defensibility.',
          B: 'Legal action against platform merchants creates public relations backlash, destroys seller goodwill, and signals organizational panic.',
          C: 'Transitioning to an asset-heavy employer model introduces massive fixed payroll costs and liabilities, destroying two-sided marketplace scalability.',
          D: 'Merchants operate where paying customers congregate; locking in high-value buyer demand and providing operational software defends market share.'
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
