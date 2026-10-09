'use client';

import React, { useState } from 'react';
import { PmConcept } from '../types';
import { POPULAR_PM_TOPICS, DEFAULT_STARTER_CONCEPT, INITIAL_CONCEPTS } from '../data/mockData';
import { Sparkles, BookOpen, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight, Loader2, Search, History } from 'lucide-react';

interface AiPmTutorProps {
  initialConcepts: PmConcept[];
}

export const AiPmTutor: React.FC<AiPmTutorProps> = ({ initialConcepts }) => {
  const [historyConcepts, setHistoryConcepts] = useState<PmConcept[]>(
    initialConcepts.length > 0 ? initialConcepts : [DEFAULT_STARTER_CONCEPT]
  );
  const [selectedConcept, setSelectedConcept] = useState<PmConcept>(
    initialConcepts[0] || DEFAULT_STARTER_CONCEPT
  );
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
          if (prev.some((c) => c.term.toLowerCase() === term.toLowerCase())) {
            return prev;
          }
          return [generated, ...prev];
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

  const handleSelectTopicChip = (topic: string) => {
    setQueryTerm(topic);
    fetchAiExplanation(topic);
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
    <div className="space-y-3 text-left">
      {/* Top Banner (LinkedIn Learning & Copilot style) */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex items-center space-x-2 text-[#0a66c2] text-xs font-bold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>PM Learning & AI Copilot</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Product Management Frameworks & Copilot
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Master any PM concept, framework, or interview question with real tech company teardowns powered by GPT-4o-mini.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleAskAi} className="mt-3.5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={queryTerm}
              onChange={(e) => setQueryTerm(e.target.value)}
              placeholder="Search any PM term (e.g. Kano Model, GIST, NSM, DORA metrics, HEART)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !queryTerm.trim()}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg transition shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Explain Term</span>
              </>
            )}
          </button>
        </form>

        {/* Popular Prompt Chips */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Popular Frameworks:</span>
          {POPULAR_PM_TOPICS.slice(0, 6).map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => handleSelectTopicChip(topic)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium transition"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Glossary Explorer & Active Concept */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Curated Frameworks */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-3">
            <h2 className="text-xs font-bold text-slate-700 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Curated Frameworks</span>
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            </h2>

            <div className="space-y-1.5">
              {historyConcepts.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => {
                    setSelectedConcept(concept);
                    setCustomExplanation(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition-all border ${
                    !customExplanation && selectedConcept.id === concept.id
                      ? 'bg-sky-50/80 border-sky-300 shadow-sm'
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {concept.term}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      {concept.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                    {concept.quickSummary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Dive Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#0a66c2] mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Executive PM Breakdown</span>
                {customExplanation && (
                  <span className="bg-sky-100 text-[#0a66c2] px-2 py-0.5 rounded-full text-[10px] font-bold">
                    AI Generated
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900">{activeContent.term}</h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                💡 {activeContent.summary}
              </p>
            </div>

            {/* In Depth */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                How It Works in Practice
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {activeContent.inDepth}
              </p>
            </div>

            {/* Formula or Steps */}
            {activeContent.formulaOrSteps && (
              <div className="bg-sky-50/60 border border-sky-100 rounded-lg p-3.5">
                <h4 className="text-xs font-bold text-sky-900 mb-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0a66c2]" />
                  <span>Checklist & Implementation Steps</span>
                </h4>
                <div className="text-xs text-sky-950 font-mono bg-white p-2.5 rounded border border-sky-100 space-y-1">
                  {Array.isArray(activeContent.formulaOrSteps) ? (
                    activeContent.formulaOrSteps.map((step: string, i: number) => (
                      <p key={i}>• {step}</p>
                    ))
                  ) : (
                    <p>{activeContent.formulaOrSteps}</p>
                  )}
                </div>
              </div>
            )}

            {/* Real World Example */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3.5">
              <h4 className="text-xs font-bold text-emerald-900 mb-1 flex items-center space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                <span>Real-World Product Case Study</span>
              </h4>
              <p className="text-xs text-emerald-950 leading-relaxed">
                {activeContent.realWorldExample}
              </p>
            </div>

            {/* Pitfalls & Interview Tip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3">
                <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Common Pitfalls</span>
                </h4>
                <div className="text-xs text-amber-950 leading-relaxed">
                  {Array.isArray(activeContent.pitfalls) ? (
                    activeContent.pitfalls.map((p: string, i: number) => <p key={i}>• {p}</p>)
                  ) : (
                    <p>{activeContent.pitfalls}</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center space-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#0a66c2]" />
                  <span>PM Interview Strategy</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
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
