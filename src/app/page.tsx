'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CommunityFeed } from '@/components/CommunityFeed';
import { AiPmTutor } from '@/components/AiPmTutor';
import { JobBoard } from '@/components/JobBoard';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import { INITIAL_POSTS, INITIAL_CONCEPTS, INITIAL_JOBS, ASSESSMENT_QUESTIONS } from '@/data/mockData';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'community' | 'ai-tutor' | 'jobs' | 'assessment'>('community');

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-slate-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
