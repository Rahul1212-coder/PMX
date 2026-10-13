'use client';

import React from 'react';
import { X, TrendingUp, CheckCircle, ArrowRight, Award, Sparkles } from 'lucide-react';
import { ResumeAnalysisResult, ResumeVersion } from '@/types/resume';

interface VersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalAnalysis: ResumeAnalysisResult;
  currentAnalysis: ResumeAnalysisResult;
  appliedSuggestionsCount: number;
}

export const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  isOpen,
  onClose,
  originalAnalysis,
  currentAnalysis,
  appliedSuggestionsCount,
}) => {
  if (!isOpen) return null;

  const scoreDiff = currentAnalysis.overallScore - originalAnalysis.overallScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-3xl w-full shadow-2xl relative my-6 text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[rgba(32,30,29,0.15)] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#201e1d] text-white flex items-center justify-center font-black">
              <TrendingUp className="w-4 h-4 text-[#ef2b18]" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest text-[#ef2b18] uppercase">
                PMVerse Intelligence Version Delta
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#201e1d] m-0">
                Resume Optimization Delta: V1 vs Current
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
          {/* Top Score Comparison Hero */}
          <div className="bg-white p-5 border-2 border-[#201e1d] shadow-sm rounded grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center">
            {/* Original Score */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Original V1 Score
              </span>
              <div className="text-3xl font-black text-slate-700 mt-1">
                {originalAnalysis.overallScore}
                <span className="text-sm font-medium text-slate-400">/100</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 mt-1 block">
                {originalAnalysis.scoreTier}
              </span>
            </div>

            {/* Delta Indicator */}
            <div className="flex flex-col items-center justify-center">
              <div
                className={`inline-flex items-center gap-1 font-black px-3 py-1.5 rounded-full text-sm ${
                  scoreDiff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {scoreDiff >= 0 ? `+${scoreDiff} PTS` : `${scoreDiff} PTS`}
              </div>
              <span className="text-[11px] font-bold text-slate-500 mt-1.5">
                {appliedSuggestionsCount} AI suggestions applied
              </span>
            </div>

            {/* Current Optimized Score */}
            <div className="p-3 bg-white border-2 border-[#201e1d] rounded shadow-sm">
              <span className="text-[10px] font-bold text-[#ef2b18] uppercase tracking-wider block">
                Optimized Resume Score
              </span>
              <div className="text-3xl font-black text-[#201e1d] mt-1">
                {currentAnalysis.overallScore}
                <span className="text-sm font-medium text-slate-400">/100</span>
              </div>
              <span className="text-[11px] font-black text-emerald-700 mt-1 block">
                {currentAnalysis.scoreTier}
              </span>
            </div>
          </div>

          {/* Category-by-Category Shift */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#201e1d] mb-2.5">
              Category Score Shifts
            </h4>
            <div className="bg-white border border-[rgba(32,30,29,0.15)] rounded divide-y divide-slate-100">
              {currentAnalysis.categoryScores.map((currCat) => {
                const origCat = originalAnalysis.categoryScores.find((c) => c.id === currCat.id);
                const origScore = origCat ? origCat.score : currCat.score;
                const diff = currCat.score - origScore;

                return (
                  <div key={currCat.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#201e1d] block">{currCat.name}</span>
                      <span className="text-[11px] text-slate-500">Weight: {currCat.weight}%</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-slate-500 font-medium">
                        <span>V1: {origScore}</span>
                        <ArrowRight className="w-3 h-3 inline mx-1.5 text-slate-400" />
                        <span className="font-bold text-black">Now: {currCat.score}</span>
                      </div>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded ${
                          diff > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : diff === 0
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Improvements Evidenced */}
          <div className="bg-white p-4 border border-[rgba(32,30,29,0.15)] rounded space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#201e1d] block">
              What Improved in this Version:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Quantified customer metric outcomes integrated across work experience bullets.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Replaced passive participation verbs with authoritative product ownership terms.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Explicitly highlighted cross-functional alignment and discovery methodologies.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[rgba(32,30,29,0.15)] bg-white flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary text-xs font-black py-2 px-6"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
