'use client';

import React from 'react';
import {
  AssessmentLevelConfig,
  AssessmentLevelId,
  UserLevelProgress,
  AssessmentAttempt,
} from '@/types/assessment';
import {
  Award,
  Clock,
  HelpCircle,
  Lock,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AssessmentDashboardProps {
  levels: AssessmentLevelConfig[];
  progress: Record<AssessmentLevelId, UserLevelProgress>;
  history: AssessmentAttempt[];
  onStartLevel: (levelId: AssessmentLevelId) => void;
  onViewAttempt: (attemptId: string) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const AssessmentDashboard: React.FC<AssessmentDashboardProps> = ({
  levels,
  progress,
  history,
  onStartLevel,
  onViewAttempt,
  isAdmin,
  onOpenAdmin,
}) => {
  // Calculate aggregate milestones
  const passedLevelsCount = Object.values(progress).filter((p) => (p.bestScore ?? 0) >= 70).length;
  const progressPercent = Math.round((passedLevelsCount / 3) * 100);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return <span className="tag bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10px]">Beginner · Easy</span>;
      case 'Medium':
        return <span className="tag bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[10px]">Intermediate · Medium</span>;
      case 'Hard':
        return <span className="tag bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[10px]">Advanced · Strategic</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* 1. Header Banner & 3-Level Roadmap */}
      <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-[rgba(32,30,29,0.15)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag tag-accent font-bold text-[11px] uppercase tracking-wider">
                Official PM Competency Certification
              </span>
              {isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="tag bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px] hover:bg-purple-200 transition-colors"
                >
                  ⚙ Question Bank & Admin
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#201e1d] tracking-tight m-0">
              Product Management Assessment System
            </h1>
            <p className="text-sm text-[#605d5d] mt-2 max-w-2xl leading-relaxed">
              Master the product discipline through three progressively unlocked tiers: from product discovery fundamentals, to analytical trade-offs, to executive strategic cases.
            </p>
          </div>

          {/* Aggregate Level Meter */}
          <div className="p-4 bg-[#f3f2f2] border-2 border-[#201e1d] flex flex-col justify-center min-w-[200px]">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mastery Path</span>
              <span className="text-sm font-black text-[#ec3013]">{passedLevelsCount} / 3 Levels</span>
            </div>
            <div className="w-full h-3 bg-slate-200 border border-[#201e1d] overflow-hidden">
              <div
                className="h-full bg-[#ec3013] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-600 mt-1 font-semibold">
              {progressPercent === 100
                ? '🏆 Full PM Certification Achieved!'
                : `${70}% passing score unlocks next tier`}
            </span>
          </div>
        </div>

        {/* 3 Steps Milestone Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {levels.map((lvl, idx) => {
            const prog = progress[lvl.id];
            const isPassed = (prog?.bestScore ?? 0) >= 70;
            const isUnlocked = prog?.isUnlocked;

            return (
              <div
                key={lvl.id}
                className={`p-3 border-2 flex items-center gap-3 transition-colors ${
                  isPassed
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : isUnlocked
                    ? 'border-[#201e1d] bg-[#fdfdfd]'
                    : 'border-slate-300 bg-slate-100 opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isUnlocked
                      ? 'bg-[#201e1d] text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#201e1d] truncate">
                      {lvl.title.split('—')[0].trim()}
                    </span>
                    {!isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {isPassed
                      ? `Passed (${prog.bestScore}%)`
                      : isUnlocked
                      ? prog.status === 'in_progress'
                        ? 'Draft In Progress'
                        : 'Ready to Start'
                      : 'Locked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Three Assessment Level Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {levels.map((lvl) => {
          const prog = progress[lvl.id];
          const isPassed = (prog?.bestScore ?? 0) >= 70;
          const isUnlocked = prog?.isUnlocked;
          const hasAttempted = prog && prog.attemptsCount > 0;

          return (
            <div
              key={lvl.id}
              className={`bg-white border-2 flex flex-col justify-between transition-all relative ${
                isPassed
                  ? 'border-emerald-600 shadow-md'
                  : isUnlocked
                  ? 'border-[#201e1d] shadow hover:-translate-y-1'
                  : 'border-slate-300 bg-slate-50/70'
              }`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  {getDifficultyBadge(lvl.difficulty)}
                  {isPassed ? (
                    <span className="tag bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Certified
                    </span>
                  ) : !isUnlocked ? (
                    <span className="tag bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : (
                    <span className="tag bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                      Unlocked
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-[#201e1d] tracking-tight m-0">
                  {lvl.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 min-h-[36px] leading-relaxed">
                  {lvl.focusDescription}
                </p>

                {/* Score & Status Pill */}
                <div className="mt-4 p-3 bg-[#f3f2f2] border border-[#201e1d]/20 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Best Score</span>
                    <span
                      className={`text-base font-black ${
                        isPassed ? 'text-emerald-700' : hasAttempted ? 'text-amber-700' : 'text-slate-400'
                      }`}
                    >
                      {typeof prog?.bestScore === 'number' ? `${prog.bestScore}%` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Latest Attempt</span>
                    <span className="text-base font-black text-[#201e1d]">
                      {typeof prog?.latestScore === 'number' ? `${prog.latestScore}%` : '—'}
                    </span>
                  </div>
                </div>

                {/* Metadata List */}
                <div className="mt-4 space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lvl.questionCount} Questions ({lvl.formatDescription})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lvl.durationMinutes} Minutes time limit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[#ec3013] shrink-0" />
                    <span>Passing threshold: {lvl.passingScorePercent}% to unlock next tier</span>
                  </div>
                </div>

                {/* Topics Tags */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Core Topics Evaluated
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {lvl.topics.slice(0, 4).map((topic, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200 font-semibold">
                        {topic}
                      </span>
                    ))}
                    {lvl.topics.length > 4 && (
                      <span className="text-[10px] text-slate-500 px-1 font-semibold">
                        +{lvl.topics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card CTA Footer */}
              <div className="p-6 pt-0">
                {isUnlocked ? (
                  <button
                    onClick={() => onStartLevel(lvl.id)}
                    className={`w-full py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isPassed
                        ? 'btn btn-secondary'
                        : 'btn btn-primary shadow-sm hover:translate-x-0.5'
                    }`}
                  >
                    {isPassed ? (
                      <>
                        <RotateCcw className="w-4 h-4" /> Retake Assessment
                      </>
                    ) : prog?.status === 'in_progress' ? (
                      <>
                        <Play className="w-4 h-4" /> Continue Draft
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Start Assessment
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3 bg-slate-100 border border-slate-200 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Requires ≥70% in {lvl.prerequisiteLevelId === 'beginner' ? 'Beginner' : 'Intermediate'}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Candidate Past Attempts History */}
      {history.length > 0 && (
        <div className="bg-white border-2 border-[#201e1d] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#ec3013]" />
              <h3 className="text-base font-black text-[#201e1d] m-0">Your Assessment History</h3>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {history.length} Attempt{history.length > 1 ? 's' : ''} Recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {history.map((att) => {
              const lvl = levels.find((l) => l.id === att.levelId);
              const dateStr = att.completedAt
                ? new Date(att.completedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'In Progress';

              return (
                <div
                  key={att.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        att.isPassed ? 'bg-emerald-600' : att.status === 'in_progress' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-xs text-[#201e1d] block">
                        {lvl?.title || att.levelId}
                      </span>
                      <span className="text-[10px] text-slate-500">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-black text-[#201e1d] block">
                        {typeof att.scorePercentage === 'number' ? `${att.scorePercentage}%` : 'Draft'}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          att.isPassed ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {att.isPassed ? 'Passed' : att.status === 'completed' ? 'Developing' : 'Incomplete'}
                      </span>
                    </div>

                    {att.status === 'completed' && (
                      <button
                        onClick={() => onViewAttempt(att.id)}
                        className="btn btn-secondary text-[11px] font-bold py-1 px-3 flex items-center gap-1"
                      >
                        Review Results <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
