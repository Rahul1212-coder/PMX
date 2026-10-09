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

      {/* Main Content Container adapting to tab layout like LinkedIn */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-5">
        {/* 1. Community Feed: Classic 3-Column LinkedIn Layout */}
        {activeTab === 'community' && (
          <div className="flex flex-col md:flex-row gap-4 lg:gap-5 items-start">
            {/* Left Column: User Profile Card & Followed PM Topics */}
            <div className="w-full md:w-56 lg:w-60 flex-shrink-0">
              <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Center Column: Feed */}
            <div className="flex-1 min-w-0 w-full">
              <CommunityFeed initialPosts={INITIAL_POSTS} />
            </div>

            {/* Right Column: PM News & Trending Discussions */}
            <div className="hidden lg:block w-72 lg:w-80 flex-shrink-0">
              <RightSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        )}

        {/* 2. My Network: LinkedIn Network 2-Column Layout */}
        {activeTab === 'connect' && (
          <NetworkConnect />
        )}

        {/* 3. Jobs: LinkedIn Jobs 2-Column Layout */}
        {activeTab === 'jobs' && (
          <JobBoard initialJobs={INITIAL_JOBS} />
        )}

        {/* 4. PM Learning & AI Copilot: Identity Sidebar + Learning Center */}
        {activeTab === 'ai-tutor' && (
          <div className="flex flex-col md:flex-row gap-4 lg:gap-5 items-start">
            <div className="w-full md:w-56 lg:w-60 flex-shrink-0">
              <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <AiPmTutor initialConcepts={INITIAL_CONCEPTS} />
            </div>
          </div>
        )}

        {/* 5. PM Skill Assessment: Identity Sidebar + Certification Quiz */}
        {activeTab === 'assessment' && (
          <div className="flex flex-col md:flex-row gap-4 lg:gap-5 items-start">
            <div className="w-full md:w-56 lg:w-60 flex-shrink-0">
              <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <AssessmentQuiz questions={ASSESSMENT_QUESTIONS} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
