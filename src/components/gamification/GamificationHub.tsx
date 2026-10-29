'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  PublicDailyChallenge,
  ChallengeAttempt,
  UserGamificationProfile,
  AchievementDefinition,
} from '@/types/gamification';
import { Daily5Runner } from './Daily5Runner';
import { ArenaLeaderboardView } from './ArenaLeaderboardView';
import { WeeklyQuestsView } from './WeeklyQuestsView';
import { AchievementsGallery } from './AchievementsGallery';
import { StreakCalendarWidget } from './StreakCalendarWidget';
import {
  Sparkles,
  Flame,
  Trophy,
  Target,
  Award,
  Layers,
  Clock,
  Loader2,
  RefreshCw,
  Zap,
  Lock,
} from 'lucide-react';

export interface GamificationHubProps {
  initialSubTab?: 'daily' | 'arena' | 'quests' | 'badges';
  onNavigateToAssess?: () => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  initialSubTab = 'daily',
  onNavigateToAssess,
}) => {
  const { user, profile, openAuthModal, loginAsDemo } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'arena' | 'quests' | 'badges'>(initialSubTab);

  // Gamification state
  const [challenge, setChallenge] = useState<PublicDailyChallenge | null>(null);
  const [userAttempt, setUserAttempt] = useState<ChallengeAttempt | null>(null);
  const [gamProfile, setGamProfile] = useState<UserGamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('pmverse_guest_id') || undefined : undefined);

  const fetchDailyAndProfile = async () => {
    setIsLoading(true);
    try {
      const [challengeRes, statusRes] = await Promise.all([
        fetch(`/api/gamification/daily${userId ? `?userId=${userId}` : ''}`),
        fetch(`/api/gamification/user-status?userId=${userId || 'guest'}`),
      ]);

      const [challengeData, statusData] = await Promise.all([
        challengeRes.json(),
        statusRes.json(),
      ]);

      if (challengeData.success && challengeData.challenge) {
        setChallenge(challengeData.challenge);
        setUserAttempt(challengeData.userAttempt || null);
      }

      if (statusData.success) {
        if (statusData.profile) setGamProfile(statusData.profile);
        if (statusData.achievements) setAchievements(statusData.achievements);
      }
    } catch (err) {
      console.warn('Failed to load gamification state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAndProfile();
  }, [userId]);

  const userDisplayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Product Manager';

  return (
    <div className="space-y-6">
      {/* Top Level & XP Stats Bar */}
      <div className="bg-white border-2 border-[#201e1d] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Level Card */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#201e1d] text-white flex items-center justify-center font-black text-xl shrink-0 border-2 border-[#ec3013]">
            L{gamProfile?.currentLevel || 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider bg-[#ec3013] text-white px-2 py-0.2">
                Rank Status
              </span>
              <span className="font-black text-base sm:text-lg text-[#201e1d]">
                {gamProfile?.currentLevelName || 'PM Rookie'}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">
              {gamProfile?.totalXp || 0} Total XP Earned · Level {gamProfile?.currentLevel || 1}
            </div>
          </div>
        </div>

        {/* Level XP Progress Slider */}
        <div className="flex-1 max-w-md space-y-1">
          <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider">
            <span>Next: Level {(gamProfile?.currentLevel || 1) + 1}</span>
            <span>{gamProfile?.levelProgressPercentage || 0}% Progress</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
            <div
              className="bg-[#ec3013] h-full transition-all duration-700 rounded-full"
              style={{ width: `${gamProfile?.levelProgressPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Quick Flame Streak & League Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-3 py-1.5 text-xs font-black text-amber-900">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>{gamProfile?.currentStreak || 0} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-[#ec3013]" />
            <span>+{gamProfile?.totalXp || 0} XP</span>
          </div>
        </div>
      </div>

      {/* Segmented Sub-Navigation */}
      <div className="flex border-b-2 border-[#201e1d] bg-[#eae9e9] text-xs font-bold shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('daily')}
          className={`flex-1 py-3 px-4 border-r border-[#201e1d]/20 transition-colors text-center flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSubTab === 'daily'
              ? 'bg-[#201e1d] text-[#f3f2f2]'
              : 'text-[#201e1d] hover:bg-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#ec3013]" />
          <span>1. Daily 5 Challenge</span>
        </button>

        <button
          onClick={() => setActiveSubTab('arena')}
          className={`flex-1 py-3 px-4 border-r border-[#201e1d]/20 transition-colors text-center flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSubTab === 'arena'
              ? 'bg-[#201e1d] text-[#f3f2f2]'
              : 'text-[#201e1d] hover:bg-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>2. PMVerse Arena</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quests')}
          className={`flex-1 py-3 px-4 border-r border-[#201e1d]/20 transition-colors text-center flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSubTab === 'quests'
              ? 'bg-[#201e1d] text-[#f3f2f2]'
              : 'text-[#201e1d] hover:bg-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-blue-500" />
          <span>3. Weekly Quests</span>
        </button>

        <button
          onClick={() => setActiveSubTab('badges')}
          className={`flex-1 py-3 px-4 transition-colors text-center flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSubTab === 'badges'
              ? 'bg-[#201e1d] text-[#f3f2f2]'
              : 'text-[#201e1d] hover:bg-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-500" />
          <span>4. Badges & Milestones</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div>
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 font-bold flex flex-col items-center gap-2 bg-white border-2 border-[#201e1d]">
            <Loader2 className="w-6 h-6 animate-spin text-[#ec3013]" />
            <span className="text-xs">Loading PMVerse Daily 5 & Arena...</span>
          </div>
        ) : (
          <>
            {/* SUB-TAB 1: DAILY 5 CHALLENGE */}
            {activeSubTab === 'daily' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left/Main Column: Daily 5 Runner */}
                <div className="lg:col-span-2 space-y-6">
                  {!user ? (
                    <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8 text-left space-y-6 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#201e1d] text-white text-[10px] font-black uppercase tracking-wider">
                          <Lock className="w-3 h-3 text-[#ec3013]" />
                          <span>Members Only · Daily 5</span>
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Sign In Required to Play
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#201e1d] tracking-tight m-0">
                          Sign in to solve today&apos;s PMVerse Daily 5
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                          Track your daily consistency, build your PM streak, earn XP, climb the Arena leaderboard, and unlock detailed answer explanations. Only authenticated users can participate in daily challenges.
                        </p>
                      </div>

                      {challenge && (
                        <div className="bg-[#f3f2f2] p-4 border border-[rgba(32,30,29,0.15)] space-y-2">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Today&apos;s Daily Challenge Preview
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-[#201e1d]">
                            {challenge.title}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {challenge.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-500">
                            <span className="px-2 py-0.5 bg-white border border-slate-300">
                              5 Questions
                            </span>
                            <span className="px-2 py-0.5 bg-white border border-slate-300 uppercase">
                              {challenge.difficulty}
                            </span>
                            <span className="text-amber-600 font-extrabold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              +100 XP Reward
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                          onClick={() => openAuthModal('login')}
                          className="btn btn-primary w-full sm:w-auto text-xs font-black py-3 px-6 flex items-center justify-center gap-2 shadow"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Sign In / Register to Play</span>
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
                  ) : challenge ? (
                    <Daily5Runner
                      challenge={challenge}
                      initialAttempt={userAttempt}
                      userId={userId}
                      userDisplayName={userDisplayName}
                      onAttemptCompleted={(attempt, updatedProfile) => {
                        setUserAttempt(attempt);
                        setGamProfile(updatedProfile);
                      }}
                      onNavigateToArena={() => setActiveSubTab('arena')}
                    />
                  ) : (
                    <div className="bg-white border-2 border-[#201e1d] p-8 text-center text-slate-500 font-bold">
                      No challenge scheduled for today. Please check back shortly.
                    </div>
                  )}
                </div>

                {/* Right Column: Streak Widget & Quick Quests */}
                <div className="space-y-6">
                  <StreakCalendarWidget
                    profile={gamProfile}
                    onOpenDailyChallenge={() => setActiveSubTab('daily')}
                  />

                  {/* Level Progression Card */}
                  <div className="bg-white border-2 border-[#201e1d] p-5 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-black uppercase text-[#201e1d] tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#ec3013]" />
                        XP Rewards Ledger
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">Default Rules</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Daily 5 Completion</span>
                        <span className="font-bold text-[#ec3013]">+20 XP</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Correct Answer</span>
                        <span className="font-bold text-[#ec3013]">+10 XP each</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Weekly Quest Complete</span>
                        <span className="font-bold text-[#ec3013]">+50 XP</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">7-Day Streak Milestone</span>
                        <span className="font-bold text-[#ec3013]">+100 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: ARENA LEADERBOARD */}
            {activeSubTab === 'arena' && (
              <ArenaLeaderboardView
                userId={userId}
                onOpenDaily5={() => setActiveSubTab('daily')}
              />
            )}

            {/* SUB-TAB 3: WEEKLY QUESTS */}
            {activeSubTab === 'quests' && (
              <WeeklyQuestsView
                userId={userId}
                onRewardClaimed={(updatedProf) => setGamProfile(updatedProf)}
              />
            )}

            {/* SUB-TAB 4: BADGES & ACHIEVEMENTS */}
            {activeSubTab === 'badges' && (
              <AchievementsGallery achievements={achievements} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
