'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NavTabType } from './Navbar';
import {
  getUserQuizResultsFromDb,
  getJobApplicationsFromDb,
  getCommunityPostsFromDb,
} from '@/lib/supabase/database';
import { SavedQuizResult, JobApplication, CommunityPost } from '@/types';
import { ArrowRight, Sparkles, Award, Briefcase, Users, FileText } from 'lucide-react';

interface HomeDashboardProps {
  setActiveTab: (tab: NavTabType) => void;
  onOpenTopic?: (topicId: string) => void;
  onOpenCase?: () => void;
  onOpenChallenge?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setActiveTab,
  onOpenTopic,
  onOpenCase,
  onOpenChallenge,
}) => {
  const { user, profile } = useAuth();
  const [latestQuizResult, setLatestQuizResult] = useState<SavedQuizResult | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  // Load real user test results, applications, and community posts
  useEffect(() => {
    let mounted = true;

    async function loadRealAnalytics() {
      if (user?.id) {
        // 1. Real Quiz Diagnostic
        const results = await getUserQuizResultsFromDb(user.id);
        if (mounted && results.length > 0) {
          setLatestQuizResult(results[0]);
        }

        // 2. Real Job Applications
        const apps = await getJobApplicationsFromDb(user.id);
        if (mounted) {
          setApplications(apps);
        }
      }

      // 3. Real Community Posts
      const posts = await getCommunityPostsFromDb();
      if (mounted && posts && posts.length > 0) {
        setCommunityPosts(posts.slice(0, 3));
      }
    }

    loadRealAnalytics();

    return () => {
      mounted = false;
    };
  }, [user]);

  const [greeting, setGreeting] = useState<string>('Good day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const displayName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user
    ? 'Product Manager'
    : 'Product Leader';
  const targetRole = profile?.role || 'Product Manager';

  // Real assessment analytics
  const hasTakenTest = Boolean(profile?.pmFitScore || latestQuizResult);
  const realScore = profile?.pmFitScore || latestQuizResult?.scorePercentage || 0;
  const realArchetype = latestQuizResult?.archetype || 'Competency Benchmark';

  // Dimension scores from real quiz result if available
  const realDimensions = latestQuizResult?.dimensionScores || [];

  const appStages = ['Saved', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer'];
  const stageCounts = appStages.map(
    (stg) => applications.filter((a) => a.stage === stg).length
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Welcome Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#ae1800] font-bold mb-2">
            Your PM Journey
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight m-0 text-[#201e1d]">
            {greeting}, {displayName}.
          </h1>
        </div>
        <div className="text-sm text-[#605d5d] max-w-sm">
          Target role: <strong className="text-[#201e1d] font-bold">{targetRole}</strong>.{' '}
          {hasTakenTest ? (
            <span>Verified PM Fit diagnostic active. Keep building mastery across competencies.</span>
          ) : (
            <span>Complete your competency diagnostic to calculate your verified score and gap analysis.</span>
          )}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-[rgba(32,30,29,0.15)] border-2 border-[rgba(32,30,29,0.15)]">
        {/* Cell 1: PM Fit Score (Dynamic / Real) */}
        <div className="bg-[#f3f2f2] p-6 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold mb-2">
              PM Fit Score
            </div>
            {hasTakenTest ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl sm:text-8xl font-black leading-none tracking-tighter text-[#ec3013]">
                    {realScore}
                  </span>
                  <span className="text-xl font-bold text-[#7d7979]">/ 100</span>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="tag tag-accent font-bold">{realArchetype}</span>
                  <span className="text-xs text-[#605d5d]">Verified diagnostic score</span>
                </div>
              </>
            ) : (
              <div className="py-2 space-y-2">
                <div className="text-4xl sm:text-5xl font-black text-[#201e1d] tracking-tight">
                  — / 100
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="tag tag-neutral font-bold">Diagnostic Pending</span>
                </div>
                <p className="text-xs text-[#605d5d] leading-relaxed pt-1">
                  Take the 50-question PM Competency Benchmark to compute your verified score, category strengths, and role alignment.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setActiveTab('assess')}
            className="btn btn-secondary w-full justify-between mt-4 text-xs font-bold"
          >
            <span>{hasTakenTest ? 'View full diagnostic' : 'Start Competency Diagnostic'}</span>
            <span>→</span>
          </button>
        </div>

        {/* Cell 2: Skill Breakdown (Dynamic / Real) */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold mb-4">
            Skill Breakdown
          </div>
          {hasTakenTest && realDimensions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {realDimensions.slice(0, 6).map((sk: any) => (
                <div key={sk.dimension || sk.category}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{sk.dimension || sk.category}</span>
                    <span className="font-extrabold text-[#201e1d]">
                      {sk.score || sk.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#d7d3d3]">
                    <div
                      className="h-full"
                      style={{
                        width: `${sk.score || sk.percentage}%`,
                        backgroundColor:
                          (sk.score || sk.percentage) >= 75 ? 'var(--color-text)' : 'var(--color-accent)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="text-xs font-bold text-[#201e1d]">
                Competency analytics locked
              </div>
              <p className="text-xs text-[#605d5d] leading-relaxed">
                Your performance across Product Sense, Analytics, Execution, and Strategy unlocks once you submit your first assessment.
              </p>
              <button
                onClick={() => setActiveTab('assess')}
                className="btn btn-primary text-xs font-bold w-full mt-2"
              >
                Unlock Skills Breakdown →
              </button>
            </div>
          )}
        </div>

        {/* Cell 3: Recommended For You */}
        <div className="bg-[#f3f2f2] p-6 flex flex-col">
          <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold mb-2">
            Recommended For You
          </div>
          <div className="divide-y divide-[rgba(32,30,29,0.15)]">
            <div
              onClick={() => {
                if (onOpenTopic) onOpenTopic('activation');
                setActiveTab('learn');
              }}
              className="py-3 flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div>
                <div className="text-[11px] tracking-wider uppercase text-[#ae1800] font-bold">
                  Learn
                </div>
                <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                  Improve Product Analytics
                </div>
                <div className="text-xs text-[#605d5d]">Key frameworks for user activation.</div>
              </div>
              <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform">→</span>
            </div>

            <div
              onClick={() => setActiveTab('jobs')}
              className="py-3 flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div>
                <div className="text-[11px] tracking-wider uppercase text-[#ae1800] font-bold">
                  Jobs
                </div>
                <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                  Verified PM job board
                </div>
                <div className="text-xs text-[#605d5d]">Matched to your role seniority.</div>
              </div>
              <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform">→</span>
            </div>

            <div
              onClick={() => {
                if (onOpenCase) onOpenCase();
                setActiveTab('mentor');
              }}
              className="py-3 flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div>
                <div className="text-[11px] tracking-wider uppercase text-[#ae1800] font-bold">
                  Practice
                </div>
                <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                  Practice a Product Sense case
                </div>
                <div className="text-xs text-[#605d5d]">A 15-minute case with AI feedback.</div>
              </div>
              <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Cell 4: Applications Tracker (Real Data) */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold">
              Applications
            </div>
            <button
              onClick={() => setActiveTab('tracker')}
              className="btn btn-ghost text-xs font-bold"
            >
              Open tracker →
            </button>
          </div>
          <div className="text-5xl font-black tracking-tight mb-4 text-[#201e1d]">
            {applications.length}
          </div>
          {applications.length > 0 ? (
            <div className="divide-y divide-[rgba(32,30,29,0.15)] text-xs">
              {appStages.map((stg, i) => (
                <div key={stg} className="flex justify-between py-1.5">
                  <span className="text-slate-600">{stg}</span>
                  <span className="font-bold text-[#201e1d]">{stageCounts[i]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 space-y-2">
              <p className="text-xs text-[#605d5d]">
                No applications tracked yet. Browse open PM roles or log your external job applications.
              </p>
              <button
                onClick={() => setActiveTab('jobs')}
                className="btn btn-secondary text-xs font-bold w-full"
              >
                Browse Roles →
              </button>
            </div>
          )}
        </div>

        {/* Cell 5: Community Discussions (Real Data) */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold">
              Community
            </div>
            <button
              onClick={() => setActiveTab('community')}
              className="btn btn-ghost text-xs font-bold"
            >
              See all →
            </button>
          </div>
          {communityPosts.length > 0 ? (
            <div className="divide-y divide-[rgba(32,30,29,0.15)]">
              {communityPosts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setActiveTab('community')}
                  className="py-2.5 cursor-pointer hover:text-[#ae1800] transition-colors"
                >
                  <div className="font-bold text-xs sm:text-sm leading-snug line-clamp-2">
                    {d.title}
                  </div>
                  <div className="text-[11px] text-[#605d5d] mt-1">
                    {d.author.name} · {d.commentsCount || 0} comments · ▲ {d.upvotes}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 space-y-2">
              <p className="text-xs text-[#605d5d]">
                Be the first to share a teardown or ask a product question.
              </p>
              <button
                onClick={() => setActiveTab('community')}
                className="btn btn-secondary text-xs font-bold w-full"
              >
                Start Discussion →
              </button>
            </div>
          )}
        </div>

        {/* Cell 6: Weekly Challenge Box (Interactive Journey) */}
        <div className="bg-[#ec3013] text-[#f3f2f2] p-6 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold opacity-90 mb-1">
              Weekly Challenge #23 · 3 Days Left
            </div>
            <h3 className="text-2xl font-black leading-tight tracking-tight mt-2 text-[#f3f2f2]">
              Improve onboarding for a music streaming app.
            </h3>
            <p className="text-xs opacity-90 mt-2">
              Submit your teardown and get evaluated by AI rubric scoring and community review.
            </p>
          </div>
          <button
            onClick={() => {
              if (onOpenChallenge) onOpenChallenge();
            }}
            className="btn w-full justify-between mt-4 bg-[#f3f2f2] text-[#201e1d] hover:bg-[#eae9e9] text-xs font-bold"
          >
            <span>Start Challenge Journey</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
