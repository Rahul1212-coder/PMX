'use client';

import React, { useState } from 'react';
import { TrendingUp, UserPlus, Check, Info, Compass, ExternalLink, ArrowRight } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface RightSidebarProps {
  activeTab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment';
  setActiveTab: (tab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment') => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ activeTab, setActiveTab }) => {
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const trendingNews = [
    {
      title: 'Linear Method vs Agile Scrum',
      time: '1h ago',
      readers: '1,420 PMs discussing',
    },
    {
      title: 'AI PRDs replacing 30-page specs',
      time: '3h ago',
      readers: '3,890 PMs discussing',
    },
    {
      title: '2026 PM Compensation Survey released',
      time: '5h ago',
      readers: '950 readers',
    },
    {
      title: 'Outcome bets in Enterprise B2B SaaS',
      time: '1d ago',
      readers: '2,100 readers',
    },
    {
      title: 'How Notion evaluates LLM latency',
      time: '1d ago',
      readers: '1,780 readers',
    },
  ];

  const suggestedPms = [
    {
      id: 'p-1',
      name: 'Maya Lin',
      role: 'Director of Product @ Figma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'p-2',
      name: 'David Kim',
      role: 'Principal PM @ Stripe',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'p-3',
      name: 'Claire Dupont',
      role: 'Associate PM @ Monzo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    },
  ];

  const toggleConnect = (id: string) => {
    setConnectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <aside className="w-full space-y-2">
      {/* PM News Card (LinkedIn News style) */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-3.5 text-left">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <h2 className="text-sm font-bold text-slate-800">PM Trending News</h2>
            <TrendingUp className="w-4 h-4 text-[#0a66c2]" />
          </div>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="space-y-3 pt-1">
          {trendingNews.map((news, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTab('community')}
              className="cursor-pointer group"
            >
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 group-hover:bg-[#0a66c2] flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#0a66c2] line-clamp-1 transition">
                    {news.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {news.time} • {news.readers}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested PM Connections Widget */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-3.5 text-left">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-800">PMs to Connect With</h2>
          <button
            onClick={() => setActiveTab('connect')}
            className="text-[11px] font-semibold text-[#0a66c2] hover:underline"
          >
            See all
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {suggestSuggested(suggestedPms, connectedIds, toggleConnect)}
        </div>
      </div>

      {/* PM Career Diagnostic Promo (Ad Card style) */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-lg border border-slate-700/50 shadow-sm p-4 text-left relative overflow-hidden">
        <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold mb-1">
          <Compass className="w-3.5 h-3.5" />
          <span>PM Career Diagnostic</span>
        </div>
        <h3 className="text-xs font-bold text-white leading-snug">
          Is Product Management the Right Fit for You?
        </h3>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
          Take the 5-factor situational assessment to benchmark your strategic instincts and add a verified badge to your profile.
        </p>
        <button
          onClick={() => setActiveTab('assessment')}
          className="mt-3 w-full py-1.5 px-3 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold rounded-full flex items-center justify-center space-x-1 transition shadow"
        >
          <span>Take 5-Min Diagnostic</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* LinkedIn Style Micro Footer */}
      <div className="text-[11px] text-slate-500 text-center py-2 px-1 space-y-1">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
          <button onClick={() => setActiveTab('community')} className="hover:text-purple-700 hover:underline">About</button>
          <span>•</span>
          <button onClick={() => setActiveTab('connect')} className="hover:text-purple-700 hover:underline">Network</button>
          <span>•</span>
          <button onClick={() => setActiveTab('jobs')} className="hover:text-purple-700 hover:underline">Jobs</button>
          <span>•</span>
          <button onClick={() => setActiveTab('ai-tutor')} className="hover:text-purple-700 hover:underline">Learning</button>
          <span>•</span>
          <span className="hover:text-purple-700">Privacy & Terms</span>
        </div>
        <p className="text-[10px] text-slate-400 pt-1">
          PMVerse Platform © 2026 • Product Management Network
        </p>
      </div>
    </aside>
  );
};

function suggestSuggested(
  suggestedPms: Array<{ id: string; name: string; role: string; avatar: string }>,
  connectedIds: string[],
  toggleConnect: (id: string) => void
) {
  return suggestedPms.map((pm) => {
    const isConn = connectedIds.includes(pm.id);
    return (
      <div key={pm.id} className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <UserAvatar
            src={pm.avatar}
            name={pm.name}
            size="md"
            className="flex-shrink-0 border border-slate-200"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{pm.name}</h4>
            <p className="text-[11px] text-slate-500 truncate">{pm.role}</p>
          </div>
        </div>

        <button
          onClick={() => toggleConnect(pm.id)}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center space-x-1 transition ${
            isConn
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'text-purple-700 border-purple-200 hover:bg-purple-50'
          }`}
        >
          {isConn ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Pending</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" />
              <span>Connect</span>
            </>
          )}
        </button>
      </div>
    );
  });
}
