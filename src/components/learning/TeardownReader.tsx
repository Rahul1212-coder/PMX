'use client';

import React from 'react';
import { LearningItem } from '@/types/learning';
import {
  Layers,
  Users,
  Target,
  Repeat,
  DollarSign,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Compass,
} from 'lucide-react';

interface TeardownReaderProps {
  item: LearningItem;
  onAskMentor?: (query: string) => void;
}

export const TeardownReader: React.FC<TeardownReaderProps> = ({
  item,
  onAskMentor,
}) => {
  const detail = item.teardownDetail;

  if (!detail) {
    return (
      <div className="p-6 bg-white border border-[rgba(32,30,29,0.15)] text-sm text-slate-600">
        No teardown detail available for this product.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* 1. Hero & Value Proposition */}
      <div className="bg-[#201e1d] text-[#f3f2f2] p-5 border-2 border-[#201e1d] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#ec3013]" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {detail.company} · {detail.productName}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-[#ec3013] text-white px-2 py-0.5">
            Product Teardown
          </span>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black text-white leading-tight">
            &ldquo;{detail.heroTagline}&rdquo;
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            {item.summary}
          </p>
        </div>
      </div>

      {/* 2. Target Persona & Core JTBD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
            <Users className="w-4 h-4 text-[#ec3013]" />
            <span>Target Persona & Wedge User</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {detail.targetPersona}
          </p>
        </div>

        <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Core Jobs-To-Be-Done (JTBD)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {detail.coreJtbd}
          </p>
        </div>
      </div>

      {/* 3. The Growth Loop & Market Wedge */}
      <div className="bg-[#fdf8f6] p-5 border-l-4 border-[#ec3013] border-t border-r border-b border-[#ec3013]/30 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ae1800]">
          <Repeat className="w-4 h-4" />
          <span>The Growth Loop & Product Wedge</span>
        </div>
        <p className="text-sm sm:text-[15px] leading-relaxed text-[#201e1d] font-medium">
          {detail.growthLoopOrWedge}
        </p>
      </div>

      {/* 4. Step-by-Step UX Flow Breakdown */}
      {detail.uxFlowBreakdown && detail.uxFlowBreakdown.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
              <Compass className="w-4 h-4 text-[#ec3013]" />
              <span>Step-by-Step UX Flow & PM Decisions</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {detail.uxFlowBreakdown.length} steps analyzed
            </span>
          </div>

          <div className="space-y-3">
            {detail.uxFlowBreakdown.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-4 sm:p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2.5 relative"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#201e1d] text-white font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-[#201e1d]">
                    {step.stepTitle}
                  </div>
                </div>

                <div className="pl-8 space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">
                      User Goal at this Step
                    </span>
                    <p className="text-slate-800 font-medium">
                      {step.userGoal}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">
                      Interface & Interaction Design
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {step.screenDescription}
                    </p>
                  </div>

                  <div className="bg-[#f3f2f2] p-3 border-l-2 border-[#ec3013]">
                    <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-[#ae1800] mb-0.5">
                      <Sparkles className="w-3 h-3 text-[#ec3013]" />
                      <span>Product Manager Insight</span>
                    </div>
                    <p className="text-xs text-[#201e1d] font-semibold">
                      {step.pmInsight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Monetization Engine */}
      <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Monetization Engine & Pricing Mechanics</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {detail.monetizationEngine}
        </p>
      </div>

      {/* 6. Key Metrics They Track */}
      {detail.keyMetricsTheyTrack && detail.keyMetricsTheyTrack.length > 0 && (
        <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
            <TrendingUp className="w-4 h-4 text-[#ec3013]" />
            <span>Key Metrics & Guardrails Monitored</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detail.keyMetricsTheyTrack.map((metric, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-[#f3f2f2] p-2.5 border border-[rgba(32,30,29,0.1)] text-xs text-[#201e1d] font-medium"
              >
                <span className="text-[#ec3013] font-bold">▪</span>
                <span>{metric}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Actionable Lessons for Aspiring PMs */}
      {detail.pmLessonsLearned && detail.pmLessonsLearned.length > 0 && (
        <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Key Lessons for Aspiring Product Managers</span>
          </div>
          <div className="space-y-2">
            {detail.pmLessonsLearned.map((lesson, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#fdfdfd] p-3 border border-slate-200"
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium text-[#201e1d]">{lesson}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Vulnerabilities & Where Competitors Can Attack */}
      {detail.areasForImprovement && detail.areasForImprovement.length > 0 && (
        <div className="bg-rose-50/60 p-5 border border-rose-300/70 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Strategic Vulnerabilities & Future Headwinds</span>
          </div>
          <ul className="space-y-1.5">
            {detail.areasForImprovement.map((area, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs sm:text-sm text-rose-950 font-medium"
              >
                <span className="text-rose-600 font-bold">▪</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 9. Mentor Practice CTA */}
      {onAskMentor && (
        <div className="bg-[#201e1d] text-[#f3f2f2] p-5 border-2 border-[#201e1d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-black tracking-wider text-amber-300">
              Interactive Teardown Discussion
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Want to critique another feature in {detail.productName} or evaluate how you would build a competitor?
            </p>
          </div>
          <button
            onClick={() =>
              onAskMentor(
                `Let's do a deep teardown discussion on ${detail.productName}. How would you redesign their onboarding or improve their core retention loop?`
              )
            }
            className="btn btn-primary text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Ask AI Mentor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
