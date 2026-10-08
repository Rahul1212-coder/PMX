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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
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

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">ProdCraft</span>
            <span>— The All-in-One Product Management Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('community')} className="hover:text-indigo-600 transition">Community</button>
            <button onClick={() => setActiveTab('ai-tutor')} className="hover:text-indigo-600 transition">AI Tutor</button>
            <button onClick={() => setActiveTab('jobs')} className="hover:text-indigo-600 transition">Job Board</button>
            <button onClick={() => setActiveTab('assessment')} className="hover:text-indigo-600 transition">Fit Quiz</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
