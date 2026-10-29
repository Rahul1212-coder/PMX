'use client';

import React, { useState } from 'react';
import { X, Share2, Copy, Check, Sparkles, Trophy, Flame } from 'lucide-react';
import { ShareableResultCardData } from '@/types/gamification';

interface ShareResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareableResultCardData;
}

export const ShareResultModal: React.FC<ShareResultModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `🎯 Scored ${data.score}/100 (${data.correctCount}/${data.totalCount} correct) on today's PMVerse Daily 5!\n🔥 Active PM Streak: ${data.streak} day${data.streak === 1 ? '' : 's'}\n🧠 Top Skill: ${data.strongestSkill}\n\nTest your product judgment on PMVerse:\nhttps://pmverse.in`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `PMVerse Daily 5 — ${data.score}/100`,
          text: shareText,
          url: 'https://pmverse.in',
        });
      } catch {}
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-md w-full shadow-2xl relative text-left">
        {/* Header */}
        <div className="p-4 bg-white border-b-2 border-[#201e1d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ec3013]" />
            <h3 className="text-sm font-black text-[#201e1d] uppercase tracking-wider">
              Share Daily 5 Achievement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#201e1d] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shareable Card Canvas Preview */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-[#201e1d] via-[#2c2928] to-[#1a1817] text-white p-6 border-2 border-[#201e1d] shadow-lg relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <img src="/pmverse-mark.png" alt="PMVerse" className="w-5 h-5 object-contain" />
                <span className="font-black text-sm tracking-tight text-white">PMVerse Daily 5</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{data.date}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-amber-300 block tracking-wider">
                  Diagnostic Score
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-4xl font-black text-[#ec3013]">{data.score}</span>
                  <span className="text-slate-400 font-bold text-sm">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Streak
                </span>
                <span className="inline-flex items-center gap-1 font-black text-amber-300 text-lg">
                  <Flame className="w-4 h-4 fill-amber-300 text-amber-400" />
                  {data.streak} Day{data.streak === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 text-xs space-y-1">
              <div className="text-[10px] uppercase font-extrabold text-[#ec3013]">
                Top Competency: {data.strongestSkill}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed italic">
                &ldquo;{data.feedbackSummary}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/10">
              <span className="font-bold text-white">{data.userName} · {data.userLevel}</span>
              <span className="text-slate-400">pmverse.in/daily</span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <button
              onClick={handleNativeShare}
              className="btn btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to LinkedIn / Twitter / WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="btn btn-secondary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Card Text!' : 'Copy Summary Text'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
