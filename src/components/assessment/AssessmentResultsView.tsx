'use client';

import React, { useState } from 'react';
import {
  AssessmentAttempt,
  AssessmentLevelConfig,
  CompetencyCategory,
} from '@/types/assessment';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Filter,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface AssessmentResultsViewProps {
  attempt: AssessmentAttempt;
  levelConfig: AssessmentLevelConfig;
  onRetake: () => void;
  onBackToDashboard: () => void;
  onGoToNextLevel?: () => void;
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({
  attempt,
  levelConfig,
  onRetake,
  onBackToDashboard,
  onGoToNextLevel,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'written'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const isPassed = attempt.isPassed;
  const score = attempt.scorePercentage ?? 0;

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const filteredReviews = (attempt.questionReviews || []).filter((q) => {
    if (filterMode === 'incorrect') return q.isCorrect === false;
    if (filterMode === 'written') return q.format === 'written_case';
    return true;
  });

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const nextLevelMap: Record<string, string> = {
    beginner: 'intermediate',
    intermediate: 'advanced',
  };
  const hasNextLevel = isPassed && Boolean(nextLevelMap[levelConfig.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      {/* 1. Score Summary Banner */}
      <div
        className={`bg-white border-2 p-6 sm:p-8 shadow-sm ${
          isPassed ? 'border-emerald-600' : 'border-[#201e1d]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-[rgba(32,30,29,0.15)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag tag-accent font-bold text-[10px] uppercase tracking-wider">
                Official Result Audit
              </span>
              <span
                className={`tag font-bold text-[10px] ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {isPassed ? '✓ Passed (Proficient)' : 'Developing (Needs Improvement)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#201e1d] tracking-tight m-0">
              {levelConfig.title}
            </h1>
            <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
              {isPassed
                ? `Outstanding performance! You cleared the ${levelConfig.passingScorePercent}% proficiency bar and officially demonstrated strong capability at this level.`
                : `You scored ${score}%, which is below the ${levelConfig.passingScorePercent}% passing threshold. Review the detailed feedback and recommendations below before retaking.`}
            </p>
          </div>

          {/* Big Score Meter */}
          <div className="p-4 bg-[#f3f2f2] border-2 border-[#201e1d] flex flex-col items-center justify-center min-w-[170px] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Overall Score
            </span>
            <div
              className={`text-4xl sm:text-5xl font-black my-1 leading-none ${
                isPassed ? 'text-emerald-700' : 'text-[#ec3013]'
              }`}
            >
              {score}%
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              Passing: {levelConfig.passingScorePercent}%
            </span>
          </div>
        </div>

        {/* Quick KPI stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-3 bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Time Taken</span>
            <span className="font-bold text-xs text-[#201e1d] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatMinutes(attempt.timeSpentSeconds)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Objective Accuracy</span>
            <span className="font-bold text-xs text-[#201e1d]">
              {attempt.totalCorrect} / {attempt.totalQuestions} Questions
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Certification Status</span>
            <span className={`font-bold text-xs ${isPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isPassed ? 'Level Unlocked' : 'Retake Eligible'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Attempt Date</span>
            <span className="font-bold text-xs text-[#201e1d]">
              {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'Today'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-6">
          <button
            onClick={onBackToDashboard}
            className="btn btn-secondary text-xs font-bold py-2 px-4"
          >
            Back to Assessment Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onRetake}
              className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Test
            </button>

            {hasNextLevel && onGoToNextLevel && (
              <button
                onClick={onGoToNextLevel}
                className="btn btn-primary text-xs font-bold uppercase tracking-wider py-2 px-5 flex items-center gap-1.5 shadow"
              >
                Proceed to Next Tier <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Competency Scores Breakdown Grid */}
      {attempt.competencyScores && (
        <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ec3013]" />
              <h2 className="text-lg font-black text-[#201e1d] m-0">
                Competency Breakdown & Weights
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-bold">5 Core Disciplines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(attempt.competencyScores).map((cs) => (
              <div key={cs.category} className="p-4 bg-[#f8f7f6] border border-[#201e1d]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#201e1d]">{cs.category}</span>
                  <span
                    className={`font-mono font-black text-sm ${
                      cs.scorePercentage >= 70
                        ? 'text-emerald-700'
                        : cs.scorePercentage >= 50
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {cs.scorePercentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 border border-slate-400 overflow-hidden">
                  <div
                    className={`h-full ${
                      cs.scorePercentage >= 70
                        ? 'bg-emerald-600'
                        : cs.scorePercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${cs.scorePercentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-1">
                  <span>Weight: {Math.round(cs.weight * 100)}%</span>
                  <span>{cs.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="p-4 bg-emerald-50/60 border border-emerald-300">
              <span className="font-black text-xs text-emerald-950 uppercase tracking-wider block mb-2">
                ✓ Identified Key Strengths
              </span>
              <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                {attempt.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✔</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-300">
              <span className="font-black text-xs text-amber-950 uppercase tracking-wider block mb-2">
                ⚡ Priority Growth Areas
              </span>
              <ul className="space-y-1.5 text-xs text-amber-900 font-medium">
                {attempt.growthAreas?.map((g, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-700 font-bold">▲</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. Targeted Learning Recommendations (Driven by Actual Results) */}
      {attempt.recommendations && attempt.recommendations.length > 0 && (
        <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#ec3013]" />
              <h2 className="text-lg font-black text-[#201e1d] m-0">
                Targeted Learning Recommendations
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-bold">Driven by Your Assessment Data</span>
          </div>

          <div className="space-y-3">
            {attempt.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 bg-[#f8f7f6] border border-[#201e1d]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-[#201e1d]">{rec.topic}</span>
                    <span className="tag bg-slate-200 text-slate-700 text-[9px] font-bold">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>
                  <p className="text-xs text-[#ec3013] font-semibold">{rec.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Question-by-Question Deep Audit */}
      <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
          <div>
            <h2 className="text-lg font-black text-[#201e1d] m-0">Question-by-Question Review</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed explanations of correct answers and why each alternative option was incorrect.
            </p>
          </div>

          {/* Filter toggle */}
          <div className="flex border border-[#201e1d] text-xs font-bold divide-x divide-[#201e1d]">
            <button
              onClick={() => setFilterMode('all')}
              className={`py-1 px-3 ${filterMode === 'all' ? 'bg-[#201e1d] text-white' : 'hover:bg-slate-100'}`}
            >
              All ({attempt.questionReviews?.length || 0})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`py-1 px-3 ${filterMode === 'incorrect' ? 'bg-[#201e1d] text-white' : 'hover:bg-slate-100'}`}
            >
              Incorrect ({(attempt.questionReviews || []).filter((q) => q.isCorrect === false).length})
            </button>
            {levelConfig.id === 'advanced' && (
              <button
                onClick={() => setFilterMode('written')}
                className={`py-1 px-3 ${filterMode === 'written' ? 'bg-[#201e1d] text-white' : 'hover:bg-slate-100'}`}
              >
                Written Cases (4)
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredReviews.map((rev, idx) => {
            const isExpanded = expandedQuestions.has(rev.questionId);
            const isCorrect = rev.isCorrect;
            const isWritten = rev.format === 'written_case';

            return (
              <div
                key={rev.questionId}
                className={`border-2 transition-colors ${
                  isWritten
                    ? 'border-blue-400 bg-blue-50/20'
                    : isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(rev.questionId)}
                  className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">
                      {isWritten ? (
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-[#201e1d]">
                          Q{idx + 1}. {rev.title}
                        </span>
                        <span className="tag bg-slate-100 text-slate-700 text-[9px] font-bold">
                          {rev.competency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-1">{rev.questionText}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-xs">
                      {rev.scoreEarned} / {rev.maxScore} Pts
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Collapsible Detail Section */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-200/60 mt-2 space-y-4 text-xs">
                    {/* Scenario */}
                    {rev.scenario && (
                      <div className="p-3 bg-white border border-slate-200 font-serif text-slate-800 leading-relaxed">
                        <span className="font-sans text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Scenario Context:
                        </span>
                        {rev.scenario}
                      </div>
                    )}

                    {/* Question text */}
                    <div className="font-bold text-[#201e1d]">{rev.questionText}</div>

                    {/* Written Case Evaluation Breakdown */}
                    {isWritten && rev.caseEvaluation ? (
                      <div className="space-y-3 bg-white p-4 border border-blue-200">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="font-black text-blue-950 uppercase text-[11px]">
                            Rubric Dimension Breakdown
                          </span>
                          <span className="font-mono font-black text-sm text-blue-900">
                            Overall Case Score: {rev.caseEvaluation.overallScore} / 100
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rev.caseEvaluation.dimensionScores.map((dim) => (
                            <div key={dim.dimensionId} className="p-2.5 bg-slate-50 border border-slate-200">
                              <div className="flex justify-between text-[11px] font-bold text-[#201e1d] mb-1">
                                <span>{dim.dimensionName} ({dim.weight}%)</span>
                                <span className="text-[#ec3013]">{dim.score}%</span>
                              </div>
                              <p className="text-[10px] text-slate-600 leading-relaxed">{dim.feedback}</p>
                            </div>
                          ))}
                        </div>

                        {rev.caseEvaluation.feedbackSummary && (
                          <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 text-xs">
                            <span className="font-bold block mb-1">Evaluator Executive Summary:</span>
                            {rev.caseEvaluation.feedbackSummary}
                          </div>
                        )}

                        <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] max-h-36 overflow-y-auto">
                          <span className="text-slate-400 block mb-1">// Candidate's Submitted Response:</span>
                          {rev.userAnswer}
                        </div>
                      </div>
                    ) : (
                      /* MCQ Options Review */
                      <div className="space-y-2">
                        {rev.options?.map((opt) => {
                          const isUserChoice = rev.userAnswer === opt.key;
                          const isCorrectKey = rev.correctAnswer === opt.key;
                          const failExp = rev.optionExplanations?.[opt.key];

                          return (
                            <div
                              key={opt.key}
                              className={`p-3 border text-xs leading-relaxed ${
                                isCorrectKey
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium'
                                  : isUserChoice
                                  ? 'bg-rose-50 border-rose-400 text-rose-950'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold">
                                  {opt.key}. {opt.text}
                                </span>
                                <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold">
                                  {isCorrectKey && (
                                    <span className="tag bg-emerald-600 text-white">Correct Answer</span>
                                  )}
                                  {isUserChoice && !isCorrectKey && (
                                    <span className="tag bg-rose-600 text-white">Your Selection</span>
                                  )}
                                </div>
                              </div>

                              {/* Option failure explanation */}
                              {!isCorrectKey && failExp && (
                                <p className="text-[11px] text-slate-600 mt-1.5 pl-3 border-l-2 border-slate-300">
                                  <span className="font-semibold text-slate-500">Why this option is incorrect: </span>
                                  {failExp}
                                </p>
                              )}
                            </div>
                          );
                        })}

                        {/* Authoritative Explanation */}
                        {rev.explanation && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-300 text-xs text-emerald-950 mt-2">
                            <span className="font-bold block mb-1">Authoritative Product Explanation:</span>
                            <p className="leading-relaxed">{rev.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
