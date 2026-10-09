'use client';

import React, { useState } from 'react';
import { Navbar, NavTabType } from '@/components/Navbar';
import { HomeDashboard } from '@/components/HomeDashboard';
import { AiPmTutor } from '@/components/AiPmTutor';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import { JobBoard } from '@/components/JobBoard';
import { CommunityFeed } from '@/components/CommunityFeed';
import { NetworkConnect } from '@/components/NetworkConnect';
import { LearnHub } from '@/components/LearnHub';
import { INITIAL_POSTS, INITIAL_JOBS } from '@/data/mockData';
import { Home, Sparkles, Award, Briefcase, Users } from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [mentorStarterPrompt, setMentorStarterPrompt] = useState<string>('');
  const [mentorStarterMode, setMentorStarterMode] = useState<
    'explain' | 'coach' | 'case' | 'prd' | 'interview'
  >('explain');
  const [learnInitialTerm, setLearnInitialTerm] = useState<string>('pmf');
  const [bottomAskText, setBottomAskText] = useState('');

  const handleAskMentor = (prompt: string, mode: 'explain' | 'coach' | 'case' | 'prd' | 'interview' = 'explain') => {
    setMentorStarterPrompt(prompt);
    setMentorStarterMode(mode);
    setActiveTab('mentor');
  };

  const handleOpenLearnTopic = (termKey: string) => {
    setLearnInitialTerm(termKey);
    setActiveTab('learn');
  };

  const handleBottomAskSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bottomAskText.trim()) return;
    const q = bottomAskText.trim();
    setBottomAskText('');
    handleAskMentor(q, 'explain');
  };

  const showBottomAskBar = activeTab !== 'mentor';

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2f2] text-[#201e1d] selection:bg-[rgba(236,48,19,0.25)]">
      {/* 1. Modernist PMX Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
        {/* TAB 1: Home Overview */}
        {activeTab === 'home' && (
          <HomeDashboard
            setActiveTab={setActiveTab}
            onOpenTopic={handleOpenLearnTopic}
            onOpenCase={() => handleAskMentor('Orders dropped 15% in one city — diagnose', 'case')}
          />
        )}

        {/* TAB 2: AI Mentor */}
        {activeTab === 'mentor' && (
          <AiPmTutor
            starterPrompt={mentorStarterPrompt}
            starterMode={mentorStarterMode}
          />
        )}

        {/* TAB 3: PM Fit Competency Assessment */}
        {(activeTab === 'assess' || (activeTab as any) === 'assessment') && (
          <AssessmentQuiz />
        )}

        {/* TAB 4: Jobs Board & Tracker */}
        {(activeTab === 'jobs' || activeTab === 'tracker') && (
          <JobBoard
            initialJobs={INITIAL_JOBS}
            initialActiveSubTab={activeTab === 'tracker' ? 'tracker' : 'browse'}
            onNavigateToMentor={(prompt) => handleAskMentor(prompt, 'coach')}
          />
        )}

        {/* TAB 5: Community Feed */}
        {activeTab === 'community' && (
          <CommunityFeed initialPosts={INITIAL_POSTS} />
        )}

        {/* TAB 6: Network & Invitations */}
        {activeTab === 'connect' && (
          <NetworkConnect />
        )}

        {/* TAB 7: Learn / Knowledge Hub */}
        {activeTab === 'learn' && (
          <LearnHub
            initialTerm={learnInitialTerm}
            onAskMentor={(termName) =>
              handleAskMentor(`Explain the concept of ${termName} in detail.`, 'explain')
            }
          />
        )}
      </main>

      {/* 3. Floating Modernist Bottom Ask Bar */}
      {showBottomAskBar && (
        <div className="sticky bottom-0 z-40 border-t-2 border-[rgba(32,30,29,0.15)] bg-[#f3f2f2] px-4 py-2.5">
          <div className="max-w-[1240px] mx-auto flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#ec3013] shrink-0" />
            <form onSubmit={handleBottomAskSubmit} className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={bottomAskText}
                onChange={(e) => setBottomAskText(e.target.value)}
                placeholder="Ask the PM Mentor anything — “What is Product-Market Fit?”"
                className="w-full text-sm sm:text-[15px] bg-transparent outline-none font-medium text-[#201e1d] placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!bottomAskText.trim()}
                className="btn btn-primary text-xs font-bold py-1.5 px-4 shrink-0"
              >
                Ask AI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Mobile Bottom Tab Bar */}
      <nav className="md:hidden sticky bottom-0 z-50 grid grid-cols-5 border-t-2 border-[#201e1d] bg-[#f3f2f2] text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 py-2 font-bold ${
            activeTab === 'home' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('mentor')}
          className={`flex flex-col items-center justify-center gap-1 py-2 font-bold ${
            activeTab === 'mentor' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Mentor</span>
        </button>

        <button
          onClick={() => setActiveTab('assess')}
          className={`flex flex-col items-center justify-center gap-1 py-2 font-bold ${
            activeTab === 'assess' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Assess</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center justify-center gap-1 py-2 font-bold ${
            activeTab === 'jobs' || activeTab === 'tracker'
              ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]'
              : 'text-[#201e1d]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center justify-center gap-1 py-2 font-bold ${
            activeTab === 'community' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Feed</span>
        </button>
      </nav>
    </div>
  );
}
