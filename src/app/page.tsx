'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CommunityFeed } from '@/components/CommunityFeed';
import { AiPmTutor } from '@/components/AiPmTutor';
import { JobBoard } from '@/components/JobBoard';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import { INITIAL_POSTS, INITIAL_CONCEPTS, INITIAL_JOBS, ASSESSMENT_QUESTIONS } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { Users, Sparkles, Briefcase, Compass, ArrowRight, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'community' | 'ai-tutor' | 'jobs' | 'assessment'>('community');
  const { user, profile, openAuthModal, isConfigured } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-slate-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Onboarding Banner when User is NOT logged in */}
        {!user && (
          <div className="bg-gradient-to-br from-[#1b0438] via-[#2a0753] to-[#4c1d95] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
              <img src="/pmverse-icon.png" alt="PMVerse Icon" className="w-80 h-80 object-contain" />
            </div>

            <div className="max-w-3xl relative z-10 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-bold text-purple-200 border border-white/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Start Your Product Journey Here</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Welcome to PMVerse — The All-in-One Universe for Product Managers
              </h1>

              <p className="text-purple-100/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                Create your verified PM profile to start participating in squad teardowns, post & bookmark product jobs, track your PM Fit Diagnostic score, and explore real-time AI frameworks.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create PM Profile (Sign Up)</span>
                </button>

                <button
                  onClick={() => openAuthModal('signin')}
                  className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-2xl border border-white/20 transition text-sm backdrop-blur-md"
                >
                  <LogIn className="w-4 h-4 text-purple-300" />
                  <span>Already have an account? Sign In</span>
                </button>
              </div>

              {/* 4 Feature Value Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs text-purple-200 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-300 flex-shrink-0" />
                  <span className="truncate">Brain Trust Feed</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs text-purple-200 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-300 flex-shrink-0" />
                  <span className="truncate">AI PM Copilot</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs text-purple-200 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-purple-300 flex-shrink-0" />
                  <span className="truncate">Verified Job Board</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs text-purple-200 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-purple-300 flex-shrink-0" />
                  <span className="truncate">PM Fit Diagnostic</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Back Card for Logged In User */}
        {user && profile && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                alt={profile.fullName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-300 shadow-sm flex-shrink-0"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Welcome back, {profile.fullName}!
                  </h2>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {profile.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {profile.company ? `${profile.company} squad` : 'Independent PM'} • Ready to share insights or explore opportunities
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-wrap">
              <button
                onClick={() => setActiveTab('community')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'community' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Community
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'jobs' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveTab('ai-tutor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'ai-tutor' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                AI Copilot
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'community' && (
          <CommunityFeed initialPosts={INITIAL_POSTS} />
        )}

        {activeTab === 'ai-tutor' && (
          <AiPmTutor initialConcepts={INITIAL_CONCEPTS} />
        )}

        {activeTab === 'jobs' && (
          <JobBoard initialJobs={INITIAL_JOBS} />
        )}

        {activeTab === 'assessment' && (
          <AssessmentQuiz questions={ASSESSMENT_QUESTIONS} />
        )}
      </main>

      <footer className="border-t border-purple-100 bg-white/90 backdrop-blur-sm py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-3">
            <img src="/pmverse-icon.png" alt="PMVerse Icon" className="w-6 h-6 object-contain" />
            <span className="font-extrabold text-slate-900 text-sm">PMVerse</span>
            <span className="text-purple-600 font-semibold">— The All-in-One Product Management Universe</span>
          </div>
          <div className="flex items-center space-x-5 text-xs font-medium">
            <button onClick={() => setActiveTab('community')} className="hover:text-purple-700 transition">Community</button>
            <button onClick={() => setActiveTab('ai-tutor')} className="hover:text-purple-700 transition">AI Tutor</button>
            <button onClick={() => setActiveTab('jobs')} className="hover:text-purple-700 transition">Job Board</button>
            <button onClick={() => setActiveTab('assessment')} className="hover:text-purple-700 transition">Fit Quiz</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
