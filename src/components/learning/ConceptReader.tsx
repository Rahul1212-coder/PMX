'use client';

import React from 'react';
import { LearningItem } from '@/types/learning';
import { Lightbulb, Briefcase, Building2, CheckCircle2, XCircle, AlertTriangle, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

interface ConceptReaderProps {
  item: LearningItem;
  onSelectRelated?: (relatedKey: string) => void;
  onAskMentor?: (termName: string) => void;
}

export const ConceptReader: React.FC<ConceptReaderProps> = ({
  item,
  onSelectRelated,
  onAskMentor,
}) => {
  const detail = item.conceptDetail;

  if (!detail) {
    return (
      <div className="p-6 bg-white border border-[rgba(32,30,29,0.15)] text-sm text-slate-600">
        No concept detail available for this item.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* 1. Punchy Summary Box */}
      <div className="bg-[#f3f2f2] p-5 border-l-4 border-[#ec3013] border-t border-r border-b border-[rgba(32,30,29,0.15)]">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#ae1800] mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Core Concept Definition</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-[#201e1d] leading-snug">
          {item.summary}
        </p>
      </div>

      {/* 2. Layman Intuition (ELI5) */}
      <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Simple Intuition (Explain Like I&apos;m 5)</span>
        </div>
        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 font-medium">
          {detail.simpleExplanation}
        </p>
      </div>

      {/* 3. Daily PM Operational Scenario */}
      <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#201e1d]">
          <Briefcase className="w-4 h-4 text-[#ec3013]" />
          <span>Daily PM Operational Scenario</span>
        </div>
        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700">
          {detail.pmScenario}
        </p>
      </div>

      {/* 4. Famous Industry Example */}
      <div className="bg-[#fdf8f6] p-5 border border-[#ec3013]/30 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ae1800]">
          <Building2 className="w-4 h-4" />
          <span>Real-World Industry Battle Story</span>
        </div>
        <p className="text-sm sm:text-[15px] leading-relaxed text-[#201e1d] font-medium">
          {detail.industryExample}
        </p>
      </div>

      {/* 5. When to Use & When Not to Use */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/70 p-4 border border-emerald-300/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>When to Use This</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
            {detail.whenToUse}
          </p>
        </div>

        <div className="bg-rose-50/70 p-4 border border-rose-300/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-800">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>When NOT to Use This</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-950 leading-relaxed font-medium">
            {detail.whenNotToUse}
          </p>
        </div>
      </div>

      {/* 6. Common Pitfalls & Traps */}
      {detail.pitfalls && detail.pitfalls.length > 0 && (
        <div className="bg-white p-5 border border-[rgba(32,30,29,0.15)] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>3 Common Traps Aspiring PMs Fall Into</span>
          </div>
          <ul className="space-y-2">
            {detail.pitfalls.map((pitfall, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. PM Interview Defense & Question */}
      <div className="bg-[#201e1d] text-[#f3f2f2] p-5 border-2 border-[#201e1d] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>PM Interview Defense Question</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-0.5 text-white/80">
            Interview Prep
          </span>
        </div>
        <p className="text-sm sm:text-base font-semibold leading-relaxed text-white italic">
          &ldquo;{detail.interviewQuestion}&rdquo;
        </p>
        {onAskMentor && (
          <button
            onClick={() => onAskMentor(`Help me practice answering this PM interview question: "${detail.interviewQuestion}"`)}
            className="btn btn-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 shadow"
          >
            <span>Practice with AI PM Mentor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 8. Related Concepts */}
      {detail.relatedKeys && detail.relatedKeys.length > 0 && onSelectRelated && (
        <div className="pt-2">
          <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-2">
            Explore Related Concepts
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.relatedKeys.map((relKey) => (
              <button
                key={relKey}
                onClick={() => onSelectRelated(relKey)}
                className="btn btn-secondary text-xs font-bold py-1.5 px-3"
              >
                {relKey.replace(/^concept-/, '').replace(/-/g, ' ')} →
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
