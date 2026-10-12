'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChallengeSubmission, WeeklyChallenge } from '@/types';
import {
  getCurrentWeeklyChallenge,
  getChallengeSubmissionsFromDb,
  submitChallengeSolutionToDb,
  upvoteChallengeSubmissionInDb,
} from '@/lib/supabase/database';
import {
  X,
  CheckCircle2,
  Sparkles,
  Award,
  Loader2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
  ShieldCheck,
  BarChart3,
  Lightbulb,
  Clock,
  Wand2,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface WeeklyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyChallengeModal: React.FC<WeeklyChallengeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'brief' | 'submit' | 'solutions'>('brief');

  // Challenge State (AI-generated every Monday)
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Form State
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionProposal, setSolutionProposal] = useState('');
  const [keyMetrics, setKeyMetrics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState('Diagnosing product sense & friction...');
  const [isEditing, setIsEditing] = useState(false);
  const [userSubmission, setUserSubmission] = useState<ChallengeSubmission | null>(null);

  // Community Submissions
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'upvotes' | 'score'>('upvotes');

  useEffect(() => {
    if (isOpen) {
      async function load() {
        setIsLoadingChallenge(true);
        const activeChallenge = await getCurrentWeeklyChallenge();
        setChallenge(activeChallenge);

        const subs = await getChallengeSubmissionsFromDb(activeChallenge.id);
        setSubmissions(subs);
        if (user) {
          const mine = subs.find((s) => s.userId === user.id);
          if (mine) {
            setUserSubmission(mine);
            setProblemStatement(mine.problemStatement);
            setSolutionProposal(mine.solutionProposal);
            setKeyMetrics(mine.keyMetrics);
          } else {
            setUserSubmission(null);
            setProblemStatement('');
            setSolutionProposal('');
            setKeyMetrics('');
          }
        }
        setIsLoadingChallenge(false);
      }
      load();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleRegenerateChallenge = async () => {
    if (isRegenerating || isSubmitting) return;
    setIsRegenerating(true);
    try {
      const freshChallenge = await getCurrentWeeklyChallenge(true); // force regeneration
      setChallenge(freshChallenge);
      const subs = await getChallengeSubmissionsFromDb(freshChallenge.id);
      setSubmissions(subs);
      setUserSubmission(null);
      setProblemStatement('');
      setSolutionProposal('');
      setKeyMetrics('');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to regenerate challenge:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    if (!problemStatement.trim() || !solutionProposal.trim() || !keyMetrics.trim()) return;

    const activeId = challenge?.id || 'challenge-current';
    const activeTitle = challenge?.title || 'Weekly PM Challenge';

    setIsSubmitting(true);
    setSubmittingStep('Diagnosing root-cause product friction...');

    const stepTimer1 = setTimeout(() => {
      setSubmittingStep('Validating feasibility & sprint constraints...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setSubmittingStep('Evaluating primary metrics & guardrails...');
    }, 2400);

    const stepTimer3 = setTimeout(() => {
      setSubmittingStep('Generating Senior PM rubric scorecard...');
    }, 3600);

    try {
      const res = await fetch('/api/challenge/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: activeId,
          challengeTitle: activeTitle,
          challengeScenario: challenge?.scenario,
          targetObjectives: challenge?.targetObjectives,
          constraints: challenge?.constraints,
          problemStatement: problemStatement.trim(),
          solutionProposal: solutionProposal.trim(),
          keyMetrics: keyMetrics.trim(),
          userRole: profile?.role || 'Associate PM',
        }),
      });

      const json = await res.json();
      const feedback = json?.data;

      const newSub: ChallengeSubmission = {
        id: userSubmission?.id || `sub-${Date.now()}`,
        challengeId: activeId,
        challengeTitle: activeTitle,
        userId: user.id,
        authorName:
          profile?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Product Manager',
        authorRole: profile?.role || 'Associate PM',
        authorAvatar: profile?.avatarUrl || '',
        problemStatement: problemStatement.trim(),
        solutionProposal: solutionProposal.trim(),
        keyMetrics: keyMetrics.trim(),
        upvotes: userSubmission?.upvotes || 1,
        hasUpvoted: true,
        aiFeedback: feedback,
        createdAt: 'Just now',
      };

      await submitChallengeSolutionToDb(newSub);
      setUserSubmission(newSub);
      setSubmissions((prev) => {
        const withoutOld = prev.filter((s) => s.id !== newSub.id && s.userId !== newSub.userId);
        return [newSub, ...withoutOld];
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (submissionId: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }
    const activeId = challenge?.id || 'challenge-current';

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, upvotes: s.upvotes + 1, hasUpvoted: true } : s
      )
    );
    await upvoteChallengeSubmissionInDb(submissionId, activeId);
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.aiFeedback?.overallScore || 0) - (a.aiFeedback?.overallScore || 0);
    }
    return b.upvotes - a.upvotes;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-3xl w-full shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b-2 border-[rgba(32,30,29,0.15)] flex justify-between items-start shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-widest text-[#ae1800] font-black flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 inline text-[#ec3013]" />
                Weekly PM Challenge #{challenge?.challengeNumber || 23}
              </span>
              <span className="text-[10px] bg-[#201e1d] text-white px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#ec3013]" />
                {challenge?.daysRemaining || 7} Days Left · Mon–Sun Sprint
              </span>
              {challenge?.domain && (
                <span className="text-[10px] bg-rose-100 text-[#ae1800] border border-rose-300 px-2 py-0.5 font-bold uppercase tracking-wider">
                  {challenge.domain}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#201e1d] tracking-tight m-0">
              {challenge?.title || 'Loading Active Weekly Challenge...'}
            </h2>
            <p className="text-xs text-[#605d5d] mt-1">
              AI-generated every Monday with authentic industry scenarios and graded by real Principal PM rubrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerateChallenge}
              disabled={isRegenerating || isLoadingChallenge}
              title="Generate fresh Monday challenge with AI"
              className="btn btn-secondary text-xs font-bold py-1.5 px-2.5 flex items-center gap-1.5 shrink-0"
            >
              {isRegenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ec3013]" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-[#ec3013]" />
              )}
              <span className="hidden sm:inline">New Challenge (AI)</span>
            </button>

            <button onClick={onClose} className="btn btn-icon btn-secondary shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Segmented Navigation */}
        <div className="flex border-b-2 border-[rgba(32,30,29,0.15)] bg-[#eae9e9] text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('brief')}
            className={`flex-1 py-3 px-3 sm:px-4 border-r border-[rgba(32,30,29,0.15)] transition-colors text-center ${
              activeTab === 'brief'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
            }`}
          >
            1. Challenge Brief
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-3 px-3 sm:px-4 border-r border-[rgba(32,30,29,0.15)] transition-colors text-center ${
              activeTab === 'submit'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
            }`}
          >
            {userSubmission && !isEditing
              ? `2. My Scorecard (${userSubmission.aiFeedback?.overallScore || 0}/100)`
              : '2. Submit Solution'}
          </button>
          <button
            onClick={() => setActiveTab('solutions')}
            className={`flex-1 py-3 px-3 sm:px-4 transition-colors text-center ${
              activeTab === 'solutions'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
            }`}
          >
            3. Peer Solutions ({submissions.length})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: BRIEF */}
          {activeTab === 'brief' && (
            <div className="space-y-5 text-sm">
              <div className="bg-[#eae9e9] p-4 border border-[rgba(32,30,29,0.15)] space-y-2">
                <div className="text-xs uppercase tracking-wider font-extrabold text-[#ae1800] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#ec3013]" />
                    Problem Scenario & Business Context
                  </span>
                  <span className="text-[10px] text-[#605d5d] font-bold">
                    Week {challenge?.weekIdentifier || '2026-W42'}
                  </span>
                </div>
                <p className="text-[#201e1d] leading-relaxed text-xs sm:text-sm">
                  {challenge?.scenario ||
                    'Loading active challenge scenario...'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[rgba(32,30,29,0.15)] p-4 bg-white">
                  <div className="text-xs uppercase tracking-wider font-extrabold text-[#201e1d] mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#ec3013]" />
                    Target Objectives
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-[#201e1d]">
                    {challenge?.targetObjectives?.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    )) || (
                      <li>Improve target funnel conversion rate.</li>
                    )}
                  </ul>
                </div>

                <div className="border border-[rgba(32,30,29,0.15)] p-4 bg-white">
                  <div className="text-xs uppercase tracking-wider font-extrabold text-[#201e1d] mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ec3013]" />
                    Product & Technical Constraints
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-[#201e1d]">
                    {challenge?.constraints?.map((c, i) => (
                      <li key={i}>{c}</li>
                    )) || (
                      <li>Pragmatic sprint engineering limit.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Rubric Breakdown Banner */}
              <div className="border border-[rgba(32,30,29,0.15)] p-4 bg-[#eae9e9]">
                <div className="text-xs uppercase tracking-wider font-extrabold text-[#201e1d] mb-2 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#ec3013]" />
                  AI Rubric Evaluation Weights
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 border border-[rgba(32,30,29,0.1)]">
                    <div className="text-[10px] text-[#605d5d] uppercase font-bold">Product Sense</div>
                    <div className="text-sm font-black text-[#201e1d]">
                      {challenge?.rubricWeights?.productSense || 30}%
                    </div>
                    <div className="text-[10px] text-[#605d5d]">Root friction vs symptom</div>
                  </div>
                  <div className="bg-white p-2.5 border border-[rgba(32,30,29,0.1)]">
                    <div className="text-[10px] text-[#605d5d] uppercase font-bold">Feasibility</div>
                    <div className="text-sm font-black text-[#201e1d]">
                      {challenge?.rubricWeights?.feasibility || 25}%
                    </div>
                    <div className="text-[10px] text-[#605d5d]">Sprint constraints fit</div>
                  </div>
                  <div className="bg-white p-2.5 border border-[rgba(32,30,29,0.1)]">
                    <div className="text-[10px] text-[#605d5d] uppercase font-bold">Metrics Rigor</div>
                    <div className="text-sm font-black text-[#201e1d]">
                      {challenge?.rubricWeights?.metrics || 25}%
                    </div>
                    <div className="text-[10px] text-[#605d5d]">Primary & guardrails</div>
                  </div>
                  <div className="bg-white p-2.5 border border-[rgba(32,30,29,0.1)]">
                    <div className="text-[10px] text-[#605d5d] uppercase font-bold">User Value</div>
                    <div className="text-sm font-black text-[#201e1d]">
                      {challenge?.rubricWeights?.userValue || 20}%
                    </div>
                    <div className="text-[10px] text-[#605d5d]">Aha moment & retention</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[rgba(32,30,29,0.15)]">
                <span className="text-xs text-[#605d5d]">
                  Peer community: {submissions.length} solutions submitted
                </span>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="btn btn-primary text-xs font-bold px-5 w-full sm:w-auto"
                >
                  <span>{userSubmission ? 'View My Scorecard' : 'Draft My Solution'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMIT / SCORECARD */}
          {activeTab === 'submit' && (
            <div>
              {userSubmission && !isEditing ? (
                /* Detailed Evaluation Scorecard */
                <div className="space-y-5">
                  {/* Score Card Header */}
                  <div className="bg-[#fff2ef] border-2 border-[#ec3013] p-5 text-left space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 pb-3">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-black text-[#ae1800] block">
                          Official AI Principal PM Evaluation
                        </span>
                        <div className="inline-block mt-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-[#201e1d] text-[#f3f2f2]">
                          {userSubmission.aiFeedback?.verdictLabel || 'Evaluated Solution'}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-[#ec3013]">
                          {userSubmission.aiFeedback?.overallScore || 80}
                        </span>
                        <span className="text-sm font-bold text-[#605d5d]">/100</span>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#605d5d] block mb-1">
                        Executive Verdict Summary
                      </span>
                      <p className="text-xs sm:text-sm text-[#201e1d] leading-relaxed font-semibold">
                        {userSubmission.aiFeedback?.summary}
                      </p>
                    </div>

                    {/* 4 Dimension Score Bars */}
                    <div className="pt-2 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-[#605d5d]">1. Product Sense & Friction</span>
                          <span className="text-[#201e1d]">
                            {userSubmission.aiFeedback?.productSenseScore || 8.0}/10
                          </span>
                        </div>
                        <div className="w-full bg-rose-200/50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#ec3013] h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, ((userSubmission.aiFeedback?.productSenseScore || 8.0) / 10) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-[#605d5d]">2. Feasibility & Scoping</span>
                          <span className="text-[#201e1d]">
                            {userSubmission.aiFeedback?.feasibilityScore || 8.0}/10
                          </span>
                        </div>
                        <div className="w-full bg-rose-200/50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#201e1d] h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, ((userSubmission.aiFeedback?.feasibilityScore || 8.0) / 10) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-[#605d5d]">3. Metrics & Guardrails</span>
                          <span className="text-[#201e1d]">
                            {userSubmission.aiFeedback?.metricsScore || 8.0}/10
                          </span>
                        </div>
                        <div className="w-full bg-rose-200/50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#ec3013] h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, ((userSubmission.aiFeedback?.metricsScore || 8.0) / 10) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-[#605d5d]">4. User Value & Aha Moment</span>
                          <span className="text-[#201e1d]">
                            {userSubmission.aiFeedback?.userValueScore || 8.0}/10
                          </span>
                        </div>
                        <div className="w-full bg-rose-200/50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#201e1d] h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, ((userSubmission.aiFeedback?.userValueScore || 8.0) / 10) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Improvements Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="border border-[rgba(32,30,29,0.15)] bg-white p-4">
                      <div className="text-xs uppercase tracking-wider font-black text-emerald-800 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Core Strengths Identified
                      </div>
                      <ul className="space-y-2 text-xs text-[#201e1d]">
                        {userSubmission.aiFeedback?.strengths?.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{str}</span>
                          </li>
                        )) || (
                          <li className="text-slate-500">Strong problem framing.</li>
                        )}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="border border-[rgba(32,30,29,0.15)] bg-white p-4">
                      <div className="text-xs uppercase tracking-wider font-black text-amber-900 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        High-Leverage Growth Areas
                      </div>
                      <ul className="space-y-2 text-xs text-[#201e1d]">
                        {userSubmission.aiFeedback?.improvements?.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">!</span>
                            <span>{imp}</span>
                          </li>
                        )) || (
                          <li className="text-slate-500">Consider additional guardrail metrics.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Principal PM Pro-Tip */}
                  {userSubmission.aiFeedback?.principalAdvice && (
                    <div className="bg-[#eae9e9] border-l-4 border-[#201e1d] p-4 text-xs space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#605d5d] flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-[#ec3013]" />
                        Principal PM Bar-Raiser Pro-Tip
                      </div>
                      <p className="text-[#201e1d] italic">
                        "{userSubmission.aiFeedback.principalAdvice}"
                      </p>
                    </div>
                  )}

                  {/* Readout of Submitted Solution */}
                  <div className="border border-[rgba(32,30,29,0.15)] p-4 bg-white space-y-3">
                    <div className="text-xs uppercase tracking-wider font-black text-[#201e1d] border-b pb-1.5">
                      Your Solution Submission
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#605d5d] block">
                        1. Problem Diagnosis
                      </span>
                      <p className="text-xs text-[#201e1d] mt-1 whitespace-pre-wrap leading-relaxed">
                        {userSubmission.problemStatement}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#605d5d] block">
                        2. Solution & UX Flow
                      </span>
                      <p className="text-xs text-[#201e1d] mt-1 whitespace-pre-wrap leading-relaxed">
                        {userSubmission.solutionProposal}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#605d5d] block">
                        3. Success & Counter-Metrics
                      </span>
                      <p className="text-xs text-[#201e1d] mt-1 whitespace-pre-wrap leading-relaxed">
                        {userSubmission.keyMetrics}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-secondary flex-1 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Revise & Resubmit to Improve Score</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('solutions')}
                      className="btn btn-primary flex-1 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Peer Solutions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isEditing && (
                    <div className="bg-[#eae9e9] p-3 border border-[rgba(32,30,29,0.15)] flex justify-between items-center text-xs">
                      <span className="font-bold text-[#201e1d]">
                        Editing your submission · Refine your diagnosis and metrics to achieve a higher score.
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-[#ec3013] font-bold hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-extrabold text-[#201e1d] mb-1">
                      1. Problem Diagnosis & Key Friction Point
                      <span className="text-[#ec3013] ml-1">*</span>
                    </label>
                    <p className="text-[11px] text-[#605d5d] mb-1.5">
                      Where exactly are users dropping off and why? Distinguish between user intent vs cognitive overhead.
                    </p>
                    <textarea
                      required
                      rows={3}
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      placeholder="e.g. Identify where users experience cognitive friction, confusion, or lack of value delivery..."
                      className="input text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#201e1d] mb-1">
                      2. Proposed Solution & UX Architecture
                      <span className="text-[#ec3013] ml-1">*</span>
                    </label>
                    <p className="text-[11px] text-[#605d5d] mb-1.5">
                      Outline the step-by-step revised flow, MVP scope, and how it resolves the friction point.
                    </p>
                    <textarea
                      required
                      rows={4}
                      value={solutionProposal}
                      onChange={(e) => setSolutionProposal(e.target.value)}
                      placeholder="e.g. Outline the step-by-step user flow, progressive disclosure mechanics, and practical engineering scoping..."
                      className="input text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#201e1d] mb-1">
                      3. Primary Metric & Counter-Metrics (Guardrails)
                      <span className="text-[#ec3013] ml-1">*</span>
                    </label>
                    <p className="text-[11px] text-[#605d5d] mb-1.5">
                      Specify the North Star input metric and at least two counter-metrics to avoid false-positive activation.
                    </p>
                    <textarea
                      required
                      rows={2}
                      value={keyMetrics}
                      onChange={(e) => setKeyMetrics(e.target.value)}
                      placeholder="Primary: Day-1 Activation / Conversion Rate. Guardrails: Churn, Drop-off rate, Satisfaction score."
                      className="input text-xs leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[rgba(32,30,29,0.15)]">
                    <span className="text-[11px] text-[#605d5d]">
                      Evaluated by AI Principal PM against active challenge rubric
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary text-xs font-bold px-6 py-2.5 w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{submittingStep}</span>
                        </span>
                      ) : (
                        <span>
                          {isEditing ? 'Re-Evaluate Refined Solution' : 'Submit Solution for AI Rubric Grading'}
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY SOLUTIONS */}
          {activeTab === 'solutions' && (
            <div className="space-y-4">
              {/* Filter / Sort Bar */}
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[rgba(32,30,29,0.15)]">
                <span className="font-bold text-[#605d5d]">
                  Showing {sortedSubmissions.length} PM solutions
                </span>
                <div className="flex items-center gap-1 bg-[#eae9e9] p-1 border border-[rgba(32,30,29,0.15)] font-bold text-[11px]">
                  <button
                    onClick={() => setSortBy('upvotes')}
                    className={`px-2.5 py-1 ${
                      sortBy === 'upvotes' ? 'bg-[#201e1d] text-white' : 'text-[#201e1d]'
                    }`}
                  >
                    Most Upvoted
                  </button>
                  <button
                    onClick={() => setSortBy('score')}
                    className={`px-2.5 py-1 ${
                      sortBy === 'score' ? 'bg-[#201e1d] text-white' : 'text-[#201e1d]'
                    }`}
                  >
                    Highest AI Score
                  </button>
                </div>
              </div>

              {/* Submissions list */}
              <div className="space-y-4">
                {sortedSubmissions.map((sub) => {
                  const isExpanded = expandedSubId === sub.id;
                  const isMine = user && sub.userId === user.id;

                  return (
                    <div
                      key={sub.id}
                      className={`bg-white border text-left space-y-3 p-4 transition-shadow ${
                        isMine
                          ? 'border-[#ec3013] shadow-md ring-1 ring-[#ec3013]/20'
                          : 'border-[rgba(32,30,29,0.15)] hover:shadow-sm'
                      }`}
                    >
                      {/* Sub Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={sub.authorName} src={sub.authorAvatar} size="sm" />
                          <div>
                            <div className="font-extrabold text-xs text-[#201e1d] flex items-center gap-1.5">
                              <span>{sub.authorName}</span>
                              {isMine && (
                                <span className="bg-[#ec3013] text-white text-[9px] px-1.5 py-0.2 font-bold uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#605d5d]">
                              {sub.authorRole} · {sub.createdAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {sub.aiFeedback && (
                            <div className="text-right">
                              <span className="tag tag-accent text-[11px] font-black">
                                {sub.aiFeedback.overallScore}/100
                              </span>
                              {sub.aiFeedback.verdictLabel && (
                                <div className="text-[9px] text-[#605d5d] font-bold">
                                  {sub.aiFeedback.verdictLabel}
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => handleUpvote(sub.id)}
                            className={`btn text-xs font-bold py-1 px-2.5 flex items-center gap-1 ${
                              sub.hasUpvoted
                                ? 'bg-[#ec3013] text-white'
                                : 'btn-secondary'
                            }`}
                          >
                            <span>▲</span>
                            <span>{sub.upvotes}</span>
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-xs space-y-2 text-[#201e1d]">
                        <div className="bg-[#f9f8f8] p-2.5 border border-[rgba(32,30,29,0.06)]">
                          <strong className="text-[#605d5d] block text-[10px] uppercase font-bold mb-0.5">
                            Diagnosis:
                          </strong>
                          <p className="leading-relaxed">{sub.problemStatement}</p>
                        </div>

                        <div className="bg-[#f9f8f8] p-2.5 border border-[rgba(32,30,29,0.06)]">
                          <strong className="text-[#605d5d] block text-[10px] uppercase font-bold mb-0.5">
                            Solution Flow:
                          </strong>
                          <p className="leading-relaxed">{sub.solutionProposal}</p>
                        </div>

                        <div className="bg-[#f9f8f8] p-2.5 border border-[rgba(32,30,29,0.06)]">
                          <strong className="text-[#605d5d] block text-[10px] uppercase font-bold mb-0.5">
                            Metrics & Guardrails:
                          </strong>
                          <p className="leading-relaxed">{sub.keyMetrics}</p>
                        </div>
                      </div>

                      {/* AI Feedback toggle */}
                      {sub.aiFeedback && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                            className="text-[11px] font-bold text-[#ae1800] hover:text-[#ec3013] flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide AI Rubric Analysis' : 'Inspect AI Rubric Analysis'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-3.5 bg-[#fff2ef] border border-[#ec3013]/30 text-xs space-y-2 animate-in fade-in duration-100">
                              <p className="font-semibold text-[#201e1d] leading-relaxed">
                                {sub.aiFeedback.summary}
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-rose-200 text-[11px]">
                                <div>
                                  <span className="text-[#605d5d] text-[9px] uppercase font-bold block">
                                    Product Sense
                                  </span>
                                  <strong className="text-[#201e1d]">
                                    {sub.aiFeedback.productSenseScore || 8.0}/10
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[#605d5d] text-[9px] uppercase font-bold block">
                                    Feasibility
                                  </span>
                                  <strong className="text-[#201e1d]">
                                    {sub.aiFeedback.feasibilityScore || 8.0}/10
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[#605d5d] text-[9px] uppercase font-bold block">
                                    Metrics
                                  </span>
                                  <strong className="text-[#201e1d]">
                                    {sub.aiFeedback.metricsScore || 8.0}/10
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[#605d5d] text-[9px] uppercase font-bold block">
                                    User Value
                                  </span>
                                  <strong className="text-[#201e1d]">
                                    {sub.aiFeedback.userValueScore || 8.0}/10
                                  </strong>
                                </div>
                              </div>

                              {sub.aiFeedback.strengths && sub.aiFeedback.strengths.length > 0 && (
                                <div className="pt-1 border-t border-rose-200">
                                  <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                                    Strengths:
                                  </span>
                                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#201e1d]">
                                    {sub.aiFeedback.strengths.map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {sortedSubmissions.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-[rgba(32,30,29,0.2)] bg-[#f9f8f8] p-6 space-y-2">
                    <div className="text-xl">✍️</div>
                    <div className="font-black text-[#201e1d] text-sm">
                      No peer solutions submitted yet
                    </div>
                    <p className="text-xs text-[#605d5d] max-w-sm mx-auto">
                      Be the first Product Manager to solve this week's challenge and receive an official AI rubric score.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('submit')}
                      className="btn btn-primary text-xs font-bold mt-2"
                    >
                      Draft First Solution →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
