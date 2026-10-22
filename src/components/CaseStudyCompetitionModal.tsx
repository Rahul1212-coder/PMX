'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  Award,
  Clock,
  Target,
  FileText,
  CheckCircle2,
  Users,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { WeeklyChallenge, CASE_STUDY_COMPETITION_FORM_URL, CASE_STUDY_COMPETITION_EMBED_URL } from '@/types';

interface CaseStudyCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: WeeklyChallenge | null;
  onOpenChallengeBrief?: () => void;
}

export const CaseStudyCompetitionModal: React.FC<CaseStudyCompetitionModalProps> = ({
  isOpen,
  onClose,
  challenge,
  onOpenChallengeBrief,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'details'>('form');

  if (!isOpen) return null;

  const challengeTitle =
    challenge?.title || 'Accelerate "Aha Moment" in Generative AI Productivity Tool';
  const weekLabel = challenge?.weekIdentifier || '2026-W43';
  const daysLeft = challenge?.daysRemaining || 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 text-left animate-in fade-in">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-[#201e1d] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#ec3013] text-[#f3f2f2] px-2 py-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Case Study Competition
              </span>
              <span className="text-[10px] bg-[#201e1d] text-white px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#ec3013]" />
                Week {weekLabel} · {daysLeft} Days Left
              </span>
              {challenge?.domain && (
                <span className="text-[10px] bg-rose-100 text-[#ae1800] border border-rose-300 px-2 py-0.5 font-bold uppercase tracking-wider">
                  {challenge.domain}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-[#201e1d] tracking-tight m-0">
              Competition Interest Form: {challengeTitle}
            </h2>
            <p className="text-xs text-slate-600">
              Show your interest in joining this week's live PM case study competition. The challenge prompt is the exact case study published on PMVerse this week.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={CASE_STUDY_COMPETITION_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-xs font-bold py-1.5 px-3 hidden sm:flex items-center gap-1.5"
              title="Open Google Form in a new tab"
            >
              <span>Open in Google Forms</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 border border-[#201e1d] hover:bg-[#201e1d] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-[#201e1d]/20 bg-[#eae9e9] text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('form')}
            className={`py-2.5 px-4 sm:px-6 transition-colors border-r border-[#201e1d]/20 flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-slate-200/60'
            }`}
          >
            <span>1. Fill Interest Form</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-4 sm:px-6 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-slate-200/60'
            }`}
          >
            <span>2. Case Study Brief & Rules</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'form' ? (
            <div className="space-y-4">
              {/* Quick Info Bar */}
              <div className="bg-[#fff3f1] border border-[#ec3013]/30 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-black text-[#ae1800] uppercase tracking-wider text-[10px] block">
                    Official Competition Entry
                  </span>
                  <p className="text-slate-700">
                    Complete the form below to register your team or solo interest. You can also open the form directly in Google Forms.
                  </p>
                </div>
                <a
                  href={CASE_STUDY_COMPETITION_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Full Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Embedded Google Form Container */}
              <div className="relative w-full border-2 border-[#201e1d] bg-white rounded-none overflow-hidden min-h-[500px]">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white gap-2 text-slate-500 z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[#ec3013]" />
                    <span className="text-xs font-bold">Loading Google Registration Form...</span>
                  </div>
                )}
                <iframe
                  src={CASE_STUDY_COMPETITION_EMBED_URL}
                  width="100%"
                  height="640"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  onLoad={() => setIframeLoaded(true)}
                  className="w-full"
                >
                  Loading…
                </iframe>
              </div>

              <div className="text-center text-xs text-slate-500 pt-1">
                Having trouble filling the embedded form?{' '}
                <a
                  href={CASE_STUDY_COMPETITION_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ec3013] font-bold underline hover:text-[#ae1800]"
                >
                  Open in a new tab here →
                </a>
              </div>
            </div>
          ) : (
            /* DETAILS TAB */
            <div className="space-y-5 text-left text-xs sm:text-sm">
              {/* Scenario Card */}
              <div className="bg-white border border-[#201e1d]/20 p-5 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-[#ae1800] flex items-center justify-between">
                  <span>This Week's Featured Case Study</span>
                  <span className="text-slate-500 font-bold">{challenge?.domain}</span>
                </div>
                <h3 className="text-lg font-black text-[#201e1d] m-0">
                  {challengeTitle}
                </h3>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm pt-1">
                  {challenge?.scenario ||
                    'A browser-based AI document assistant has high initial signups (100k/mo), but 45% of users generate only one prompt and never return. User interviews reveal prompt blank-slate anxiety.'}
                </p>
              </div>

              {/* Target Objectives & Constraints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#201e1d]/20 p-4 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-[#201e1d] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#ec3013]" />
                    Competition Target Objectives
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700">
                    {challenge?.targetObjectives?.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    )) || (
                      <>
                        <li>Increase 3-prompt activation rate on Day-1 from 28% to 58%.</li>
                        <li>Reduce time-to-first-successful-output to under 15 seconds.</li>
                        <li>Lift Day-14 weekly active user (WAU) retention from 18% to 32%.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-white border border-[#201e1d]/20 p-4 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-[#201e1d] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ec3013]" />
                    Operating Constraints
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700">
                    {challenge?.constraints?.map((c, i) => (
                      <li key={i}>{c}</li>
                    )) || (
                      <>
                        <li>LLM API token costs cannot exceed $0.08 per activated free user.</li>
                        <li>Must maintain sub-800ms generation response streaming latency.</li>
                        <li>No intrusive mandatory interactive tutorials or tooltip tours.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* How the Competition Works */}
              <div className="bg-[#201e1d] text-white p-5 border border-[#201e1d] space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#ec3013]" />
                  Competition Workflow & Evaluation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/10 p-3 rounded-none border border-white/10">
                    <div className="font-black text-[#ec3013] text-sm mb-1">Step 1</div>
                    <div className="font-bold text-white mb-0.5">Register Interest</div>
                    <div className="text-slate-300 text-[11px]">Submit the Google Form to enter the official participant list.</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-none border border-white/10">
                    <div className="font-black text-[#ec3013] text-sm mb-1">Step 2</div>
                    <div className="font-bold text-white mb-0.5">Draft Solution</div>
                    <div className="text-slate-300 text-[11px]">Structure your teardown, hypothesis, wireframe, and rollout metrics.</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-none border border-white/10">
                    <div className="font-black text-[#ec3013] text-sm mb-1">Step 3</div>
                    <div className="font-bold text-white mb-0.5">Submit on PMVerse</div>
                    <div className="text-slate-300 text-[11px]">Post your solution via the Weekly Challenge tool before Sunday midnight.</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-none border border-white/10">
                    <div className="font-black text-[#ec3013] text-sm mb-1">Step 4</div>
                    <div className="font-bold text-white mb-0.5">Live Leaderboard</div>
                    <div className="text-slate-300 text-[11px]">Receive AI rubric scores and feedback from Principal PM judges.</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('form')}
                  className="btn btn-primary text-xs font-bold py-2.5 px-5 w-full sm:w-auto"
                >
                  <span>Go to Interest Form</span>
                  <span>→</span>
                </button>

                {onOpenChallengeBrief && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChallengeBrief();
                    }}
                    className="btn btn-secondary text-xs font-bold py-2.5 px-5 w-full sm:w-auto flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Interactive Challenge Studio</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#201e1d]/20 flex items-center justify-between text-xs font-semibold shrink-0">
          <span className="text-slate-500 hidden sm:inline">
            Official PMVerse Weekly Case Study Competition · Week {weekLabel}
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary text-xs font-bold py-1.5 px-4"
            >
              Close
            </button>
            <a
              href={CASE_STUDY_COMPETITION_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-xs font-bold py-1.5 px-4 flex items-center gap-1.5"
            >
              <span>Submit Interest Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
