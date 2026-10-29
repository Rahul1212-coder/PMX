'use client';

import React, { useState, useEffect } from 'react';
import {
  LeaderboardLeague,
  LeaderboardTimeframe,
  LeaderboardResponse,
  LeaderboardEntry,
} from '@/types/gamification';
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Loader2,
  Users,
} from 'lucide-react';
import { UserAvatar } from '../UserAvatar';

interface ArenaLeaderboardViewProps {
  userId?: string;
  onOpenDaily5?: () => void;
}

export const ArenaLeaderboardView: React.FC<ArenaLeaderboardViewProps> = ({
  userId,
  onOpenDaily5,
}) => {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('weekly');
  const [league, setLeague] = useState<LeaderboardLeague>('intermediate');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/gamification/leaderboard?league=${league}&timeframe=${timeframe}&userId=${userId || ''}`
      );
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, league, userId]);

  const formatCountdown = (secs?: number) => {
    if (!secs || secs <= 0) return 'Resetting soon';
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${days}d ${hours}h ${mins}m left in sprint`;
  };

  const filteredEntries = (data?.entries || []).filter((e) =>
    e.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Reset Countdown */}
      <div className="bg-[#201e1d] text-white p-5 sm:p-6 border-2 border-[#ec3013] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#ec3013] text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-300" />
              PMVerse Arena
            </span>
            <span className="text-[11px] font-mono text-amber-300">
              Sprint Competition
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f3f2f2] tracking-tight">
            Weekly Product Management Leaderboard
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Ranked by total points earned on daily product challenges this week. Tie-breakers reward perfect 5/5 scores and completion timestamps.
          </p>
        </div>

        <div className="bg-white/10 p-3.5 border border-white/10 shrink-0 text-center sm:text-right space-y-0.5">
          <div className="flex items-center justify-center sm:justify-end gap-1.5 text-amber-300 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-[#ec3013]" />
            <span>{formatCountdown(data?.secondsUntilReset)}</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Resets Sunday midnight UTC
          </span>
        </div>
      </div>

      {/* Control Switchers: Timeframe & League Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border-2 border-[#201e1d] p-3">
        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1 bg-[#eae9e9] p-1 border border-slate-300 text-xs font-bold">
          {(['weekly', 'monthly', 'all_time'] as LeaderboardTimeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`py-1.5 px-3 transition-colors ${
                timeframe === tf
                  ? 'bg-[#201e1d] text-white'
                  : 'text-[#201e1d] hover:bg-slate-200'
              }`}
            >
              {tf === 'weekly' ? 'This Week' : tf === 'monthly' ? 'This Month' : 'All-Time XP'}
            </button>
          ))}
        </div>

        {/* League Switcher */}
        <div className="flex items-center gap-1 bg-[#eae9e9] p-1 border border-slate-300 text-xs font-bold">
          <span className="text-[10px] uppercase font-black text-slate-500 px-2 hidden sm:inline">
            League:
          </span>
          {(['beginner', 'intermediate', 'advanced'] as LeaderboardLeague[]).map((lg) => (
            <button
              key={lg}
              onClick={() => setLeague(lg)}
              className={`py-1.5 px-3 transition-colors uppercase text-[11px] ${
                league === lg
                  ? 'bg-[#ec3013] text-white'
                  : 'text-[#201e1d] hover:bg-slate-200'
              }`}
            >
              {lg}
            </button>
          ))}
        </div>
      </div>

      {/* TOP THREE PODIUM CARDS */}
      {data && data.topPodium.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {data.topPodium.map((entry, idx) => {
            const medalColors = [
              'border-amber-400 bg-amber-50/30 text-amber-950', // 1st Gold
              'border-slate-400 bg-slate-50/40 text-slate-900',  // 2nd Silver
              'border-amber-700/50 bg-orange-50/30 text-amber-950', // 3rd Bronze
            ];
            const medalIcons = ['🥇', '🥈', '🥉'];

            return (
              <div
                key={entry.userId}
                className={`border-2 p-5 text-center space-y-3 relative overflow-hidden transition-all shadow-sm ${
                  medalColors[idx] || 'border-slate-300 bg-white'
                }`}
              >
                <div className="text-3xl select-none">{medalIcons[idx]}</div>

                <div>
                  <div className="font-black text-base text-[#201e1d] truncate">
                    {entry.displayName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {entry.role} {entry.company ? `@ ${entry.company}` : ''}
                  </div>
                </div>

                <div className="bg-white/80 border border-[#201e1d]/15 p-2 rounded-none space-y-0.5">
                  <div className="text-2xl font-black text-[#ec3013]">
                    {entry.points} pts
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {entry.challengesCompleted} Challenges · {entry.perfectScoresCount} Perfect
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-700">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>{entry.currentStreak} Day Streak</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="p-3 bg-white border-2 border-[#201e1d] flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search PM competitors by name, title, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent outline-none font-medium text-[#201e1d] placeholder:text-slate-400"
        />
      </div>

      {/* Ranked Table */}
      <div className="bg-white border-2 border-[#201e1d] overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-[#201e1d] bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th className="py-3 px-4">Product Manager</th>
              <th className="py-3 px-4">Streak</th>
              <th className="py-3 px-4">Solved</th>
              <th className="py-3 px-4">Perfect (5/5)</th>
              <th className="py-3 px-4 text-right">Sprint Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-bold">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#ec3013] mb-2" />
                  Loading verified Arena leaderboard standings...
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-bold">
                  No competitors found. Be the first to solve today&apos;s Daily 5!
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isUser = entry.isCurrentUser;

                return (
                  <tr
                    key={entry.userId}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-amber-100/60 font-black border-l-4 border-[#ec3013]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block font-black text-xs ${
                          entry.rank === 1
                            ? 'text-amber-600 text-sm'
                            : entry.rank === 2
                            ? 'text-slate-500 text-sm'
                            : entry.rank === 3
                            ? 'text-amber-800 text-sm'
                            : 'text-slate-600'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </td>

                    {/* PM Name & Role */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={entry.displayName} src={entry.avatarUrl} size="sm" />
                        <div>
                          <span className="font-black text-[#201e1d] block">
                            {entry.displayName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {entry.role} {entry.company ? `@ ${entry.company}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                        <Flame className="w-3.5 h-3.5 fill-[#ec3013] text-[#ec3013]" />
                        {entry.currentStreak}d
                      </span>
                    </td>

                    {/* Challenges Completed */}
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {entry.challengesCompleted}
                    </td>

                    {/* Perfect Scores */}
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {entry.perfectScoresCount > 0 ? `${entry.perfectScoresCount} ★` : '—'}
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-sm text-[#ec3013]">
                        {entry.points} pts
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
