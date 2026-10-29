'use client';

import React, { useState, useEffect } from 'react';
import { WeeklyQuest, UserGamificationProfile } from '@/types/gamification';
import { Target, CheckCircle2, Award, Clock, Sparkles, Loader2 } from 'lucide-react';

interface WeeklyQuestsViewProps {
  userId?: string;
  onRewardClaimed?: (updatedProfile: UserGamificationProfile) => void;
}

export const WeeklyQuestsView: React.FC<WeeklyQuestsViewProps> = ({
  userId,
  onRewardClaimed,
}) => {
  const [quests, setQuests] = useState<WeeklyQuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);

  const fetchQuests = async () => {
    try {
      const res = await fetch(`/api/gamification/quests?userId=${userId || 'guest'}`);
      const data = await res.json();
      if (data.success && data.quests) {
        setQuests(data.quests);
      }
    } catch (err) {
      console.warn('Failed to fetch quests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [userId]);

  const handleClaimReward = async (questId: string) => {
    if (!userId || claimingQuestId) return;

    setClaimingQuestId(questId);
    try {
      const res = await fetch('/api/gamification/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchQuests();
        if (onRewardClaimed && data.updatedProfile) {
          onRewardClaimed(data.updatedProfile);
        }
      }
    } catch (err) {
      console.warn('Claim error:', err);
    } finally {
      setClaimingQuestId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500 font-bold flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#ec3013]" />
        <span className="text-xs">Loading this week&apos;s missions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b-2 border-[#201e1d]/20 pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#201e1d] text-white px-2 py-0.5">
              Weekly Missions
            </span>
            <span className="text-xs font-bold text-slate-500">Resets Monday 00:00 UTC</span>
          </div>
          <h3 className="text-sm font-black text-[#201e1d] m-0">Weekly Sprint Quests</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quests.map((q) => {
          const prog = q.userProgress?.currentProgress || 0;
          const target = q.targetCount;
          const pct = Math.min(100, Math.round((prog / target) * 100));
          const isDone = Boolean(q.userProgress?.isCompleted);
          const isClaimed = Boolean(q.userProgress?.isClaimed);

          return (
            <div
              key={q.id}
              className={`border-2 p-5 bg-white flex flex-col justify-between transition-all ${
                isDone ? 'border-emerald-500 bg-emerald-50/15' : 'border-[#201e1d]/25 hover:border-[#201e1d]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#ae1800]">
                    +{q.xpReward} XP
                  </span>
                  {isClaimed ? (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 border border-slate-300">
                      Reward Claimed
                    </span>
                  ) : isDone ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Ready to Claim
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {prog} / {target}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-[#201e1d] m-0">{q.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {q.description}
                </p>
              </div>

              <div className="pt-4 space-y-3">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-600' : 'bg-[#ec3013]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Claim CTA */}
                {isDone && !isClaimed && (
                  <button
                    onClick={() => handleClaimReward(q.id)}
                    disabled={claimingQuestId === q.id}
                    className="btn btn-primary w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                  >
                    {claimingQuestId === q.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Claim +{q.xpReward} XP</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
