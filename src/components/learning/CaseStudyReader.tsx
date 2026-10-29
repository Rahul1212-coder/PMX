'use client';

import React, { useState } from 'react';
import { LearningItem } from '@/types/learning';
import {
  Building2,
  BarChart3,
  HelpCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GitFork,
  Scale,
  Award,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';

interface CaseStudyReaderProps {
  item: LearningItem;
  onAskMentor?: (query: string) => void;
}

export const CaseStudyReader: React.FC<CaseStudyReaderProps> = ({
  item,
  onAskMentor,
}) => {
  const detail = item.caseStudyDetail;
  const [showSolution, setShowSolution] = useState(false);
  const [userDraft, setUserDraft] = useState('');
  const [hasTestedDraft, setHasTestedDraft] = useState(false);

  if (!detail) {
    return (
      <div className="p-6 bg-white border border-[rgba(32,30,29,0.15)] text-sm text-slate-600">
        No case study detail available.
      </div>
    );
  }

  const handleTestDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (userDraft.trim()) {
      setHasTestedDraft(true);
      setShowSolution(true);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & Context */}
      <div className="bg-[#201e1d] text-[#f3f2f2] p-5 border-2 border-[#201e1d] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#ec3013]" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {detail.company} · {detail.product}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-[#ec3013] text-white px-2 py-0.5">
            Real PM Case Study
          </span>
        </div>

        <div>
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            Business Model & Unit Economics
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            {detail.businessModel}
          </p>
        </div>
      </div>

      {/* 2. Background Scenario & Crisis Context */}
      <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#ae1800] m-0">
          The Scenario & Problem Context
        </h3>
        <p className="text-sm sm:text-[15px] leading-relaxed text-[#201e1d]">
          {detail.backgroundScenario}
        </p>
      </div>

      {/* 3. Live Metrics Telemetry Board */}
      {detail.keyMetrics && Object.keys(detail.keyMetrics).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#201e1d]">
            <BarChart3 className="w-4 h-4 text-[#ec3013]" />
            <span>Telemetry & Key Metrics Provided</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(detail.keyMetrics).map(([k, v]) => (
              <div key={k} className="bg-[#f3f2f2] p-3.5 border border-[rgba(32,30,29,0.15)]">
                <div className="text-[11px] font-bold text-slate-600 truncate">{k}</div>
                <div className="text-lg font-black text-[#201e1d] mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Core Challenge Question */}
      <div className="bg-[#fff2ef] p-5 border-2 border-[#ec3013] space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ec3013]">
          <HelpCircle className="w-4 h-4" />
          <span>The Core Challenge Question</span>
        </div>
        <p className="text-base sm:text-lg font-black leading-snug text-[#201e1d]">
          {detail.coreChallengeQuestion}
        </p>

        {/* Practice First Scratchpad */}
        {!showSolution && (
          <form onSubmit={handleTestDraft} className="space-y-2.5 pt-2">
            <label className="text-xs font-bold text-slate-700 block">
              💡 Practice: Outline your diagnosis or recommended action before viewing the Principal PM solution:
            </label>
            <textarea
              value={userDraft}
              onChange={(e) => setUserDraft(e.target.value)}
              placeholder="e.g. 1) Segment riders by rush hour vs off-peak; 2) Check driver wait time distribution; 3) Test flat upfront pricing..."
              rows={3}
              className="w-full text-xs p-3 bg-white border border-[rgba(32,30,29,0.2)] outline-none font-medium text-[#201e1d] resize-none focus:border-[#ec3013]"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="submit"
                disabled={!userDraft.trim()}
                className="btn btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Save Draft & Reveal Model Answer</span>
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowSolution(true)}
                className="btn btn-secondary text-xs font-bold py-2 px-3 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Skip to Model Answer</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 5. User Draft Feedback (if user typed something) */}
      {hasTestedDraft && userDraft && (
        <div className="bg-amber-50/70 p-4 border border-amber-300 text-xs space-y-1">
          <div className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800">
            Your Initial Draft Notes:
          </div>
          <p className="text-slate-800 italic whitespace-pre-wrap">{userDraft}</p>
        </div>
      )}

      {/* 6. Expandable Model Solution Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[rgba(32,30,29,0.15)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ec3013]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#201e1d] m-0">
              Principal PM Model Solution & Evaluation
            </h3>
          </div>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="btn btn-secondary text-xs font-bold py-1 px-3 flex items-center gap-1.5"
          >
            {showSolution ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Solution</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal Model Solution</span>
              </>
            )}
          </button>
        </div>

        {showSolution && (
          <div className="mt-4 space-y-5 animate-in fade-in duration-200">
            {/* Hypotheses & Data Signals */}
            {detail.hypotheses && detail.hypotheses.length > 0 && (
              <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ae1800]">
                  <GitFork className="w-4 h-4" />
                  <span>1. Root-Cause Hypotheses & Telemetry Validation</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {detail.hypotheses.map((hyp, i) => (
                    <div key={i} className="py-2.5 space-y-1 text-xs">
                      <div className="font-bold text-[#201e1d]">{hyp.hypothesis}</div>
                      <div className="text-slate-600">
                        <strong className="text-slate-700">How to Validate:</strong> {hyp.validationMethod}
                      </div>
                      <div className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold inline-block">
                        Signal: {hyp.dataSignal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Framework */}
            <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
                <BarChart3 className="w-4 h-4 text-[#ec3013]" />
                <span>2. Framework Applied</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{detail.frameworkUsed}</p>
            </div>

            {/* Recommended Action Plan */}
            <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3. Recommended Action Plan & Interventions</span>
              </div>
              <div className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
                {detail.recommendedAction}
              </div>
            </div>

            {/* Trade-off Analysis */}
            <div className="bg-[#fdf8f6] p-5 border border-[#ec3013]/30 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ae1800]">
                <Scale className="w-4 h-4" />
                <span>4. Trade-off & Opportunity Cost Analysis</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#201e1d]">
                {detail.tradeOffAnalysis}
              </p>
            </div>

            {/* Interviewer Grading Rubric */}
            {detail.interviewerRubric && detail.interviewerRubric.length > 0 && (
              <div className="bg-[#201e1d] text-[#f3f2f2] p-5 border-2 border-[#201e1d] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>5. What Interviewers Look For (Principal PM Grading Rubric)</span>
                </div>
                <ul className="space-y-2">
                  {detail.interviewerRubric.map((itemText, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <span className="text-[#ec3013] font-black text-sm shrink-0">✓</span>
                      <span>{itemText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Mentor practice button */}
            {onAskMentor && (
              <div className="pt-2">
                <button
                  onClick={() =>
                    onAskMentor(
                      `Let's do a mock PM interview case based on ${detail.company}: "${detail.coreChallengeQuestion}". Act as my interviewer and critique my approach.`
                    )
                  }
                  className="btn btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 shadow"
                >
                  <span>Practice this Case Live with AI Mentor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
