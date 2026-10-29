'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, NavTabType } from '@/components/Navbar';
import { HomeDashboard } from '@/components/HomeDashboard';
import { AiPmTutor } from '@/components/AiPmTutor';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import { JobBoard } from '@/components/JobBoard';
import { CommunityFeed } from '@/components/CommunityFeed';
import { NetworkConnect } from '@/components/NetworkConnect';
import { LearnHub } from '@/components/LearnHub';
import { CirclesLanding } from '@/components/circles/CirclesLanding';
import { ResumeIntelligence } from '@/components/resume/ResumeIntelligence';
import { WeeklyChallengeModal } from '@/components/WeeklyChallengeModal';
import { GamificationHub } from '@/components/gamification/GamificationHub';
import { INITIAL_POSTS, INITIAL_JOBS } from '@/data/mockData';
import { Home, Sparkles, Award, Briefcase, Users, FileText, Flame, Lock } from 'lucide-react';
import { isAiMentorEnabled } from '@/lib/features';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const { user, openAuthModal, loginAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [mentorStarterPrompt, setMentorStarterPrompt] = useState<string>('');
  const [mentorStarterMode, setMentorStarterMode] = useState<
    'explain' | 'coach' | 'case' | 'prd' | 'interview'
  >('explain');
  const [learnInitialTerm, setLearnInitialTerm] = useState<string>('pmf');
  const [bottomAskText, setBottomAskText] = useState('');
  const [resumeInitialJob, setResumeInitialJob] = useState<{
    title: string;
    company: string;
    description: string;
  } | undefined>();

  const mentorEnabled = isAiMentorEnabled();

  // If in production or feature disabled, redirect away from mentor tab
  useEffect(() => {
    if (!mentorEnabled && activeTab === 'mentor') {
      setActiveTab('home');
    }
  }, [mentorEnabled, activeTab]);

  const handleAskMentor = (prompt: string, mode: 'explain' | 'coach' | 'case' | 'prd' | 'interview' = 'explain') => {
    if (!mentorEnabled) return;
    if (!user) {
      openAuthModal?.('login');
      return;
    }
    setMentorStarterPrompt(prompt);
    setMentorStarterMode(mode);
    setActiveTab('mentor');
  };

  const handleOpenLearnTopic = (termKey: string) => {
    setLearnInitialTerm(termKey);
    setActiveTab('learn');
  };

  const handleAnalyzeJobResume = (job: { title: string; company: string; description: string }) => {
    setResumeInitialJob(job);
    setActiveTab('resume');
  };

  const handleBottomAskSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      openAuthModal?.('login');
      return;
    }
    if (!bottomAskText.trim()) return;
    const q = bottomAskText.trim();
    setBottomAskText('');
    handleAskMentor(q, 'explain');
  };

  const showBottomAskBar = mentorEnabled && activeTab !== 'mentor';

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2f2] text-[#201e1d] selection:bg-[rgba(236,48,19,0.25)]">
      {/* 1. Modernist PMVerse Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
        {/* TAB 1: Home Overview */}
        {activeTab === 'home' && (
          <HomeDashboard
            setActiveTab={setActiveTab}
            onOpenTopic={handleOpenLearnTopic}
            onOpenCase={() => handleAskMentor('Orders dropped 15% in one city — diagnose', 'case')}
            onOpenChallenge={() => setIsChallengeModalOpen(true)}
            onOpenResumeAudit={() => setActiveTab('resume')}
          />
        )}

        {/* TAB: PMVerse Daily 5, Arena & Gamification */}
        {activeTab === 'daily5' && (
          <GamificationHub
            initialSubTab="daily"
            onNavigateToAssess={() => setActiveTab('assess')}
          />
        )}

        {/* TAB: PMVerse Resume Intelligence */}
        {activeTab === 'resume' && (
          <ResumeIntelligence initialJobContext={resumeInitialJob} />
        )}

        {/* TAB 2: AI Mentor */}
        {mentorEnabled && activeTab === 'mentor' && (
          !user ? (
            <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-10 max-w-2xl mx-auto my-8 text-left space-y-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#201e1d] text-white text-[10px] font-black uppercase tracking-wider">
                  <Lock className="w-3 h-3 text-[#ec3013]" />
                  <span>Members Only · VerseAI PM Mentor</span>
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Authentication Required
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#201e1d] tracking-tight m-0">
                  Sign in to access VerseAI Mentor
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                  Personalized 1-on-1 coaching, interactive case interview practice, root-cause problem diagnosis, and actionable product frameworks are exclusive to logged-in members.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn btn-primary w-full sm:w-auto text-xs font-black py-3 px-6 flex items-center justify-center gap-2 shadow"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>

                {loginAsDemo && (
                  <button
                    onClick={() => loginAsDemo()}
                    className="btn btn-secondary w-full sm:w-auto text-xs font-bold py-3 px-5 flex items-center justify-center gap-1.5"
                  >
                    <span>Try Demo Account</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <AiPmTutor
              starterPrompt={mentorStarterPrompt}
              starterMode={mentorStarterMode}
            />
          )
        )}

        {/* TAB 3: PM Fit Competency Assessment */}
        {(activeTab === 'assess' || (activeTab as any) === 'assessment') && (
          !user ? (
            <div className="bg-white border-2 border-[#201e1d] p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
              <div className="w-14 h-14 bg-red-50 border-2 border-[#201e1d] flex items-center justify-center mx-auto mb-4 text-[#ec3013]">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-[#201e1d] mb-2 uppercase tracking-wide">
                PM Competency Assessment Locked
              </h2>
              <p className="text-sm text-[#605d5d] mb-6 leading-relaxed">
                Sign in or register to take the official 3-tier PM competency assessment, earn your verified PM Fit certification, benchmark your product sense against top PMs, and unlock career analytics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="btn btn-primary w-full sm:w-auto text-xs font-bold py-3 px-6 flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In / Register to Start</span>
                </button>

                {loginAsDemo && (
                  <button
                    onClick={() => loginAsDemo()}
                    className="btn btn-secondary w-full sm:w-auto text-xs font-bold py-3 px-5 flex items-center justify-center gap-1.5"
                  >
                    <span>Try Demo Account</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <AssessmentQuiz setActiveTab={setActiveTab} />
          )
        )}

        {/* TAB 4: Jobs Board & Tracker */}
        {(activeTab === 'jobs' || activeTab === 'tracker') && (
          <JobBoard
            initialJobs={INITIAL_JOBS}
            initialActiveSubTab={activeTab === 'tracker' ? 'tracker' : 'browse'}
            onNavigateToMentor={(prompt) => handleAskMentor(prompt, 'coach')}
            onNavigateToAssessment={() => setActiveTab('assess')}
            onAnalyzeJobResume={handleAnalyzeJobResume}
          />
        )}

        {/* TAB 5: Community Feed */}
        {activeTab === 'community' && (
          <CommunityFeed
            initialPosts={INITIAL_POSTS}
            onOpenChallenge={() => setIsChallengeModalOpen(true)}
          />
        )}

        {/* TAB: PMVerse Circles (Private Collaboration Groups) */}
        {activeTab === 'circles' && (
          <CirclesLanding />
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
            <img src="/pmverse-mark.png" alt="PMVerse" className="w-4 h-4 object-contain shrink-0" />
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
      <nav className="md:hidden sticky bottom-0 z-50 grid grid-cols-7 border-t-2 border-[#201e1d] bg-[#f3f2f2] text-[10px]">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
            activeTab === 'home' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('daily5')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
            activeTab === 'daily5' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <span className="text-xs leading-none">🔥</span>
          <span>Daily 5</span>
        </button>

        {mentorEnabled ? (
          <button
            onClick={() => setActiveTab('mentor')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
              activeTab === 'mentor' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mentor</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
              activeTab === 'resume' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('assess')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
            activeTab === 'assess' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Assess</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
            activeTab === 'jobs' || activeTab === 'tracker'
              ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]'
              : 'text-[#201e1d]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab('circles')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
            activeTab === 'circles' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <span className="text-xs">⭕</span>
          <span>Circles</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 font-bold ${
            activeTab === 'community' ? 'text-[#ae1800] border-t-2 border-[#ec3013] -mt-[2px]' : 'text-[#201e1d]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Feed</span>
        </button>
      </nav>

      {/* 5. Weekly Challenge Modal */}
      <WeeklyChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
      />
    </div>
  );
}
