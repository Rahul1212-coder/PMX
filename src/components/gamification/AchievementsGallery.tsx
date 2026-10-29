'use client';

import React from 'react';
import { AchievementDefinition } from '@/types/gamification';
import { Award, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface AchievementsGalleryProps {
  achievements: AchievementDefinition[];
}

export const AchievementsGallery: React.FC<AchievementsGalleryProps> = ({
  achievements,
}) => {
  const earnedCount = achievements.filter((a) => a.isEarned).length;

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b-2 border-[#201e1d]/20 pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#201e1d] text-white px-2 py-0.5">
              Badges & Milestones
            </span>
            <span className="text-xs font-bold text-slate-500">
              {earnedCount} of {achievements.length} Unlocked
            </span>
          </div>
          <h3 className="text-sm font-black text-[#201e1d] m-0">
            Product Judgment Achievements
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((ach) => {
          const isEarned = Boolean(ach.isEarned);

          return (
            <div
              key={ach.id}
              className={`border-2 p-5 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isEarned
                  ? 'border-[#201e1d] bg-white shadow-sm'
                  : 'border-slate-300 bg-slate-50/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`text-3xl p-2 rounded border ${
                      isEarned
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-200 border-slate-300 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <span
                    className={`text-[9px] uppercase font-black px-2 py-0.5 border ${
                      ach.rarity === 'Legendary'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : ach.rarity === 'Epic'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : ach.rarity === 'Rare'
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {ach.rarity}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#201e1d] m-0 flex items-center gap-1.5">
                    <span>{ach.name}</span>
                    {isEarned ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400 inline" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {ach.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#ae1800]">+{ach.xpReward} XP</span>
                <span className="text-slate-400">
                  {isEarned ? 'Earned' : 'Locked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
