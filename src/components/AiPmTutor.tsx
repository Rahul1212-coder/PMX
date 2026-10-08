'use client';

import React, { useState } from 'react';
import { PmConcept } from '../types';
import { POPULAR_PM_TOPICS, DEFAULT_STARTER_CONCEPT } from '../data/mockData';
import { Sparkles, BookOpen, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight, Loader2, Search, History } from 'lucide-react';

interface AiPmTutorProps {
  initialConcepts: PmConcept[];
}

export const AiPmTutor: React.FC<AiPmTutorProps> = ({ initialConcepts }) => {
  const [historyConcepts, setHistoryConcepts] = useState<PmConcept[]>(initialConcepts.length > 0 ? initialConcepts : [DEFAULT_STARTER_CONCEPT]);
  const [selectedConcept, setSelectedConcept] = useState<PmConcept>(initialConcepts[0] || DEFAULT_STARTER_CONCEPT);
  const [queryTerm, setQueryTerm] = useState('');
  const [userRole, setUserRole] = useState('Aspiring or Current Product Manager');
  const [loading, setLoading] = useState(false);
  const [customExplanation, setCustomExplanation] = useState<any | null>(null);

  const fetchAiExplanation = async (term: string) => {
    if (!term.trim()) return;

    setLoading(true);
    setCustomExplanation(null);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term,
          userRole,
          questionType: 'in-depth PM breakdown',
        }),
      });

      const data = await res.json();
      if (data.success) {
        const generated = {
          id: `concept-${Date.now()}`,
          term,
          category: 'Frameworks' as const,
          quickSummary: data.data.summary,
          detailedDefinition: data.data.inDepth,
          formulaOrSteps: data.data.formulaOrSteps,
          realWorldExample: data.data.realWorldExample,
          commonPitfalls: data.data.pitfalls,
          interviewTip: data.data.interviewAdvice,
          source: data.source,
          note: data.note,
        };

        setCustomExplanation({
          term,
          ...data.data,
          source: data.source,
          note: data.note,
        });

        // Add to history if not duplicate
        setHistoryConcepts((prev) => {
          const filtered = prev.filter((c) => c.term.toLowerCase() !== term.toLowerCase());
          return [generated, ...filtered];
        });
      }
    } catch (err) {
      console.error('Failed to query AI:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchAiExplanation(queryTerm);
  };

  const handleSelectTopicChip = async (topic: string) => {
    setQueryTerm(topic);
    await fetchAiExplanation(topic);
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
      <div className="bg-gradient-to-r from-[#1c053a] via-[#2f0857] to-[#4c1d95] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute -right-8 -top-8 w-60 h-60 opacity-15 pointer-events-none">
          <img src="/pmverse-icon.png" alt="PMVerse Icon" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-purple-200 border border-white/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>PMVerse AI Copilot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Master Any PM Term, Metric & Framework
          </h1>
          <p className="mt-2 text-purple-100/90 text-sm sm:text-base leading-relaxed">
            From North Star Metrics to Product-Led Growth loops and Kano analysis, get instant actionable breakdowns with real tech company teardowns and interview advice powered by OpenAI GPT-4o-mini.
          </p>

          {/* AI Search Box */}
          <form onSubmit={handleAskAi} className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={queryTerm}
                onChange={(e) => setQueryTerm(e.target.value)}
                placeholder="Ask about any PM concept (e.g. Kano Model, GIST, NSM, DORA metrics, HEART)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryTerm.trim()}
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Explain Term</span>
                </>
              )}
            </button>
          </form>

          {/* Popular Topic Prompt Chips */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-purple-200 font-semibold text-[11px] mr-1">Popular Prompts:</span>
            {POPULAR_PM_TOPICS.slice(0, 6).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleSelectTopicChip(topic)}
                className="bg-white/10 hover:bg-white/20 text-purple-100 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition backdrop-blur-sm border border-white/10"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Recent / Explored Topics */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5 text-purple-600" />
              <span>Explored Concepts ({historyConcepts.length})</span>
            </h2>
          </div>

          <div className="space-y-2">
            {historyConcepts.map((concept) => (
              <button
                key={concept.id}
                onClick={() => {
                  setSelectedConcept(concept);
                  setCustomExplanation(null);
                }}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  !customExplanation && selectedConcept.id === concept.id
                    ? 'bg-purple-50/90 border-purple-300 shadow-sm ring-1 ring-purple-400/30'
                    : 'bg-white border-purple-100/80 hover:bg-purple-50/50 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{concept.term}</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            {/* Header */}
            <div className="border-b border-purple-50 pb-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Concept Breakdown
                </span>
                {activeContent.source === 'openai' && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Real-Time GPT-4o-mini</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {activeContent.term}
              </h2>
              <p className="text-base text-purple-900 font-medium mt-1 leading-relaxed">
                {activeContent.summary}
              </p>
            </div>

            {/* In-Depth Explanation */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>How It Works in Practice</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-purple-50/30 p-4 rounded-2xl border border-purple-100/60">
                {activeContent.inDepth}
              </p>
            </div>

            {/* Steps or Formula */}
            {activeContent.formulaOrSteps && activeContent.formulaOrSteps !== 'N/A' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Execution Checklist & Steps</span>
                </h3>
                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl text-xs sm:text-sm text-purple-950 font-mono leading-relaxed">
                  {Array.isArray(activeContent.formulaOrSteps)
                    ? activeContent.formulaOrSteps.map((step: string, i: number) => (
                        <div key={i} className="py-0.5">
                          {i + 1}. {step}
                        </div>
                      ))
                    : activeContent.formulaOrSteps}
                </div>
              </div>
            )}

            {/* Real World Example */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Real-World Product Teardown</span>
              </h3>
              <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl text-xs sm:text-sm text-amber-950 leading-relaxed">
                {activeContent.realWorldExample}
              </div>
            </div>

            {/* Pitfalls & Interview Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-rose-50/50 border border-rose-200/70 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Common Traps to Avoid</span>
                </h4>
                <div className="text-xs text-rose-950 leading-relaxed whitespace-pre-line">
                  {Array.isArray(activeContent.pitfalls)
                    ? activeContent.pitfalls.map((p: string, i: number) => (
                        <p key={i} className="py-0.5">• {p}</p>
                      ))
                    : activeContent.pitfalls}
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-200/80 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                  <span>Interview Strategy Tip</span>
                </h4>
                <p className="text-xs text-purple-950 leading-relaxed">
                  {activeContent.interviewAdvice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
