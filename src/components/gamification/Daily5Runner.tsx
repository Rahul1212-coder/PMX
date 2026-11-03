'use client';

import React, { useState, useEffect } from 'react';
import {
  PublicDailyChallenge,
  ChallengeAttempt,
  UserGamificationProfile,
  ShareableResultCardData,
} from '@/types/gamification';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowRight,
  ArrowLeft,
  Share2,
  Trophy,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Lock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ShareResultModal } from './ShareResultModal';
import { useAuth } from '@/context/AuthContext';
import { AchievementDefinition } from '@/types/gamification';

interface Daily5RunnerProps {
  challenge: PublicDailyChallenge;
  initialAttempt: ChallengeAttempt | null;
  userId?: string;
  userDisplayName?: string;
  onAttemptCompleted?: (attempt: ChallengeAttempt, profile: UserGamificationProfile) => void;
  onNavigateToArena?: () => void;
}

export const Daily5Runner: React.FC<Daily5RunnerProps> = ({
  challenge,
  initialAttempt,
  userId,
  userDisplayName = 'Product Manager',
  onAttemptCompleted,
  onNavigateToArena,
}) => {
  const { user, openAuthModal } = useAuth();
  const [attempt, setAttempt] = useState<ChallengeAttempt | null>(initialAttempt);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAttempt?.answers || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [expandedRationale, setExpandedRationale] = useState<string | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<AchievementDefinition[]>([]);
  const [milestoneBonus, setMilestoneBonus] = useState<{ xp: number; milestoneName: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserGamificationProfile | null>(null);

  // Countdown timer to midnight UTC reset
  const [timeUntilReset, setTimeUntilReset] = useState<number>(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilReset((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatResetCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m < 10 ? '0' : ''}${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Synchronize when initialAttempt loads or changes
  useEffect(() => {
    if (initialAttempt) {
      setAttempt(initialAttempt);
      if (initialAttempt.answers) setAnswers(initialAttempt.answers);
      if (initialAttempt.timeTakenSeconds) setSecondsElapsed(initialAttempt.timeTakenSeconds);
    }
  }, [initialAttempt]);

  // Synchronize from localStorage to hold completed score immediately
  useEffect(() => {
    if (!attempt && userId && challenge.challengeDate && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`pmverse_daily_completed_${userId}_${challenge.challengeDate}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.status === 'completed') {
            setAttempt(parsed);
          }
        }
      } catch {}
    }
  }, [userId, challenge.challengeDate, attempt]);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(initialAttempt?.timeTakenSeconds || 0);

  const isCompleted = attempt?.status === 'completed';

  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const currentQuestion = challenge.questions[currentIdx];

  const handleSelectOption = async (optionId: string) => {
    if (isCompleted || !currentQuestion) return;

    if (!user || !userId || userId === 'guest') {
      openAuthModal?.('login');
      return;
    }

    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    if (userId) {
      setIsSavingAnswer(true);
      try {
        await fetch('/api/gamification/daily/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            challengeId: challenge.id,
            challengeDate: challenge.challengeDate,
            questionId: currentQuestion.id,
            selectedOptionId: optionId,
          }),
        });
      } catch (err) {
        console.warn('Autosave error:', err);
      } finally {
        setIsSavingAnswer(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (isCompleted || isSubmitting) return;

    if (!user || !userId || userId === 'guest') {
      openAuthModal?.('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/gamification/daily/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          challengeDate: challenge.challengeDate,
          answers,
          timeTakenSeconds: secondsElapsed,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit challenge');
      }

      setAttempt(data.attempt);
      if (data.newlyUnlockedAchievements && data.newlyUnlockedAchievements.length > 0) {
        setUnlockedBadges(data.newlyUnlockedAchievements);
      }
      if (data.streakMilestoneBonus) {
        setMilestoneBonus(data.streakMilestoneBonus);
      }
      if (data.userProfile) {
        setUserProfile(data.userProfile);
      }

      if (typeof window !== 'undefined' && userId) {
        try {
          localStorage.setItem(
            `pmverse_daily_completed_${userId}_${challenge.challengeDate}`,
            JSON.stringify(data.attempt)
          );
          window.dispatchEvent(new CustomEvent('pmverse_daily5_completed', { detail: data }));
        } catch {}
      }

      if (onAttemptCompleted && data.userProfile) {
        onAttemptCompleted(data.attempt, data.userProfile);
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= challenge.questions.length;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Build share card data
  const shareCardData: ShareableResultCardData = {
    title: `PMVerse Daily 5 — ${challenge.theme}`,
    date: challenge.challengeDate,
    score: attempt?.score || 0,
    correctCount: attempt?.correctCount || 0,
    totalCount: challenge.questions.length,
    streak: attempt?.streakAfterAttempt || 1,
    strongestSkill: currentQuestion?.skillCategory || 'Product Sense',
    feedbackSummary:
      attempt?.score === 100
        ? 'Flawless diagnostic execution with 100% accuracy.'
        : `Completed with ${attempt?.correctCount || 0}/${challenge.questions.length} correct in ${formatTimer(
            attempt?.timeTakenSeconds || secondsElapsed
          )}.`,
    userName: userDisplayName,
    userLevel: 'PM Practitioner',
    shareUrl: 'https://pmverse.in',
  };

  // RESULTS SCREEN (POST-SUBMISSION - SCORE IS HELD, NO RETRY)
  if (isCompleted && attempt) {
    return (
      <div className="space-y-6 text-left animate-in fade-in">
        {/* Official Result Lock Notice */}
        <div className="bg-white border-2 border-[#201e1d] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#201e1d] text-white flex items-center justify-center font-bold shrink-0 border border-[#ec3013]">
              <Lock className="w-4 h-4 text-[#ec3013]" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-[#201e1d] tracking-wider flex flex-wrap items-center gap-2">
                <span>Daily Challenge Locked · Score Held ({attempt.score}/100)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.2">
                  Official Score Recorded
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Daily challenges are a one-time event every 24 hours. No retry after submit. Points are saved to your Weekly Arena score.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-[#ec3013]" />
            <span>Next Challenge In:</span>
            <span className="font-mono font-black text-[#ec3013]">
              {formatResetCountdown(timeUntilReset)}
            </span>
          </div>
        </div>

        {/* Newly Unlocked Badges & Milestones Alert */}
        {unlockedBadges.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 p-5 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                New Milestone Unlocked!
              </span>
              <span className="text-xs font-bold text-amber-900">
                Congratulations on achieving new PM milestones!
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {unlockedBadges.map((badge) => (
                <div key={badge.id} className="bg-white p-3 border border-amber-300 flex items-center gap-3 shadow-sm">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="text-xs font-black text-[#201e1d] flex items-center gap-1.5">
                      <span>{badge.name}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 font-bold">+{badge.xpReward} XP</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak Milestone Bonus Alert */}
        {milestoneBonus && (
          <div className="bg-amber-100/80 border-2 border-amber-400 p-3.5 flex items-center gap-3 text-amber-950 font-bold text-xs">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-600 shrink-0" />
            <div>
              <span className="font-black text-[#201e1d] uppercase tracking-wider text-[11px]">
                {milestoneBonus.milestoneName} Reached!{' '}
              </span>
              <span className="text-amber-800 font-medium">
                You earned an extra <strong className="text-amber-900 font-black">+{milestoneBonus.xp} XP</strong> milestone bonus for maintaining your streak.
              </span>
            </div>
          </div>
        )}

        {/* Top Celebration Card */}
        <div className="bg-[#201e1d] text-white p-6 sm:p-8 border-2 border-[#ec3013] relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#ec3013] text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Daily 5 Completed
                </span>
                <span className="text-[11px] font-mono text-amber-300">
                  {challenge.challengeDate} · {challenge.theme}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#f3f2f2] tracking-tight">
                {attempt.score === 100 ? 'Masterful Product Thinking!' : 'Daily Diagnostic Complete!'}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                You correctly solved {attempt.correctCount} of {attempt.totalQuestions} real-world product dilemmas in {formatTimer(attempt.timeTakenSeconds)}.
              </p>
            </div>

            <div className="flex items-center gap-5 sm:gap-6 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 shrink-0">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-[#ec3013]">
                  {attempt.score}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                  Score / 100
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center justify-center gap-1">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  +{attempt.score}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                  Arena Pts
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-amber-300 text-amber-400" />
                  {attempt.streakAfterAttempt}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                  Streak
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  +{attempt.xpAwarded}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                  XP Earned
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Score held & recorded. Next Daily 5 unlocks at 00:00 UTC.</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="btn bg-[#ec3013] hover:bg-[#d0280e] text-white text-xs font-bold py-2 px-4 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Scorecard</span>
              </button>
              {onNavigateToArena && (
                <button
                  onClick={onNavigateToArena}
                  className="btn bg-white text-[#201e1d] hover:bg-slate-200 text-xs font-bold py-2 px-4 flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#ec3013]" />
                  <span>Check Arena Leaderboard</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#201e1d]/20 pb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#201e1d] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ec3013]" />
              <span>Full Decision Rationale & Distractor Breakdown</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {attempt.correctCount} / {challenge.questions.length} Correct
            </span>
          </div>

          {attempt.questionResults?.map((res, i) => {
            const isExpanded = expandedRationale === res.questionId;
            const originalQ = challenge.questions.find((q) => q.id === res.questionId);

            return (
              <div
                key={res.questionId}
                className={`border-2 p-5 bg-white transition-all ${
                  res.isCorrect ? 'border-emerald-600/40 bg-emerald-50/10' : 'border-rose-600/40 bg-rose-50/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs text-white ${
                        res.isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {res.isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-[#201e1d]">
                      Question {i + 1} · {res.skillCategory}
                    </span>
                  </div>
                  <span className="text-xs font-black font-mono">
                    {res.isCorrect ? '+20 XP' : '0 XP'}
                  </span>
                </div>

                {originalQ && (
                  <div className="mb-3 space-y-1 text-xs">
                    <p className="text-slate-600 bg-slate-50 p-2.5 border border-slate-200 font-mono text-[11px] leading-relaxed">
                      {originalQ.scenario}
                    </p>
                    <p className="font-bold text-[#201e1d] text-xs pt-1">{originalQ.questionText}</p>
                  </div>
                )}

                {/* Selected vs Correct Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                  <div
                    className={`p-2.5 border ${
                      res.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black block">Your Selected Option</span>
                    <span className="font-bold">
                      Option {res.selectedOption || 'Skipped'}:{' '}
                      {originalQ?.options.find((o) => o.id === res.selectedOption)?.text || 'No option selected'}
                    </span>
                  </div>

                  {!res.isCorrect && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900">
                      <span className="text-[10px] uppercase font-black block">Correct Best Answer</span>
                      <span className="font-bold">
                        Option {res.correctOption}:{' '}
                        {originalQ?.options.find((o) => o.id === res.correctOption)?.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detailed Correct Rationale */}
                <div className="bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                  <span className="font-black text-[#201e1d] text-[11px] uppercase tracking-wider block">
                    Principal PM Evaluation Rationale
                  </span>
                  <p className="text-slate-700 leading-relaxed text-xs">{res.explanation}</p>
                </div>

                {/* Expandable Distractor Deep-Dive */}
                {res.optionExplanations && Object.keys(res.optionExplanations).length > 0 && (
                  <div className="mt-2.5">
                    <button
                      onClick={() => setExpandedRationale(isExpanded ? null : res.questionId)}
                      className="text-[11px] font-bold text-[#ae1800] hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide' : 'Why other options fail (Distractor Analysis)'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-200">
                        {Object.entries(res.optionExplanations).map(([optKey, expText]) => (
                          <div key={optKey} className="text-[11px] text-slate-600 bg-white p-2 border border-slate-200">
                            <span className="font-black text-[#201e1d]">Option {optKey}: </span>
                            <span>{expText}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Share Result Modal */}
        <ShareResultModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          data={shareCardData}
        />
      </div>
    );
  }

  // ACTIVE RUNNER (QUESTION IN PROGRESS)
  return (
    <div className="space-y-5 text-left animate-in fade-in">
      {/* Top Runner Bar */}
      <div className="bg-white border-2 border-[#201e1d] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#ec3013] text-white px-2 py-0.5">
              Daily 5 Challenge
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {challenge.challengeDate} · {challenge.theme}
            </span>
          </div>
          <h2 className="text-lg font-black text-[#201e1d] m-0">{challenge.title}</h2>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-[#eae9e9] px-3 py-1.5 border border-[#201e1d]/20">
            <Clock className="w-3.5 h-3.5 text-[#ec3013]" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <div className="text-xs font-bold text-slate-600">
            {answeredCount} of {challenge.questions.length} answered
          </div>
        </div>
      </div>

      {/* Stepper Dots */}
      <div className="grid grid-cols-5 gap-2">
        {challenge.questions.map((q, idx) => {
          const isSelected = Boolean(answers[q.id]);
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={`py-2 px-3 text-center border-2 transition-all font-black text-xs flex items-center justify-center gap-1.5 ${
                isCurrent
                  ? 'border-[#ec3013] bg-[#201e1d] text-white'
                  : isSelected
                  ? 'border-[#201e1d] bg-white text-[#201e1d]'
                  : 'border-slate-300 bg-slate-100 text-slate-400 hover:border-slate-400'
              }`}
            >
              <span>Q{idx + 1}</span>
              {isSelected && <span className="text-emerald-600 font-bold">●</span>}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white border-2 border-[#201e1d] p-6 space-y-5">
          <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-slate-200">
            <span className="uppercase tracking-wider text-[#ae1800]">
              Category: {currentQuestion.skillCategory}
            </span>
            <span className="text-slate-400 font-mono">20 Points</span>
          </div>

          {/* Scenario */}
          <div className="bg-[#eae9e9] p-4 border border-[rgba(32,30,29,0.15)] space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Business Scenario & Constraints
            </span>
            <p className="text-xs sm:text-sm text-[#201e1d] leading-relaxed font-medium">
              {currentQuestion.scenario}
            </p>
          </div>

          {/* Prompt */}
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-[#201e1d] leading-snug">
              {currentQuestion.questionText}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 border-2 transition-all cursor-pointer flex items-start gap-3 text-xs sm:text-sm ${
                    isSelected
                      ? 'border-[#ec3013] bg-rose-50/40 text-[#201e1d] shadow-sm'
                      : 'border-[#201e1d]/30 bg-white hover:border-[#201e1d] hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#ec3013] text-white'
                        : 'border border-[#201e1d] text-[#201e1d] bg-slate-100'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="pt-0.5 leading-relaxed font-medium">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1.5 disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {currentIdx < challenge.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(challenge.questions.length - 1, prev + 1))}
                  className="btn btn-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5"
                >
                  <span>Next Dilemma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  className="btn bg-[#ec3013] hover:bg-[#d0280e] text-white border-none text-xs font-black py-2.5 px-6 flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Grading Decision...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Submit Daily 5 & Unlock Explanations</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
