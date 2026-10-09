'use client';

import React, { useState } from 'react';
import { TrendingUp, UserPlus, Check, Info, Compass, ExternalLink, ArrowRight, ChevronDown } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface RightSidebarProps {
  activeTab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment';
  setActiveTab: (tab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment') => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ activeTab, setActiveTab }) => {
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [showMoreNews, setShowMoreNews] = useState(false);

  const trendingNews = [
    {
      title: 'Linear Method vs Traditional Agile',
      time: '1h ago',
      readers: '1,420 PMs discussing',
    },
    {
      title: 'AI PRDs replacing 30-page feature specs',
      time: '3h ago',
      readers: '3,890 PMs discussing',
    },
    {
      title: '2026 PM Compensation Benchmarks released',
      time: '5h ago',
      readers: '950 PMs reading',
    },
    {
      title: 'Outcome bets in Enterprise B2B SaaS',
      time: '1d ago',
      readers: '2,100 PMs discussing',
    },
    {
      title: 'How Notion evaluates LLM latency & UX',
      time: '1d ago',
      readers: '1,780 PMs reading',
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
      role: 'Principal PM @ Stripe (Payments)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'p-3',
      name: 'Claire Dupont',
      role: 'Staff PM @ Linear (Platform & AI)',
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
      {/* LinkedIn News Card */}
      <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3.5 text-left">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-bold text-slate-900">PMVerse News</span>
          </div>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <p className="text-[11px] font-semibold text-slate-500 pt-1 pb-1">
          Top stories in Product Management
        </p>

        <div className="space-y-2.5 mt-1">
          {trendingNews.slice(0, showMoreNews ? 5 : 4).map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTab('community')}
              className="group cursor-pointer"
            >
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 flex-shrink-0 group-hover:bg-[#0a66c2] transition" />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0a66c2] leading-snug transition">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {item.time} • {item.readers}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowMoreNews(!showMoreNews)}
          className="mt-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 transition"
        >
          <span>{showMoreNews ? 'Show less' : 'Show more'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreNews ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Suggested PM Connections ("Add to your feed") */}
      <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3.5 text-left">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <span className="text-sm font-bold text-slate-900">Add to your PM squad</span>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="space-y-3">
          {suggestedPms.map((pm) => {
            const isConn = connectedIds.includes(pm.id);
            return (
              <div key={pm.id} className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5 min-w-0">
                  <UserAvatar
                    src={pm.avatar}
                    name={pm.name}
                    size="lg"
                    className="flex-shrink-0 border border-slate-200 mt-0.5"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 hover:text-[#0a66c2] cursor-pointer truncate">
                      {pm.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
                      {pm.role}
                    </p>
                    <button
                      onClick={() => toggleConnect(pm.id)}
                      className={`mt-1.5 px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 transition ${
                        isConn
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'border-[#0a66c2] text-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2'
                      }`}
                    >
                      {isConn ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>+ Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
          <button
            onClick={() => setActiveTab('connect')}
            className="text-xs font-semibold text-slate-600 hover:text-[#0a66c2] flex items-center justify-center space-x-1 mx-auto"
          >
            <span>View all PM recommendations</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* LinkedIn Exact Micro-Footer */}
      <div className="px-3 py-2 text-center text-[11px] text-slate-500 space-y-1">
        <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-1">
          <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">About</span>
          <span>•</span>
          <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">Accessibility</span>
          <span>•</span>
          <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">Help Center</span>
          <span>•</span>
          <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">Privacy & Terms</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-1">
          <button onClick={() => setActiveTab('ai-tutor')} className="hover:text-[#0a66c2] hover:underline">PM Learning</button>
          <span>•</span>
          <button onClick={() => setActiveTab('assessment')} className="hover:text-[#0a66c2] hover:underline">Skill Assessment</button>
          <span>•</span>
          <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">Business Solutions</span>
        </div>
        <p className="text-[10px] text-slate-400 pt-1 font-normal">
          PMVerse Corporation © 2026 • Product Management Network
        </p>
      </div>
    </aside>
  );
};
