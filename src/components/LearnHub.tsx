'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface LearnHubProps {
  initialTerm?: string;
  onAskMentor?: (termName: string) => void;
}

export const LearnHub: React.FC<LearnHubProps> = ({
  initialTerm = 'pmf',
  onAskMentor,
}) => {
  const [selectedTermKey, setSelectedTermKey] = useState<string>(initialTerm);
  const [query, setQuery] = useState('');

  const TERMS_DATA: Record<
    string,
    {
      name: string;
      group: string;
      def: string;
      simple: string;
      pm: string;
      real: string;
      use: string;
      not: string;
      iq: string;
      related: string[];
    }
  > = {
    pmf: {
      name: 'Product-Market Fit',
      group: 'Product Fundamentals',
      def: 'The point where a product satisfies a strong market demand, so customers keep using it, pay for it, and recommend it without heavy pushing.',
      simple: 'People would be genuinely disappointed if your product disappeared tomorrow.',
      pm: 'A team sees 45% of new users still active after eight weeks and referrals rising each month, without any paid acquisition spend.',
      real: 'Early file-sharing tools reached fit when teams started inviting colleagues unprompted, turning single users into whole company accounts.',
      use: 'Before scaling paid acquisition, hiring a massive outbound sales team, or expanding into foreign segments.',
      not: 'As a one-time static milestone. Fit can be lost as market expectations and competitors evolve.',
      iq: 'How would you know if a new zero-to-one product has reached product-market fit?',
      related: ['mvp', 'nsm', 'churn'],
    },
    rice: {
      name: 'RICE',
      group: 'Prioritization',
      def: 'A prioritization framework score: Reach × Impact × Confidence ÷ Effort.',
      simple: 'A systematic way to compare feature ideas by how many people they help, how much, how sure you are, and what engineering costs.',
      pm: 'A feature reaching 4,000 users a quarter with medium impact (1), 80% confidence, and 2 person-months scores: (4000 × 1 × 0.8) / 2 = 1,600.',
      real: 'Growth and platform squads use RICE to rank a backlog of quarterly experiments during sprint roadmapping.',
      use: 'When you have many comparable feature candidates and need a shared, transparent, and explainable ranking criteria.',
      not: 'For major strategic platform bets, regulatory compliance, or architectural re-platforming that arithmetic alone cannot justify.',
      iq: 'Walk me through how you prioritized features on your most recent quarterly roadmap.',
      related: ['nsm', 'mvp'],
    },
    nsm: {
      name: 'North Star Metric',
      group: 'Metrics & Data',
      def: 'The single key metric that best captures the core recurring value a product delivers to its customers.',
      simple: 'One number the whole company agrees means customers are genuinely experiencing value.',
      pm: 'A language-learning app picks: weekly learners who complete three or more lessons (not vanity total app downloads).',
      real: 'Marketplaces track gross completed transactions or nights booked, rather than app opens or registered accounts.',
      use: 'To align product squads, design, and engineering around sustainable, long-term customer value.',
      not: 'As the sole unchecked metric. Always pair it with health input metrics and counter-metric guardrails.',
      iq: 'What North Star Metric would you select for a podcast streaming application?',
      related: ['activation', 'churn', 'pmf'],
    },
    activation: {
      name: 'Activation',
      group: 'Metrics & Data',
      def: 'The pivotal milestone where a new user first experiences the core value promise of the product (the "Aha!" moment).',
      simple: 'The exact moment a casual sign-up turns into an engaged, retained user.',
      pm: 'For a team workspace tool, activation is reached when a new account creates a project and sends 20 messages within the first 7 days.',
      real: 'Social networks famously found that adding 7 friends in 10 days was the single highest predictor of multi-year retention.',
      use: 'To focus onboarding UX and product walkthroughs strictly on the specific user actions that correlate with retention.',
      not: 'When the chosen milestone does not statistically correlate with cohort retention curves.',
      iq: 'How would you define and measure the activation milestone for a personal budgeting application?',
      related: ['churn', 'nsm'],
    },
    churn: {
      name: 'Churn',
      group: 'Metrics & Data',
      def: 'The percentage rate at which customers discontinue using or paying for a product over a given timeframe.',
      simple: 'How fast you are losing existing users or recurring subscription revenue.',
      pm: 'A SaaS product starting with 1,000 customers that loses 30 accounts during the month exhibits a 3% monthly customer churn rate.',
      real: 'Subscription businesses segment voluntary churn (cancellations) from involuntary churn (expired credit cards or payment gateway timeouts).',
      use: 'To diagnose cohort retention health, product-market decay, and the long-term impact of pricing or UI changes.',
      not: 'Without segmenting cohorts by contract tier, acquisition channel, customer lifetime, and account size.',
      iq: 'Customer churn rose 2 percentage points this quarter. How would you structure your investigation?',
      related: ['activation', 'pmf'],
    },
    mvp: {
      name: 'MVP (Minimum Viable Product)',
      group: 'Product Fundamentals',
      def: 'The simplest version of a product that allows a team to collect the maximum amount of validated customer learning with the least effort.',
      simple: 'Build just enough to test your riskiest assumption with real paying users.',
      pm: 'Before building an automated matching algorithm, a product squad manually connects buyers and sellers behind a simple web form.',
      real: 'E-commerce pioneers validated demand by photographing local store shoes and buying them at retail after orders arrived.',
      use: 'When the biggest risk is market demand—whether anyone genuinely wants the solution.',
      not: 'As an excuse to deliver substandard, broken software to paying enterprise customers.',
      iq: 'Design an MVP to test demand for a corporate meal-planning subscription.',
      related: ['pmf', 'rice'],
    },
  };

  const termKeys = Object.keys(TERMS_DATA);
  const qLower = query.toLowerCase();

  // Group terms by category
  const groups: Record<string, string[]> = {};
  termKeys.forEach((key) => {
    const item = TERMS_DATA[key];
    if (qLower && !item.name.toLowerCase().includes(qLower) && !item.group.toLowerCase().includes(qLower)) {
      return;
    }
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(key);
  });

  const activeTerm = TERMS_DATA[selectedTermKey] || TERMS_DATA.pmf;

  const sections = [
    { h: 'Simple Explanation', body: activeTerm.simple },
    { h: 'PM Real Scenario', body: activeTerm.pm },
    { h: 'Industry Example', body: activeTerm.real },
    { h: 'When to Use It', body: activeTerm.use },
    { h: 'When Not to Use It', body: activeTerm.not },
    { h: 'Interview Question', body: activeTerm.iq },
  ];

  return (
    <div className="text-left">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">
        {/* Left Sidebar: Search & Categorized Terms */}
        <aside className="border-t-2 border-[rgba(32,30,29,0.15)] lg:border-t-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight m-0 mb-4 text-[#201e1d]">
            Knowledge Hub
          </h1>

          <div className="flex items-center border border-[rgba(32,30,29,0.2)] bg-[#f3f2f2] px-2.5 mb-4">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts…"
              className="w-full text-xs py-2 bg-transparent outline-none font-medium text-[#201e1d]"
            />
          </div>

          <div className="space-y-4">
            {Object.keys(groups).map((groupName) => (
              <div key={groupName} className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-[#605d5d] font-bold py-1 border-b-2 border-[rgba(32,30,29,0.15)]">
                  {groupName}
                </div>
                <div className="divide-y divide-[rgba(32,30,29,0.1)]">
                  {groups[groupName].map((tKey) => {
                    const item = TERMS_DATA[tKey];
                    const isSelected = selectedTermKey === tKey;

                    return (
                      <div
                        key={tKey}
                        onClick={() => setSelectedTermKey(tKey)}
                        className={`py-2 px-2.5 cursor-pointer text-xs font-bold transition-all border-l-2 ${
                          isSelected
                            ? 'text-[#ae1800] border-[#ec3013] bg-[rgba(236,48,19,0.06)]'
                            : 'text-[#201e1d] border-transparent hover:text-[#ec3013]'
                        }`}
                      >
                        {item.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Article View */}
        <article className="min-w-0 max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-[#ae1800] font-bold">
            {activeTerm.group}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none my-2 text-[#201e1d]">
            {activeTerm.name}
          </h1>
          <p className="text-lg sm:text-xl font-medium leading-relaxed pb-6 border-b-2 border-[rgba(32,30,29,0.15)] text-[#201e1d]">
            {activeTerm.def}
          </p>

          <div className="divide-y divide-[rgba(32,30,29,0.15)]">
            {sections.map((sec, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-2 sm:gap-6 py-4"
              >
                <div className="font-extrabold text-sm text-[#201e1d]">{sec.h}</div>
                <div className="text-sm sm:text-[15px] leading-relaxed text-[#201e1d] whitespace-pre-wrap">
                  {sec.body}
                </div>
              </div>
            ))}
          </div>

          {/* Related Concepts */}
          <div className="mt-8 pt-4 border-t-2 border-[rgba(32,30,29,0.15)]">
            <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-2">
              Related Concepts
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {activeTerm.related.map((relKey) => {
                const rel = TERMS_DATA[relKey];
                if (!rel) return null;
                return (
                  <button
                    key={relKey}
                    onClick={() => setSelectedTermKey(relKey)}
                    className="btn btn-secondary text-xs font-bold"
                  >
                    {rel.name}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (onAskMentor) {
                  onAskMentor(`Explain the concept of ${activeTerm.name} in detail.`);
                }
              }}
              className="btn btn-primary text-xs font-bold px-6 py-3 justify-between w-full sm:w-auto"
            >
              <span>Ask the Mentor about {activeTerm.name}</span>
              <span>→</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
