'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { NavTabType } from './Navbar';

interface HomeDashboardProps {
  setActiveTab: (tab: NavTabType) => void;
  onOpenTopic?: (topicId: string) => void;
  onOpenCase?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setActiveTab,
  onOpenTopic,
  onOpenCase,
}) => {
  const { user, profile } = useAuth();

  const displayName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user
    ? 'Product Manager'
    : 'Product Leader';
  const targetRole = profile?.role || 'Senior Product Manager';
  const fitScore = profile?.pmFitScore || 82;

  const skills = [
    { name: 'Product Sense', v: 86, color: 'var(--color-text)' },
    { name: 'Analytics', v: 78, color: 'var(--color-accent)' },
    { name: 'Strategy', v: 81, color: 'var(--color-text)' },
    { name: 'Execution', v: 74, color: 'var(--color-accent)' },
    { name: 'Communication', v: 88, color: 'var(--color-text)' },
    { name: 'Customer Empathy', v: 84, color: 'var(--color-text)' },
  ];

  const appStages = [
    { name: 'Saved', n: 1 },
    { name: 'Applied', n: 2 },
    { name: 'Screening', n: 1 },
    { name: 'Interview', n: 1 },
    { name: 'Final Round', n: 1 },
    { name: 'Offer', n: 1 },
  ];
  const totalApps = appStages.reduce((acc, curr) => acc + curr.n, 0);

  const communityDiscussions = [
    {
      title: 'How would you improve onboarding for a peer-to-peer payments app?',
      author: 'Daniel Okafor',
      comments: 24,
      votes: 42,
    },
    {
      title: 'Our activation metric was misleading us. A case study in redefining it.',
      author: 'Priya Raman',
      comments: 31,
      votes: 118,
    },
    {
      title: 'Which prioritization framework does your team actually use?',
      author: 'Sara Lind',
      comments: 19,
      votes: 87,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Welcome Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#ae1800] font-bold mb-2">
            Your PM Journey
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight m-0 text-[#201e1d]">
            Good morning, {displayName}.
          </h1>
        </div>
        <div className="text-sm text-[#605d5d] max-w-sm">
          Target role: <strong className="text-[#201e1d] font-bold">{targetRole}</strong>. You are
          84% aligned. Analytics is the gap to close next.
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-[rgba(32,30,29,0.15)] border-2 border-[rgba(32,30,29,0.15)]">
        {/* Cell 1: PM Fit Score */}
        <div className="bg-[#f3f2f2] p-6 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold mb-2">
              PM Fit Score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl sm:text-8xl font-black leading-none tracking-tighter text-[#201e1d]">
                {fitScore}
              </span>
              <span className="text-xl font-bold text-[#7d7979]">/ 100</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="tag tag-accent font-bold">Strong PM fit</span>
              <span className="text-xs text-[#605d5d]">↑ 6 points this month</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('assess')}
            className="btn btn-secondary w-full justify-between mt-4 text-xs font-bold"
          >
            <span>View full diagnostic</span>
            <span>→</span>
          </button>
        </div>

        {/* Cell 2: Skill Breakdown */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold mb-4">
            Skill Breakdown
          </div>
          <div className="flex flex-col gap-3">
            {skills.map((sk) => (
              <div key={sk.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{sk.name}</span>
                  <span className="font-extrabold">{sk.v}</span>
                </div>
                <div className="h-1.5 bg-[#d7d3d3]">
                  <div
                    className="h-full"
                    style={{ width: `${sk.v}%`, backgroundColor: sk.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cell 3: Recommended For You */}
        <div className="bg-[#f3f2f2] p-6 flex flex-col">
          <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold mb-2">
            Recommended For You
          </div>
          <div className="divide-y divide-[rgba(32,30,29,0.15)]">
            <div
              onClick={() => {
                if (onOpenTopic) onOpenTopic('activation');
                setActiveTab('learn');
              }}
              className="py-3 flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div>
                <div className="text-[11px] tracking-wider uppercase text-[#ae1800] font-bold">
                  Learn
                </div>
                <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                  Improve Product Analytics
                </div>
                <div className="text-xs text-[#605d5d]">Your largest gap. 4 short lessons.</div>
              </div>
              <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform">→</span>
            </div>

            <div
              onClick={() => setActiveTab('jobs')}
              className="py-3 flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div>
                <div className="text-[11px] tracking-wider uppercase text-[#ae1800] font-bold">
                  Jobs
                </div>
                <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                  3 PM jobs match your profile
                </div>
                <div className="text-xs text-[#605d5d]">Above 85% match, posted this week.</div>
              </div>
              <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform">→</span>
            </div>

            <div
              onClick={() => {
                if (onOpenCase) onOpenCase();
                setActiveTab('mentor');
              }}
              className="py-3 flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div>
                <div className="text-[11px] tracking-wider uppercase text-[#ae1800] font-bold">
                  Practice
                </div>
                <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                  Practice a Product Sense case
                </div>
                <div className="text-xs text-[#605d5d]">A 15-minute case with AI feedback.</div>
              </div>
              <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Cell 4: Applications Tracker */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold">
              Applications
            </div>
            <button
              onClick={() => setActiveTab('tracker')}
              className="btn btn-ghost text-xs font-bold"
            >
              Open tracker →
            </button>
          </div>
          <div className="text-5xl font-black tracking-tight mb-4 text-[#201e1d]">
            {totalApps}
          </div>
          <div className="divide-y divide-[rgba(32,30,29,0.15)] text-xs">
            {appStages.map((stg) => (
              <div key={stg.name} className="flex justify-between py-1.5">
                <span className="text-slate-600">{stg.name}</span>
                <span className="font-bold text-[#201e1d]">{stg.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cell 5: Community Discussions */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold">
              Community
            </div>
            <button
              onClick={() => setActiveTab('community')}
              className="btn btn-ghost text-xs font-bold"
            >
              See all →
            </button>
          </div>
          <div className="divide-y divide-[rgba(32,30,29,0.15)]">
            {communityDiscussions.map((d, i) => (
              <div
                key={i}
                onClick={() => setActiveTab('community')}
                className="py-2.5 cursor-pointer hover:text-[#ae1800] transition-colors"
              >
                <div className="font-bold text-xs sm:text-sm leading-snug line-clamp-2">
                  {d.title}
                </div>
                <div className="text-[11px] text-[#605d5d] mt-1">
                  {d.author} · {d.comments} comments · ▲ {d.votes}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cell 6: Weekly Challenge Box */}
        <div className="bg-[#ec3013] text-[#f3f2f2] p-6 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold opacity-90 mb-1">
              Weekly Challenge #23 · 3 Days Left
            </div>
            <h3 className="text-2xl font-black leading-tight tracking-tight mt-2 text-[#f3f2f2]">
              Improve onboarding for a music streaming app.
            </h3>
            <p className="text-xs opacity-90 mt-2">
              412 submissions. Reviewed by the community and the AI Mentor.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('community')}
            className="btn w-full justify-between mt-4 bg-[#f3f2f2] text-[#201e1d] hover:bg-[#eae9e9] text-xs font-bold"
          >
            <span>Submit your answer</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
