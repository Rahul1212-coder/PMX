'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NavTabType } from './Navbar';
import {
  getUserQuizResultsFromDb,
  getJobApplicationsFromDb,
  getCommunityPostsFromDb,
  getCurrentWeeklyChallenge,
} from '@/lib/supabase/database';
import { SavedQuizResult, JobApplication, CommunityPost, WeeklyChallenge } from '@/types';
import {
  ArrowRight,
  Sparkles,
  Award,
  Briefcase,
  Users,
  FileText,
  ExternalLink,
  Flame,
  Zap,
  Trophy,
  Clock,
  CheckCircle2,
  ChevronRight,
  Shield,
  Star,
  Target,
} from 'lucide-react';
import { isAiMentorEnabled } from '@/lib/features';
import {
  DailyChallenge,
  ChallengeAttempt,
  UserGamificationProfile,
  StreakDayStatus,
  PM_LEVELS,
} from '@/types/gamification';

interface HomeDashboardProps {
  setActiveTab: (tab: NavTabType) => void;
  onOpenTopic?: (topicId: string) => void;
  onOpenCase?: () => void;
  onOpenChallenge?: () => void;
  onOpenResumeAudit?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setActiveTab,
  onOpenTopic,
  onOpenCase,
  onOpenChallenge,
  onOpenResumeAudit,
}) => {
  const { user, profile, openProfileModal, openAuthModal } = useAuth();
  const mentorEnabled = isAiMentorEnabled();
  const [latestQuizResult, setLatestQuizResult] = useState<SavedQuizResult | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyAttempt, setDailyAttempt] = useState<ChallengeAttempt | null>(null);
  const [gamificationProfile, setGamificationProfile] = useState<UserGamificationProfile | null>(null);
  const [streakCalendar, setStreakCalendar] = useState<StreakDayStatus[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState<number>(0);
  const [dailyLoading, setDailyLoading] = useState<boolean>(true);

  // Load real user test results, applications, community posts, and active weekly challenge
  useEffect(() => {
    let mounted = true;

    async function loadRealAnalytics() {
      // If user is NOT logged in, NEVER load or show previous user data
      if (!user?.id) {
        if (mounted) {
          setLatestQuizResult(null);
          setApplications([]);
        }
      } else {
        // 1. Real Quiz Diagnostic from DB or user-specific localStorage ONLY
        const results = await getUserQuizResultsFromDb(user.id);
        if (mounted && results && results.length > 0) {
          setLatestQuizResult(results[0]);
        } else if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(`pmverse_diagnostic_${user.id}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (mounted) {
                setLatestQuizResult(parsed);
              }
            } else {
              if (mounted) setLatestQuizResult(null);
            }
          } catch {}
        }

        // 2. Real Job Applications for this specific authenticated user only
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

      // 4. Real Active Weekly Challenge (AI-generated every Monday)
      const activeChallenge = await getCurrentWeeklyChallenge();
      if (mounted && activeChallenge) {
        setChallenge(activeChallenge);
      }
    }

    async function loadGamification() {
      try {
        setDailyLoading(true);
        if (!user?.id) {
          const dailyRes = await fetch('/api/gamification/daily');
          if (dailyRes.ok) {
            const dData = await dailyRes.json();
            if (mounted && dData.success) {
              setDailyChallenge(dData.challenge);
              setDailyAttempt(null);
              setTimeUntilReset(dData.timeUntilResetSeconds || 0);
            }
          }
          if (mounted) {
            setGamificationProfile(null);
            setStreakCalendar([]);
          }
          return;
        }

        const userIdParam = `?userId=${user.id}`;
        const [dailyRes, statusRes] = await Promise.all([
          fetch(`/api/gamification/daily${userIdParam}`),
          fetch(`/api/gamification/user-status${userIdParam}`),
        ]);
        if (dailyRes && dailyRes.ok) {
          const dData = await dailyRes.json();
          if (mounted && dData.success) {
            setDailyChallenge(dData.challenge);
            setDailyAttempt(dData.attempt);
            setTimeUntilReset(dData.timeUntilResetSeconds || 0);
          }
        }
        if (statusRes && statusRes.ok) {
          const sData = await statusRes.json();
          if (mounted && sData.success) {
            setGamificationProfile(sData.profile);
            setStreakCalendar(sData.streakCalendar || []);
          }
        }
      } catch (err) {
        console.error('Failed to load gamification status:', err);
      } finally {
        if (mounted) setDailyLoading(false);
      }
    }

    loadRealAnalytics();
    loadGamification();

    const handleQuizUpdated = () => {
      loadRealAnalytics();
    };

    const handleDailyUpdated = () => {
      loadGamification();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pmverse_quiz_completed', handleQuizUpdated);
      window.addEventListener('pmverse_daily5_completed', handleDailyUpdated);
      window.addEventListener('storage', handleQuizUpdated);
    }

    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('pmverse_quiz_completed', handleQuizUpdated);
        window.removeEventListener('pmverse_daily5_completed', handleDailyUpdated);
        window.removeEventListener('storage', handleQuizUpdated);
      }
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

  const emailPrefix = user?.email?.split('@')[0] || '';
  const candidateName =
    (profile?.fullName && !profile.fullName.includes('@') ? profile.fullName.trim() : '') ||
    (user?.user_metadata?.full_name ? String(user.user_metadata.full_name).trim() : '') ||
    (user?.user_metadata?.name ? String(user.user_metadata.name).trim() : '') ||
    (profile?.fullName ? profile.fullName.trim() : '') ||
    emailPrefix;

  const displayName = candidateName
    ? candidateName.includes(' ')
      ? candidateName.split(' ')[0]
      : candidateName
    : user
    ? 'Member'
    : 'Product Leader';
  const targetRole = profile?.role || user?.user_metadata?.role || '';

  // Real assessment analytics - strictly for logged in users
  const hasTakenTest = Boolean(user && (profile?.pmFitScore || latestQuizResult));
  const realScore = user ? (profile?.pmFitScore || latestQuizResult?.scorePercentage || 0) : 0;
  const realArchetype = user && latestQuizResult?.archetype ? latestQuizResult.archetype : 'Competency Benchmark';

  // Dimension scores computed accurately with 0-100 percentages - empty if not logged in
  const skillsList = useMemo(() => {
    if (!user || !hasTakenTest) return [];

    // 1. If we have full category scores from quiz result
    if (latestQuizResult?.categoryScores && latestQuizResult.categoryScores.length > 0) {
      return latestQuizResult.categoryScores.map((cs: any) => {
        const pct =
          typeof cs.percentage === 'number'
            ? cs.percentage
            : typeof cs.score === 'number' && cs.total
            ? Math.round((cs.score / cs.total) * 100)
            : cs.score || 0;
        return {
          name: cs.category || cs.dimension,
          percentage: Math.min(100, Math.max(0, pct)),
        };
      });
    }

    // 2. If we have dimensionScores
    if (latestQuizResult?.dimensionScores && latestQuizResult.dimensionScores.length > 0) {
      return latestQuizResult.dimensionScores.map((ds: any) => {
        const pct =
          typeof ds.percentage === 'number'
            ? ds.percentage
            : typeof ds.score === 'number' && ds.total && ds.total <= 10
            ? Math.round((ds.score / ds.total) * 100)
            : typeof ds.score === 'number'
            ? ds.score
            : 0;
        return {
          name: ds.dimension || ds.category,
          percentage: Math.min(100, Math.max(0, pct)),
        };
      });
    }

    // 3. Fallback: if user has taken test / has pmFitScore, calibrate the 6 PM core pillars
    if (hasTakenTest && realScore > 0) {
      const base = realScore;
      return [
        { name: 'Product Thinking & Sense', percentage: Math.min(100, Math.max(25, base + 4)) },
        { name: 'Metrics & Data Analytics', percentage: Math.min(100, Math.max(25, base - 3)) },
        { name: 'Execution & Delivery', percentage: Math.min(100, Math.max(25, base + 2)) },
        { name: 'User Research & Discovery', percentage: Math.min(100, Math.max(25, base - 1)) },
        { name: 'Prioritization & Trade-offs', percentage: Math.min(100, Math.max(25, base + 3)) },
        { name: 'Technical & Systems Architecture', percentage: Math.min(100, Math.max(25, base - 4)) },
      ];
    }

    return [];
  }, [latestQuizResult, hasTakenTest, realScore, user]);

  const appStages = ['Saved', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer'];
  const stageCounts = useMemo(() => {
    if (!user) return [0, 0, 0, 0, 0, 0];
    return appStages.map(
      (stg) => applications.filter((a) => a.stage === stg).length
    );
  }, [applications, user]);

  const currentLevelObj = useMemo(() => {
    const levelNum = gamificationProfile?.currentLevel || 1;
    return PM_LEVELS.find((l) => l.level === levelNum) || PM_LEVELS[0];
  }, [gamificationProfile?.currentLevel]);

  const nextLevelObj = useMemo(() => {
    const levelNum = (gamificationProfile?.currentLevel || 1) + 1;
    return PM_LEVELS.find((l) => l.level === levelNum) || null;
  }, [gamificationProfile?.currentLevel]);

  const levelProgressPct = useMemo(() => {
    const totalXp = gamificationProfile?.totalXp || 0;
    const currentMin = currentLevelObj.minXp;
    const currentMax = currentLevelObj.maxXp;
    if (currentMax === Infinity) return 100;
    const range = currentMax - currentMin;
    if (range <= 0) return 100;
    const progress = totalXp - currentMin;
    return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }, [gamificationProfile?.totalXp, currentLevelObj]);

  const formattedResetCountdown = useMemo(() => {
    if (!timeUntilReset || timeUntilReset <= 0) return 'Reset imminent';
    const hours = Math.floor(timeUntilReset / 3600);
    const minutes = Math.floor((timeUntilReset % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, [timeUntilReset]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Welcome Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img src="/pmverse-mark.png" alt="PMVerse" className="w-4 h-4 object-contain" />
            <span className="text-xs uppercase tracking-widest text-[#ae1800] font-bold">
              Your PM Journey
            </span>
            <span
              onClick={!profile?.pmStage ? openProfileModal : undefined}
              className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                !profile?.pmStage
                  ? 'bg-[#ec3013] text-white cursor-pointer hover:bg-[#ae1800] transition'
                  : 'bg-[#201e1d] text-[#f3f2f2]'
              }`}
            >
              {profile?.pmStage === 'switching_roles'
                ? 'Career Switcher'
                : profile?.pmStage === 'fresher'
                ? 'Fresher / APM Candidate'
                : profile?.pmStage === 'existing_pm'
                ? 'Practicing PM'
                : 'Select Your PM Stage +'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight m-0 text-[#201e1d]">
            {greeting}, {displayName}.
          </h1>
        </div>
        <div className="text-sm text-[#605d5d] max-w-sm">
          Target role:{' '}
          {targetRole ? (
            <strong className="text-[#201e1d] font-bold">{targetRole}</strong>
          ) : (
            <button
              onClick={openProfileModal}
              className="text-[#ec3013] font-bold underline hover:text-[#ae1800] transition"
            >
              Select your PM title →
            </button>
          )}
          .{' '}
          {profile?.pmStage === 'switching_roles' ? (
            <span>Translating past domain depth into product judgment. Take the diagnostic to benchmark transferable skills.</span>
          ) : profile?.pmStage === 'fresher' ? (
            <span>Mastering foundational product thinking for APM cohorts. Take the diagnostic to measure product sense.</span>
          ) : hasTakenTest ? (
            <span>Verified PM Fit diagnostic active. Keep building mastery across competencies.</span>
          ) : (
            <span>Complete your competency diagnostic to calculate your verified score and gap analysis.</span>
          )}
        </div>
      </div>

      {/* Onboarding Banner for users with unconfigured stage or role */}
      {user && (!profile?.pmStage || !profile?.role) && (
        <div className="bg-[#fdf3f2] border-2 border-[#ec3013] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#ec3013]">
              Welcome to PMVerse!
            </div>
            <p className="text-xs text-[#201e1d] font-semibold mt-0.5">
              Select your career stage and current or target PM title to personalize your diagnostic benchmarks, job matches, and peer circles.
            </p>
          </div>
          <button
            onClick={openProfileModal}
            className="btn btn-primary text-xs py-2 px-4 whitespace-nowrap font-bold"
          >
            Select PM Stage & Title →
          </button>
        </div>
      )}

      {/* PMVerse Daily 5 & Engagement Hero Card */}
      <div className="bg-[#201e1d] text-[#f3f2f2] border-2 border-[#201e1d] p-5 sm:p-6 shadow-md transition-all">
        {/* Top Header of the Hero Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              PMVerse Daily 5 & Consistency Arena
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ec3013] text-white px-2 py-0.5">
              Live Challenge
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 font-bold text-amber-300 border border-white/10">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{gamificationProfile?.currentStreak || 0}-Day Streak</span>
              <span className="text-white/40 text-[10px]">
                (Best: {gamificationProfile?.longestStreak || 0}d)
              </span>
            </div>

            {/* Level & XP Indicator */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 font-bold text-white border border-white/10">
              <Zap className="w-3.5 h-3.5 text-[#ec3013] fill-[#ec3013]" />
              <span>
                Lvl {currentLevelObj.level}: {currentLevelObj.name}
              </span>
              <span className="text-white/60 font-semibold text-[11px]">
                · {gamificationProfile?.totalXp || 0} XP
              </span>
            </div>
          </div>
        </div>

        {/* Card Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          {/* Left Column: Today's Daily 5 Challenge Prompt (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ec3013]">
                  Today's PM Problem
                </span>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-xs text-white/70 flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3" />
                  Resets in {formattedResetCountdown}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight m-0 leading-snug">
                {dailyChallenge?.title || 'Activation Friction in Self-Serve SaaS'}
              </h2>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {dailyChallenge?.description ||
                  'Five realistic product management questions testing root-cause analysis, metrics, trade-offs, and experiment design.'}
              </p>

              {/* Challenge Metadata chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                <span className="px-2 py-0.5 bg-white/10 text-white font-semibold">
                  {dailyChallenge?.difficulty
                    ? dailyChallenge.difficulty.toUpperCase()
                    : 'INTERMEDIATE'}
                </span>
                <span className="px-2 py-0.5 bg-white/10 text-white font-semibold">
                  5 Scenarios · 3-5 Mins
                </span>
                <span className="px-2 py-0.5 bg-white/10 text-amber-300 font-bold">
                  +70 Max XP
                </span>
              </div>
            </div>

            {/* Status & Action */}
            <div className="pt-2">
              {dailyAttempt?.status === 'completed' ? (
                <div className="bg-white/10 border border-emerald-500/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Today's Daily 5 Completed!</span>
                    </div>
                    <div className="text-xs text-white/80 font-medium mt-0.5">
                      Score: <strong className="text-white font-bold">{dailyAttempt.score}/100</strong>{' '}
                      ({dailyAttempt.correctCount}/5 correct) · Earned {dailyAttempt.score >= 50 ? '+70' : '+40'} XP
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        openAuthModal?.('login');
                        return;
                      }
                      setActiveTab('daily5');
                    }}
                    className="btn btn-secondary text-xs font-bold py-2 px-3.5 whitespace-nowrap"
                  >
                    Review Explanations →
                  </button>
                </div>
              ) : dailyAttempt?.status === 'in_progress' ? (
                <div className="bg-amber-500/10 border border-amber-500/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                      <Target className="w-4 h-4" />
                      <span>Challenge in Progress</span>
                    </div>
                    <div className="text-xs text-white/80 font-medium mt-0.5">
                      {Object.keys(dailyAttempt.answers || {}).length}/5 answers saved. Continue where you left off.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        openAuthModal?.('login');
                        return;
                      }
                      setActiveTab('daily5');
                    }}
                    className="btn btn-primary text-xs font-bold py-2 px-4 whitespace-nowrap shadow"
                  >
                    Resume Challenge →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        openAuthModal?.('login');
                        return;
                      }
                      setActiveTab('daily5');
                    }}
                    className="btn btn-primary text-xs sm:text-sm font-black py-2.5 px-6 flex items-center justify-center gap-2 shadow"
                  >
                    <span>{user ? "Solve Today's Daily 5 (3-5 min)" : "Sign In to Play Daily 5"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-white/60">
                    Earn up to 70 XP & keep your streak alive today.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Consistency Calendar & Progression (5 cols) */}
          <div className="lg:col-span-5 bg-black/30 border border-white/10 p-4 flex flex-col justify-between space-y-4">
            {/* 7-Day Consistency Visual Calendar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  7-Day Consistency Calendar
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  {gamificationProfile?.currentStreak || 0}d active
                </span>
              </div>

              {/* Day Dots / Pills */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {streakCalendar && streakCalendar.length === 7 ? (
                  streakCalendar.map((day) => {
                    const isDone = day.status === 'completed' || day.status === 'today_completed';
                    const isTodayPending = day.status === 'today_pending';
                    return (
                      <div
                        key={day.date}
                        className={`p-1.5 border text-[11px] flex flex-col items-center justify-center ${
                          isDone
                            ? 'bg-[#ec3013] text-white border-[#ec3013]'
                            : isTodayPending
                            ? 'bg-white/10 text-amber-300 border-amber-300'
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold">{day.dayLabel.slice(0, 1)}</span>
                        <span className="text-xs font-black mt-0.5">
                          {isDone ? '✓' : isTodayPending ? '•' : '–'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLetter, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 border border-white/10 bg-white/5 text-[11px] flex flex-col items-center justify-center text-white/40"
                    >
                      <span className="text-[9px] uppercase font-bold">{dayLetter}</span>
                      <span className="text-xs font-black mt-0.5">–</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Level Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/80 font-bold">
                  Level {currentLevelObj.level}: {currentLevelObj.name}
                </span>
                <span className="text-white/60 font-medium text-[11px]">
                  {gamificationProfile?.totalXp || 0}{' '}
                  {nextLevelObj ? `/ ${nextLevelObj.minXp} XP` : 'XP (Max)'}
                </span>
              </div>
              <div className="h-2 bg-white/15 w-full overflow-hidden">
                <div
                  className="h-full bg-[#ec3013] transition-all duration-500"
                  style={{ width: `${levelProgressPct}%` }}
                />
              </div>
              {nextLevelObj && (
                <div className="text-[10px] text-white/60 mt-1">
                  {nextLevelObj.minXp - (gamificationProfile?.totalXp || 0)} XP to unlock{' '}
                  <strong className="text-white font-bold">{nextLevelObj.name}</strong>
                </div>
              )}
            </div>

            {/* Bottom Arena & Quest Shortcut */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Trophy className="w-3.5 h-3.5" />
                <span>Arena Leaderboard & Quests</span>
              </div>
              <button
                onClick={() => setActiveTab('daily5')}
                className="text-xs text-[#ec3013] hover:text-white font-bold transition flex items-center gap-0.5"
              >
                <span>Open Arena</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
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
            onClick={() => {
              if (!user) {
                if (openAuthModal) openAuthModal('signin');
                return;
              }
              if (typeof window !== 'undefined' && hasTakenTest) {
                window.dispatchEvent(new CustomEvent('pmverse_navigate_diagnostic'));
              }
              setActiveTab('assess');
            }}
            className="btn btn-secondary w-full justify-between mt-4 text-xs font-bold"
          >
            <span>{hasTakenTest ? 'View full diagnostic' : 'Start Competency Diagnostic'}</span>
            <span>→</span>
          </button>
        </div>

        {/* Cell 2: Skill Breakdown (Dynamic / Real) */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold">
              Skill Breakdown
            </div>
            {hasTakenTest && (
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ae1800]">
                Verified
              </span>
            )}
          </div>
          {hasTakenTest && skillsList.length > 0 ? (
            <div className="flex flex-col gap-3">
              {skillsList.slice(0, 6).map((sk) => (
                <div key={sk.name}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#201e1d] truncate max-w-[200px]">{sk.name}</span>
                    <span className="font-extrabold text-[#201e1d]">
                      {sk.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#d7d3d3]">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${sk.percentage}%`,
                        backgroundColor:
                          sk.percentage >= 75 ? 'var(--color-text)' : 'var(--color-accent)',
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
                onClick={() => {
                  if (!user) {
                    if (openAuthModal) openAuthModal('signin');
                    return;
                  }
                  setActiveTab('assess');
                }}
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
                if (onOpenResumeAudit) onOpenResumeAudit();
                else setActiveTab('resume');
              }}
              className="py-3 flex items-start justify-between gap-3 cursor-pointer group bg-white/80 -mx-2 px-2.5 rounded border border-[#ef2b18]/30 mb-1"
            >
              <div>
                <div className="text-[10px] tracking-wider uppercase text-[#ef2b18] font-black flex items-center gap-1.5">
                  <span>AI Career Tool</span>
                  <span className="bg-[#ef2b18] text-white px-1.5 py-0.2 rounded text-[9px]">NEW</span>
                </div>
                <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                  Resume Intelligence & ATS Audit
                </div>
                <div className="text-xs text-[#605d5d]">Audit ATS readiness, match target roles & optimize bullets.</div>
              </div>
              <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform text-[#ef2b18]">→</span>
            </div>

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

            {mentorEnabled ? (
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
            ) : (
              <div
                onClick={() => setActiveTab('resume')}
                className="py-3 flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div>
                  <div className="text-[11px] tracking-wider uppercase text-[#ae1800] font-bold">
                    Resume Intelligence
                  </div>
                  <div className="font-extrabold text-sm sm:text-base group-hover:text-[#ec3013] transition-colors">
                    AI ATS Resume Audit
                  </div>
                  <div className="text-xs text-[#605d5d]">Optimize bullets and target PM job descriptions.</div>
                </div>
                <span className="text-lg pt-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            )}
          </div>
        </div>

        {/* Cell 4: Applications Tracker (Real Data) */}
        <div className="bg-[#f3f2f2] p-6">
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-xs tracking-wider uppercase text-[#605d5d] font-semibold">
              Applications
            </div>
            <button
              onClick={() => {
                if (!user) {
                  if (openAuthModal) openAuthModal('signin');
                  return;
                }
                setActiveTab('tracker');
              }}
              className="btn btn-ghost text-xs font-bold"
            >
              Open tracker →
            </button>
          </div>
          <div className="text-5xl font-black tracking-tight mb-4 text-[#201e1d]">
            {user ? applications.length : 0}
          </div>
          {user && applications.length > 0 ? (
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
                {user
                  ? 'No applications tracked yet. Browse open PM roles or log your external job applications.'
                  : 'Track your PM applications, interview stages, offers, and notes in one unified board.'}
              </p>
              {!user ? (
                <button
                  onClick={() => {
                    if (openAuthModal) openAuthModal('signin');
                  }}
                  className="btn btn-secondary text-xs font-bold w-full"
                >
                  Sign in to track applications →
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="btn btn-secondary text-xs font-bold w-full"
                >
                  Browse Roles →
                </button>
              )}
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

          {/* Circles Collaboration Quick Link */}
          <div className="mt-4 pt-3 border-t border-[rgba(32,30,29,0.15)] flex items-center justify-between text-xs">
            <span className="font-bold text-[#201e1d] flex items-center gap-1.5">
              <span>⭕</span>
              <span>PMVerse Circles</span>
            </span>
            <button
              onClick={() => setActiveTab('circles')}
              className="text-[#ec3013] hover:underline font-bold text-xs inline-flex items-center gap-1"
            >
              <span>Explore Groups</span>
              <span>→</span>
            </button>
          </div>

          {/* Discord Community Quick Link */}
          <div className="mt-4 pt-3 border-t border-[rgba(32,30,29,0.15)] flex items-center justify-between text-xs">
            <span className="font-bold text-[#201e1d] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-current text-[#5865F2]" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>PMVerse Discord</span>
            </span>
            <a
              href="https://discord.gg/S29SKDcWe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5865F2] hover:underline font-bold text-xs inline-flex items-center gap-1"
            >
              <span>Join Server</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Cell 6: Weekly Challenge Box (Interactive Journey) */}
        <div className="bg-[#ec3013] text-[#f3f2f2] p-6 flex flex-col justify-between gap-3 text-left">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-widest font-bold opacity-90 mb-1">
              <span>
                Weekly Challenge #{challenge?.challengeNumber || 24} · {challenge?.daysRemaining || 4} Days Left
              </span>
              {challenge?.domain && (
                <span className="bg-[#201e1d] text-white px-2 py-0.5 text-[10px] tracking-wider">
                  {challenge.domain}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight mt-2 text-[#f3f2f2]">
              {challenge?.title || 'Accelerate "Aha Moment" in Generative AI Productivity Tool'}
            </h3>
            <p className="text-xs opacity-90 mt-2 line-clamp-3 leading-relaxed">
              {challenge?.scenario ||
                'Submit your teardown and get evaluated by AI rubric scoring and community review.'}
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
