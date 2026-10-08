'use client';

import React, { useState } from 'react';
import { PmConcept } from '../types';
import { Sparkles, BookOpen, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight, Loader2, Search } from 'lucide-react';

interface AiPmTutorProps {
  initialConcepts: PmConcept[];
}

export const AiPmTutor: React.FC<AiPmTutorProps> = ({ initialConcepts }) => {
  const [concepts] = useState<PmConcept[]>(initialConcepts);
  const [selectedConcept, setSelectedConcept] = useState<PmConcept>(initialConcepts[0]);
  const [queryTerm, setQueryTerm] = useState('');
  const [userRole, setUserRole] = useState('Aspiring or Current Product Manager');
  const [loading, setLoading] = useState(false);
  const [customExplanation, setCustomExplanation] = useState<any | null>(null);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTerm.trim()) return;

    setLoading(true);
    setCustomExplanation(null);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: queryTerm,
          userRole,
          questionType: 'in-depth PM breakdown',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCustomExplanation({
          term: queryTerm,
          ...data.data,
          source: data.source,
          note: data.note,
        });
      }
    } catch (err) {
      console.error('Failed to query AI:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeContent = customExplanation || {
    term: selectedConcept.term,
    summary: selectedConcept.quickSummary,
    inDepth: selectedConcept.detailedDefinition,
    formulaOrSteps: selectedConcept.formulaOrSteps,
    realWorldExample: selectedConcept.realWorldExample,
    pitfalls: selectedConcept.commonPitfalls,
    interviewAdvice: selectedConcept.interviewTip,
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Product Management Tutor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Master Any PM Term, Framework & Metric
          </h1>
          <p className="mt-2 text-purple-100 text-sm sm:text-base">
            From RICE scoring to PLG loops and Cohort Retention, get crystal-clear breakdowns, real company examples, and PM interview tips powered by AI.
          </p>

          {/* AI Search Box */}
          <form onSubmit={handleAskAi} className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={queryTerm}
                onChange={(e) => setQueryTerm(e.target.value)}
                placeholder="Ask about any PM concept (e.g. Kano Model, GIST, NSM, DORA metrics)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryTerm.trim()}
              className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-black text-white font-semibold px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Explain Term</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Curated Essential Frameworks */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Curated PM Glossary
          </h2>
          <div className="space-y-2">
            {concepts.map((concept) => (
              <button
                key={concept.id}
                onClick={() => {
                  setSelectedConcept(concept);
                  setCustomExplanation(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                  !customExplanation && selectedConcept.id === concept.id
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">{concept.term}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {concept.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {concept.quickSummary}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area: Detailed Concept Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Header */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Concept Deep Dive</span>
                {customExplanation && (
                  <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">
                    AI Generated
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{activeContent.term}</h2>
              <p className="mt-2 text-base text-slate-700 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                💡 {activeContent.summary}
              </p>
            </div>

            {/* In Depth Explanation */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <span>How It Works In Practice</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {activeContent.inDepth}
              </p>
            </div>

            {/* Formula or Steps */}
            {activeContent.formulaOrSteps && activeContent.formulaOrSteps !== 'N/A' && (
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1.5 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Formula / Framework Steps</span>
                </h3>
                <div className="font-mono text-xs text-indigo-950 bg-white p-3 rounded-lg border border-indigo-100 shadow-inner">
                  {activeContent.formulaOrSteps}
                </div>
              </div>
            )}

            {/* Real World Example */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center space-x-1.5">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <span>Real-World Product Case Example</span>
              </h3>
              <p className="text-sm text-emerald-950 leading-relaxed">
                {activeContent.realWorldExample}
              </p>
            </div>

            {/* Pitfalls & Anti-Patterns */}
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Common Pitfalls & Anti-Patterns</span>
              </h3>
              <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-line">
                {activeContent.pitfalls}
              </p>
            </div>

            {/* Interview Strategy Tip */}
            <div className="bg-violet-50/70 border border-violet-100 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900 mb-1.5 flex items-center space-x-1.5">
                <ArrowRight className="w-4 h-4 text-violet-600" />
                <span>Product Manager Interview Advice</span>
              </h3>
              <p className="text-sm text-violet-950 leading-relaxed">
                {activeContent.interviewAdvice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
