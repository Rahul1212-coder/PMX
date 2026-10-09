'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { LeftSidebar } from '@/components/LeftSidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { CommunityFeed } from '@/components/CommunityFeed';
import { NetworkConnect } from '@/components/NetworkConnect';
import { JobBoard } from '@/components/JobBoard';
import { AiPmTutor } from '@/components/AiPmTutor';
import { AssessmentQuiz } from '@/components/AssessmentQuiz';
import { INITIAL_POSTS, INITIAL_CONCEPTS, INITIAL_JOBS, ASSESSMENT_QUESTIONS } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment'>('community');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2ef] text-[#191919]">
      {/* LinkedIn-style Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main 3-Column LinkedIn Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-5 items-start">
          {/* Left Column: User Profile Card & Followed PM Topics */}
          <div className="w-full md:w-56 lg:w-60 flex-shrink-0">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Center Column: Primary Active Feed / Network / Jobs / Tutor / Quiz */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {activeTab === 'community' && (
              <CommunityFeed initialPosts={INITIAL_POSTS} />
            )}

            {activeTab === 'connect' && (
              <NetworkConnect />
            )}

            {activeTab === 'jobs' && (
              <JobBoard initialJobs={INITIAL_JOBS} />
            )}

            {activeTab === 'ai-tutor' && (
              <AiPmTutor initialConcepts={INITIAL_CONCEPTS} />
            )}

            {activeTab === 'assessment' && (
              <AssessmentQuiz questions={ASSESSMENT_QUESTIONS} />
            )}
          </div>

          {/* Right Column: PM News & Trending Discussions, Recommendations & Widgets */}
          <div className="hidden lg:block w-72 lg:w-80 flex-shrink-0">
            <RightSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </main>
    </div>
  );
}
