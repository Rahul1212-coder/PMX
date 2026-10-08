'use client';

import React, { useState } from 'react';
import { AssessmentQuestion, AssessmentResult } from '../types';
import { Compass, CheckCircle2, RotateCcw, ArrowRight, Award, Brain, BarChart3, Target, ShieldCheck } from 'lucide-react';

interface AssessmentQuizProps {
  questions: AssessmentQuestion[];
}

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ questions }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const currentQ = questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

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

  const calculateResult = () => {
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

    setResult({
      scorePercentage,
      archetype,
      summary,
      dimensionScores,
      strengths,
      growthAreas,
      recommendedRole,
    });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Is Product Management an Ideal Fit for You?
          </h1>
          <p className="mt-2 text-amber-100 text-sm sm:text-base">
            Take this scenario-based situational judgment assessment. We evaluate your user empathy, metric rigor, ruthless prioritization, and stakeholder navigation.
          </p>
        </div>
      </div>

      {!result ? (
        /* Quiz Interface */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="text-indigo-600">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Dimension Tag */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              {currentQ.dimension}
            </span>
          </div>

          {/* Question Scenario */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.scenario}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.score;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, opt.score)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-slate-800 font-medium leading-relaxed">
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
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 transition"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQ.id]}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition shadow"
            >
              <span>{currentIdx === questions.length - 1 ? 'Calculate My Fit' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          {/* Top Score Banner */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white text-2xl font-black shadow-lg">
              {result.scorePercentage}%
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Fit Archetype: {result.archetype}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Recommended Track: {result.recommendedRole}
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Dimension Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Core Competency Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.dimensionScores.map((ds, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>{ds.dimension}</span>
                    <span className="text-indigo-600 font-bold">{ds.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${ds.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Key Natural Strengths</span>
              </h4>
              <ul className="text-xs sm:text-sm text-emerald-950 space-y-2">
                {result.strengths.map((str, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-2">
                <Target className="w-4 h-4 text-amber-600" />
                <span>High-Leverage Development Areas</span>
              </h4>
              <ul className="text-xs sm:text-sm text-amber-950 space-y-2">
                {result.growthAreas.map((area, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">→</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <button
              onClick={handleRetake}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Assessment</span>
            </button>

            <div className="text-xs text-slate-500">
              💡 Tip: Review the <strong>AI Term Tutor</strong> tab to strengthen frameworks where you scored lower!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
