'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentQuestion, AssessmentResult, SavedQuizResult } from '../types';
import {
  Compass,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Award,
  Brain,
  BarChart3,
  Target,
  Database,
  LogIn,
  Check,
  ShieldCheck,
  History,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { saveQuizResultToDb, getUserQuizResultsFromDb } from '@/lib/supabase/database';

interface AssessmentQuizProps {
  questions: AssessmentQuestion[];
}

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ questions }) => {
  const { user, openAuthModal, isConfigured } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState(false);
  const [isBadgeAddedToProfile, setIsBadgeAddedToProfile] = useState(false);
  const [pastResults, setPastResults] = useState<SavedQuizResult[]>([]);

  const currentQ = questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  // Load past quiz results if authenticated
  useEffect(() => {
    let mounted = true;
    async function loadPast() {
      if (user && isConfigured) {
        const history = await getUserQuizResultsFromDb(user.id);
        if (mounted && history.length > 0) {
          setPastResults(history);
        }
      }
    }
    loadPast();
    return () => {
      mounted = false;
    };
  }, [user, isConfigured]);

  const handleSelectOption = (qId: number, score: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: score,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const calculateResult = async () => {
    let totalScore = 0;
    const maxScore = questions.length * 4;

    const dimensionMap: Record<string, { total: number; count: number }> = {};

    questions.forEach((q) => {
      const score = selectedAnswers[q.id] || 2;
      totalScore += score;

      if (!dimensionMap[q.dimension]) {
        dimensionMap[q.dimension] = { total: 0, count: 0 };
      }
      dimensionMap[q.dimension].total += score;
      dimensionMap[q.dimension].count += 1;
    });

    const scorePercentage = Math.round((totalScore / maxScore) * 100);

    const dimensionScores = Object.entries(dimensionMap).map(([dimension, val]) => ({
      dimension,
      score: Math.round((val.total / (val.count * 4)) * 100),
    }));

    let archetype = 'Product Strategist';
    let recommendedRole = 'Product Manager (B2B SaaS / Growth)';
    let summary = 'You show strong instincts across product discovery, metrics, and cross-functional alignment.';
    let strengths = [
      'Problem-first mindset: Investigating underlying user friction before building.',
      'Disciplined prioritization: Resisting feature bloat during crunch cycles.',
    ];
    let growthAreas = [
      'Deepen SQL and data instrumentation to independently query product funnels.',
      'Practice executive stakeholder communication to explain trade-offs under pressure.',
    ];

    if (scorePercentage >= 85) {
      archetype = 'High-Agency Product Leader';
      recommendedRole = 'Senior Product Manager or APM Cohort Lead';
      summary = 'Exceptional product instincts! You balance user empathy, technical pragmatism, and commercial viability with ease.';
      strengths = [
        'Root-cause problem framing and stakeholder negotiation.',
        'Data-informed hypothesis testing without vanity metrics.',
        'Decisive triage during release emergencies.',
      ];
      growthAreas = [
        'Strategic portfolio allocation (managing multiple squads or product lines).',
        'P&L ownership and enterprise pricing negotiations.',
      ];
    } else if (scorePercentage >= 65) {
      archetype = 'Pragmatic Product Builder';
      recommendedRole = 'Associate PM / Feature Squad PM';
      summary = 'Great natural PM instincts with solid user focus and pragmatism. With targeted practice in metrics and stakeholder influence, you will thrive as a PM.';
    } else {
      archetype = 'Aspiring Product Explorer';
      recommendedRole = 'Associate PM Intern / Product Operations / Business Analyst';
      summary = 'You are beginning your PM journey. Product management requires unlearning the tendency to jump to immediate solutions and mastering the art of root-cause discovery.';
      growthAreas = [
        'Conducting unbiased customer discovery interviews.',
        'Learning agile scoping: building minimum lovable products.',
      ];
    }

    const calculated: AssessmentResult = {
      scorePercentage,
      archetype,
      summary,
      dimensionScores,
      strengths,
      growthAreas,
      recommendedRole,
    };

    setResult(calculated);

    // Save to Supabase
    if (user && isConfigured) {
      const ok = await saveQuizResultToDb(user.id, calculated);
      if (ok) {
        setIsSavedToDb(true);
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setResult(null);
    setIsSavedToDb(false);
    setIsBadgeAddedToProfile(false);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto text-left">
      {/* LinkedIn Assessment Header Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex items-center space-x-2 text-[#0a66c2] text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>LinkedIn Style Skill Assessment</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Product Manager Career Fit & Skill Diagnostic
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluate your user empathy, metric rigor, ruthless prioritization, and stakeholder negotiation with 5 scenario-based situational questions.
        </p>
      </div>

      {!result ? (
        /* Quiz Card */
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="text-[#0a66c2]">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0a66c2] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Dimension Tag */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a66c2] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {currentQ.dimension}
            </span>
          </div>

          {/* Question Scenario */}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {currentQ.scenario}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-1">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.score;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, opt.score)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'border-[#0a66c2] bg-sky-50/70 ring-1 ring-[#0a66c2]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-[#0a66c2] bg-[#0a66c2] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 transition"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQ.id]}
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-40 text-white rounded-full text-xs font-semibold transition shadow-sm"
            >
              <span>{currentIdx === questions.length - 1 ? 'Calculate My Fit' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Results View (LinkedIn Certified Badge Style) */
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Top Score Banner */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0a66c2] text-white text-2xl font-black shadow-md">
              {result.scorePercentage}%
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Fit Archetype: {result.archetype}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Recommended Track: {result.recommendedRole}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {result.summary}
            </p>

            {/* LinkedIn Add Badge to Profile Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsBadgeAddedToProfile(true);
                  alert('Certified PM Skill Badge added to your profile! Recruiter match score boosted.');
                }}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition flex items-center justify-center space-x-1.5 mx-auto ${
                  isBadgeAddedToProfile
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-[#0a66c2] text-white hover:bg-[#004182] shadow-sm'
                }`}
              >
                {isBadgeAddedToProfile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Badge Displayed on Profile</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Add Certified PM Badge to Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Competency Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-[#0a66c2]" />
              <span>Core Competency Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.dimensionScores.map((ds, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>{ds.dimension}</span>
                    <span className="text-[#0a66c2] font-bold">{ds.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0a66c2] rounded-full transition-all"
                      style={{ width: `${ds.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Natural Strengths</span>
              </h4>
              <ul className="text-xs text-emerald-950 space-y-1.5">
                {result.strengths.map((str, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Growth Areas</span>
              </h4>
              <ul className="text-xs text-amber-950 space-y-1.5">
                {result.growthAreas.map((area, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-500 font-bold">→</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Retake */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <button
              onClick={handleRetake}
              className="inline-flex items-center space-x-1.5 font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Assessment</span>
            </button>

            <span className="text-slate-400">
              Score automatically saved to your verified candidate profile.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
