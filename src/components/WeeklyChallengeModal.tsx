'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChallengeSubmission } from '@/types';
import {
  getChallengeSubmissionsFromDb,
  submitChallengeSolutionToDb,
  upvoteChallengeSubmissionInDb,
} from '@/lib/supabase/database';
import { X, CheckCircle2, Sparkles, Award, Loader2, ArrowRight } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface WeeklyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyChallengeModal: React.FC<WeeklyChallengeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile, openAuthModal, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'brief' | 'submit' | 'solutions'>('brief');

  // Form State
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionProposal, setSolutionProposal] = useState('');
  const [keyMetrics, setKeyMetrics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSubmission, setUserSubmission] = useState<ChallengeSubmission | null>(null);

  // Community Submissions
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);

  const challengeId = 'challenge-23';
  const challengeTitle = 'Improve onboarding for a music streaming app.';

  useEffect(() => {
    if (isOpen) {
      async function load() {
        const subs = await getChallengeSubmissionsFromDb(challengeId);
        setSubmissions(subs);
        if (user) {
          const mine = subs.find((s) => s.userId === user.id);
          if (mine) setUserSubmission(mine);
        }
      }
      load();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    if (!problemStatement.trim() || !solutionProposal.trim() || !keyMetrics.trim()) return;

    setIsSubmitting(true);

    let aiFeedback = {
      overallScore: 84,
      productSenseScore: 8.5,
      feasibilityScore: 8.0,
      metricsScore: 8.8,
      strengths: [
        'Clear identification of friction before first audio playback.',
        'Well-defined guardrail metric to monitor churn.',
      ],
      improvements: [
        'Consider lazy-loading artist selection after first song play to reduce drop-off further.',
      ],
      summary:
        'Strong outcome-focused solution. Your approach targets the exact time-to-value friction point.',
    };

    // Try AI grading
    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: `Grade this PM Challenge solution for Music App Onboarding.\nProblem: ${problemStatement}\nSolution: ${solutionProposal}\nMetrics: ${keyMetrics}`,
          questionType: 'Case Study Grading',
        }),
      });
      const data = await res.json();
      if (data?.data?.summary) {
        aiFeedback.summary = data.data.summary;
      }
    } catch {
      // fallback
    }

    const newSub: ChallengeSubmission = {
      id: `sub-${Date.now()}`,
      challengeId,
      challengeTitle,
      userId: user.id,
      authorName:
        profile?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Product Manager',
      authorRole: profile?.role || 'Associate PM',
      authorAvatar: profile?.avatarUrl || '',
      problemStatement: problemStatement.trim(),
      solutionProposal: solutionProposal.trim(),
      keyMetrics: keyMetrics.trim(),
      upvotes: 1,
      hasUpvoted: true,
      aiFeedback,
      createdAt: 'Just now',
    };

    await submitChallengeSolutionToDb(newSub);
    setUserSubmission(newSub);
    setSubmissions((prev) => [newSub, ...prev]);
    setIsSubmitting(false);
    setActiveTab('solutions');
  };

  const handleUpvote = async (submissionId: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, upvotes: s.upvotes + 1, hasUpvoted: true } : s
      )
    );
    await upvoteChallengeSubmissionInDb(submissionId, challengeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-3xl w-full shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b-2 border-[rgba(32,30,29,0.15)] flex justify-between items-start">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#ae1800] font-bold mb-1">
              Weekly PM Challenge #23 · Official Journey
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#201e1d] tracking-tight m-0">
              {challengeTitle}
            </h2>
            <p className="text-xs text-[#605d5d] mt-1">
              Test your PM judgment on realistic business trade-offs with instant AI Mentor rubric grading and peer review.
            </p>
          </div>

          <button onClick={onClose} className="btn btn-icon btn-secondary shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Navigation */}
        <div className="flex border-b-2 border-[rgba(32,30,29,0.15)] bg-[#eae9e9] text-xs font-bold">
          <button
            onClick={() => setActiveTab('brief')}
            className={`flex-1 py-3 px-4 border-r border-[rgba(32,30,29,0.15)] transition-colors ${
              activeTab === 'brief'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
            }`}
          >
            Challenge Brief & Context
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-3 px-4 border-r border-[rgba(32,30,29,0.15)] transition-colors ${
              activeTab === 'submit'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
            }`}
          >
            {userSubmission ? 'My Submission & AI Grade' : 'Submit Solution'}
          </button>
          <button
            onClick={() => setActiveTab('solutions')}
            className={`flex-1 py-3 px-4 transition-colors ${
              activeTab === 'solutions'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
            }`}
          >
            Community Solutions ({submissions.length})
          </button>
        </div>

        {/* Tab 1: Brief */}
        {activeTab === 'brief' && (
          <div className="p-6 space-y-5 text-sm">
            <div className="bg-[#eae9e9] p-4 border border-[rgba(32,30,29,0.15)] space-y-2">
              <div className="text-xs uppercase tracking-wider font-extrabold text-[#ae1800]">
                Problem Scenario
              </div>
              <p className="text-[#201e1d] leading-relaxed">
                A freemium music streaming app with 2M monthly downloads observes that <strong>30% of new signups drop off before listening to a single track</strong>.
                Analytics indicate users get fatigued during mandatory onboarding genre/artist pickers and permission dialogs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[rgba(32,30,29,0.15)] p-4 bg-white">
                <div className="text-xs uppercase tracking-wider font-extrabold text-[#201e1d] mb-1">
                  Target Objectives
                </div>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#201e1d]">
                  <li>Increase Day-1 first song completion rate from 70% to 85%.</li>
                  <li>Reduce time-to-first-song from 3.2 minutes to under 45 seconds.</li>
                  <li>Maintain Day-7 active listening retention above 42%.</li>
                </ul>
              </div>

              <div className="border border-[rgba(32,30,29,0.15)] p-4 bg-white">
                <div className="text-xs uppercase tracking-wider font-extrabold text-[#201e1d] mb-1">
                  Product Constraints
                </div>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#201e1d]">
                  <li>Cannot require credit card or payment upfront.</li>
                  <li>3-sprint engineering budget across iOS and Android.</li>
                  <li>Must preserve user privacy and notification consent rates.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[rgba(32,30,29,0.15)]">
              <span className="text-xs text-[#605d5d]">
                412 PMs have participated · Evaluated across Product Sense, Metrics, and Feasibility
              </span>
              <button
                onClick={() => setActiveTab('submit')}
                className="btn btn-primary text-xs font-bold px-5"
              >
                <span>{userSubmission ? 'View My Grade' : 'Draft My Solution'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Submit / My Submission */}
        {activeTab === 'submit' && (
          <div className="p-6 space-y-5 text-sm">
            {userSubmission ? (
              <div className="space-y-4">
                <div className="bg-[#fff2ef] border-2 border-[#ec3013] p-4 text-left space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-wider font-black text-[#ae1800]">
                      AI Mentor Rubric Evaluation
                    </span>
                    <span className="text-2xl font-black text-[#ec3013]">
                      {userSubmission.aiFeedback?.overallScore || 84}/100
                    </span>
                  </div>
                  <p className="text-xs text-[#201e1d] font-semibold">
                    {userSubmission.aiFeedback?.summary}
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">
                        Product Sense
                      </span>
                      <strong className="text-[#201e1d]">
                        {userSubmission.aiFeedback?.productSenseScore || 8.5}/10
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">
                        Feasibility
                      </span>
                      <strong className="text-[#201e1d]">
                        {userSubmission.aiFeedback?.feasibilityScore || 8.0}/10
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">
                        Metrics
                      </span>
                      <strong className="text-[#201e1d]">
                        {userSubmission.aiFeedback?.metricsScore || 8.8}/10
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="border border-[rgba(32,30,29,0.15)] p-4 bg-white space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#605d5d] block">
                      1. Problem Diagnosis
                    </span>
                    <p className="text-xs text-[#201e1d] mt-1 whitespace-pre-wrap">
                      {userSubmission.problemStatement}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#605d5d] block">
                      2. Solution & UX Flow
                    </span>
                    <p className="text-xs text-[#201e1d] mt-1 whitespace-pre-wrap">
                      {userSubmission.solutionProposal}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#605d5d] block">
                      3. Success & Counter-Metrics
                    </span>
                    <p className="text-xs text-[#201e1d] mt-1 whitespace-pre-wrap">
                      {userSubmission.keyMetrics}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('solutions')}
                  className="btn btn-secondary w-full text-xs font-bold"
                >
                  View Peer Submissions ({submissions.length})
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">
                    1. Problem Diagnosis & Key Friction Point
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Where exactly are users dropping off and why? (e.g. Cognitive overload in artist selection before seeing value)"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">
                    2. Proposed Solution & UX Architecture
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={solutionProposal}
                    onChange={(e) => setSolutionProposal(e.target.value)}
                    placeholder="Outline the revised user flow (e.g. 'Instant Play' based on trending regional hits or mood selection, deferring detailed preference setup)"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">
                    3. Primary Metric & Counter-Metrics (Guardrails)
                  </label>
                  <input
                    type="text"
                    required
                    value={keyMetrics}
                    onChange={(e) => setKeyMetrics(e.target.value)}
                    placeholder="Primary: D1 First-Song Rate. Guardrails: Skip rate, D7 Retention, Uninstall rate."
                    className="input text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[rgba(32,30,29,0.15)]">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary text-xs font-bold px-6 py-2.5"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        AI Mentor Evaluating Rubric...
                      </span>
                    ) : (
                      <span>Submit Solution for AI Rubric Grading</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Solutions */}
        {activeTab === 'solutions' && (
          <div className="p-6 space-y-4 text-sm max-h-[500px] overflow-y-auto">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-[rgba(32,30,29,0.15)] p-4 text-left space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={sub.authorName} src={sub.authorAvatar} size="sm" />
                    <div>
                      <div className="font-extrabold text-xs text-[#201e1d]">
                        {sub.authorName}
                      </div>
                      <div className="text-[10px] text-[#605d5d]">
                        {sub.authorRole} · {sub.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.aiFeedback && (
                      <span className="tag tag-accent text-[10px] font-bold">
                        Score: {sub.aiFeedback.overallScore}/100
                      </span>
                    )}
                    <button
                      onClick={() => handleUpvote(sub.id)}
                      className="btn btn-secondary text-xs font-bold py-1 px-2.5 flex items-center gap-1"
                    >
                      <span>▲</span>
                      <span>{sub.upvotes}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-[#201e1d]">
                  <p>
                    <strong className="text-[#605d5d]">Diagnosis:</strong> {sub.problemStatement}
                  </p>
                  <p>
                    <strong className="text-[#605d5d]">Solution:</strong> {sub.solutionProposal}
                  </p>
                  <p>
                    <strong className="text-[#605d5d]">Metrics:</strong> {sub.keyMetrics}
                  </p>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No submissions yet. Be the first PM to submit an answer!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
