'use client';

import React from 'react';
import { Flame, Shield, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserGamificationProfile } from '@/types/gamification';

interface StreakCalendarWidgetProps {
  profile: UserGamificationProfile | null;
  onOpenDailyChallenge?: () => void;
}

export const StreakCalendarWidget: React.FC<StreakCalendarWidgetProps> = ({
  profile,
  onOpenDailyChallenge,
}) => {
  const currentStreak = profile?.currentStreak || 0;
  const longestStreak = profile?.longestStreak || 0;
  const days = profile?.sevenDayActivity || [];

  // Determine next milestone
  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 100;
  const daysLeft = nextMilestone - currentStreak;

  return (
    <div className="bg-white border-2 border-[#201e1d] p-5 text-left space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#201e1d]/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#fff2ef] border border-[#ec3013]/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#ec3013] fill-[#ec3013]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-[#201e1d]">{currentStreak}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Day Streak
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block">
              Longest: {longestStreak} days
            </span>
          </div>
        </div>

        {/* Streak Freeze Badge */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-bold text-slate-700">
            {profile?.streakFreezesAvailable || 0} Freeze
          </span>
        </div>
      </div>

      {/* 7-Day Activity Stepper */}
      <div>
        <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2">
          Past 7 Days Consistency
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {days.map((d, i) => {
            const isCompleted = d.status === 'completed' || d.status === 'today_completed';
            const isTodayPending = d.status === 'today_pending';

            return (
              <div
                key={i}
                className={`p-2 border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                    : isTodayPending
                    ? 'bg-amber-50 border-amber-400 text-amber-950 animate-pulse font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold uppercase">{d.dayLabel}</div>
                <div className="text-sm mt-0.5">
                  {isCompleted ? (
                    <Flame className="w-4 h-4 text-[#ec3013] fill-[#ec3013] inline" />
                  ) : isTodayPending ? (
                    <span className="text-amber-600 font-black">●</span>
                  ) : (
                    <span className="text-slate-300 font-bold">―</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="bg-[#eae9e9] p-3 border border-[rgba(32,30,29,0.15)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#ec3013] shrink-0" />
          <span className="text-slate-700">
            <strong>{daysLeft} more challenge{daysLeft === 1 ? '' : 's'}</strong> to reach your{' '}
            <strong>{nextMilestone}-day milestone</strong>!
          </span>
        </div>
        {onOpenDailyChallenge && (
          <button
            onClick={onOpenDailyChallenge}
            className="text-[11px] font-black text-[#ae1800] hover:text-[#ec3013] underline shrink-0 ml-2"
          >
            Play Daily 5 →
          </button>
        )}
      </div>
    </div>
  );
};
