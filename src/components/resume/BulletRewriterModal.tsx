'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, HelpCircle, ArrowRight, Copy } from 'lucide-react';
import { BulletRewriteResult, BulletRewriteVariation } from '@/types/resume';

interface BulletRewriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalBullet: string;
  targetRole?: string;
  targetJobContext?: string;
  onApplyBullet: (newBulletText: string) => void;
}

const GOALS = [
  { id: 'impact', label: 'More Impact & Outcomes', desc: 'Emphasize customer metric shifts and business value' },
  { id: 'ownership', label: 'Emphasize Ownership', desc: 'Highlight leadership, discovery, and cross-functional orchestration' },
  { id: 'clarity', label: 'High-Signal Concision', desc: 'Trim passive filler words and front-load strong active verbs' },
  { id: 'job_aligned', label: 'Align with Target Job', desc: 'Adopt terminology and focus areas expected for the role' },
  { id: 'metrics', label: 'Quantify Scale & Metrics', desc: 'Integrate specific volumes, percentages, or cycle times' },
];

export const BulletRewriterModal: React.FC<BulletRewriterModalProps> = ({
  isOpen,
  onClose,
  originalBullet,
  targetRole,
  targetJobContext,
  onApplyBullet,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('impact');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulletRewriteResult | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<string>('var-1');
  const [editableText, setEditableText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Metric probing inputs
  const [metricPercent, setMetricPercent] = useState('');
  const [metricScale, setMetricScale] = useState('');
  const [metricOutcome, setMetricOutcome] = useState('');
  const [showMetricInputs, setShowMetricInputs] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (overrideGoal?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const goalToUse = overrideGoal || selectedGoal;

    try {
      const res = await fetch('/api/resume/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalBullet,
          goal: goalToUse,
          targetRole,
          targetJobContext,
          metricAnswers: {
            percent: metricPercent.trim() || undefined,
            scale: metricScale.trim() || undefined,
            outcome: metricOutcome.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to rewrite bullet');
      }

      setResult(data.result);
      if (data.result.variations && data.result.variations.length > 0) {
        setSelectedVariationId(data.result.variations[0].id);
        setEditableText(data.result.variations[0].text);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVariation = (v: BulletRewriteVariation) => {
    setSelectedVariationId(v.id);
    setEditableText(v.text);
  };

  const handleApply = () => {
    if (!editableText.trim()) return;
    onApplyBullet(editableText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-2xl w-full shadow-2xl relative my-6 text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[rgba(32,30,29,0.15)] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#ef2b18]/10 text-[#ef2b18] flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4 text-[#ef2b18]" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest text-[#ef2b18] uppercase">
                PMVerse AI Bullet Improver
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#201e1d] m-0">
                Optimize Resume Bullet
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Original Bullet */}
          <div className="bg-white p-3.5 border border-[rgba(32,30,29,0.15)] rounded">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Original Resume Bullet:
            </span>
            <p className="text-[#201e1d] font-medium leading-relaxed italic bg-slate-50 p-2.5 border-l-2 border-slate-400">
              "{originalBullet}"
            </p>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-bold text-[#201e1d] mb-1.5 uppercase tracking-wider">
              Select Improvement Angle:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedGoal(g.id);
                    if (g.id === 'metrics') setShowMetricInputs(true);
                  }}
                  className={`p-2.5 text-left border rounded transition flex flex-col justify-between ${
                    selectedGoal === g.id
                      ? 'border-[#201e1d] bg-white ring-2 ring-[#ef2b18]/20'
                      : 'border-[rgba(32,30,29,0.15)] bg-white/70 hover:bg-white'
                  }`}
                >
                  <span className="font-bold text-xs text-[#201e1d] flex items-center justify-between">
                    {g.label}
                    {selectedGoal === g.id && <Check className="w-3.5 h-3.5 text-[#ef2b18]" />}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 line-clamp-1">{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Metric Probe Input Accordion */}
          <div className="border border-dashed border-[rgba(32,30,29,0.25)] rounded bg-white/50 p-3">
            <button
              type="button"
              onClick={() => setShowMetricInputs(!showMetricInputs)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#201e1d]"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#ef2b18]" />
                Know your metrics? Add real numbers (Optional)
              </span>
              <span className="text-[11px] text-[#ef2b18] hover:underline">
                {showMetricInputs ? 'Hide' : 'Add Metrics'}
              </span>
            </button>

            {showMetricInputs && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    % Shift / Lift
                  </label>
                  <input
                    type="text"
                    value={metricPercent}
                    onChange={(e) => setMetricPercent(e.target.value)}
                    placeholder="e.g. +24% retention"
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Scale / Volume
                  </label>
                  <input
                    type="text"
                    value={metricScale}
                    onChange={(e) => setMetricScale(e.target.value)}
                    placeholder="e.g. 500K DAUs / 4 squads"
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Target Outcome
                  </label>
                  <input
                    type="text"
                    value={metricOutcome}
                    onChange={(e) => setMetricOutcome(e.target.value)}
                    placeholder="e.g. reduced onboarding drop-off"
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button (if not generated yet) */}
          {!result && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="btn btn-primary px-6 py-2.5 text-xs font-black flex items-center gap-2 shadow-md"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating 3 High-Impact PM Variations...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Variations
                  </>
                )}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-300 rounded text-xs">
              {errorMessage}
            </div>
          )}

          {/* Generated Variations */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#201e1d] uppercase tracking-wider">
                  Select Best Variation:
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isLoading}
                  className="text-xs text-[#ef2b18] hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>

              <div className="space-y-2">
                {result.variations.map((v, idx) => {
                  const isSelected = selectedVariationId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVariation(v)}
                      className={`p-3 border rounded cursor-pointer transition text-left ${
                        isSelected
                          ? 'border-[#201e1d] bg-white ring-2 ring-[#ef2b18]/25 shadow-sm'
                          : 'border-[rgba(32,30,29,0.15)] bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#ef2b18] bg-[#ef2b18]/10 px-2 py-0.5 rounded">
                          Option {idx + 1}: {v.focus}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs font-semibold text-[#201e1d] leading-relaxed mt-1">
                        {v.text}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">{v.rationale}</p>
                    </div>
                  );
                })}
              </div>

              {/* Editable Preview Before Applying */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#201e1d] mb-1 uppercase tracking-wider">
                  Final Polish / Edit Before Applying:
                </label>
                <textarea
                  rows={3}
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full text-xs p-2.5 border-2 border-[#201e1d] bg-white rounded font-medium text-[#201e1d] outline-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 border-[rgba(32,30,29,0.15)] bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs font-bold py-2 px-4"
          >
            Cancel
          </button>

          {result && (
            <button
              type="button"
              onClick={handleApply}
              disabled={!editableText.trim()}
              className="btn btn-primary text-xs font-black py-2 px-5 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply to Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
