'use client';

import React from 'react';
import { Users, Sparkles, Briefcase, Compass, Award } from 'lucide-react';

interface NavbarProps {
  activeTab: 'community' | 'ai-tutor' | 'jobs' | 'assessment';
  setActiveTab: (tab: 'community' | 'ai-tutor' | 'jobs' | 'assessment') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'community' as const, label: 'Community Feed', icon: Users, badge: 'Active' },
    { id: 'ai-tutor' as const, label: 'AI Term Tutor', icon: Sparkles, badge: 'GPT-4o' },
    { id: 'jobs' as const, label: 'PM Job Board', icon: Briefcase, badge: 'New' },
    { id: 'assessment' as const, label: 'PM Fit Diagnostic', icon: Compass, badge: 'Quiz' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('community')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ProdCraft
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                PM Hub & Copilot
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.id === activeTab && (
                    <span className="inline md:hidden">{tab.label.split(' ')[0]}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('assessment')}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <span>Take Fit Test</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-300">
              PM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
