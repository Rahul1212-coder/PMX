'use client';

import React, { useState } from 'react';
import {
  LearningItem,
  LearningItemType,
  LearningCategory,
  LearningDifficulty,
} from '@/types/learning';
import {
  X,
  Sparkles,
  Loader2,
  BookOpen,
  Briefcase,
  Layers,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GeminiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialPublished: (item: LearningItem) => void;
}

const CATEGORIES: LearningCategory[] = [
  'Product Thinking',
  'Metrics & Data',
  'Prioritization & Strategy',
  'User Discovery',
  'Execution & Tech',
  'Growth & Monetization',
];

const PROMPT_SUGGESTIONS: Record<LearningItemType, { label: string; topic: string; category: LearningCategory }[]> = {
  concept: [
    {
      label: 'Cold Start Problem & Network Effects',
      topic: 'Cold Start Problem & Two-Sided Network Effects',
      category: 'Growth & Monetization',
    },
    {
      label: 'Counter-Metrics & Guardrail KPIs',
      topic: 'Counter-Metrics & Avoiding Goodhart\'s Law',
      category: 'Metrics & Data',
    },
    {
      label: 'Event Telemetry & Schemas for PMs',
      topic: 'Event-Driven Telemetry & Schema Design for Product Managers',
      category: 'Execution & Tech',
    },
    {
      label: 'Opportunity Solution Trees (Teresa Torres)',
      topic: 'Opportunity Solution Tree Framework for Continuous Discovery',
      category: 'User Discovery',
    },
  ],
  case_study: [
    {
      label: 'DoorDash Delivery Latency Drop-Off',
      topic: 'DoorDash Dinner Peak Order Cancellation Spike Analysis',
      category: 'Metrics & Data',
    },
    {
      label: 'Airbnb Host Cancellation Spike in Summer',
      topic: 'Airbnb Surge in Host Last-Minute Cancellations During Peak Season',
      category: 'Product Thinking',
    },
    {
      label: 'Slack Free-to-Paid Conversion Plateau',
      topic: 'Slack Self-Serve Paid Team Conversion Drop at 90 Days',
      category: 'Growth & Monetization',
    },
    {
      label: 'Fintech KYC Drop-Off during Bank Linking',
      topic: 'Fintech Consumer App 42% Drop-Off during Plaid Bank Linking',
      category: 'Execution & Tech',
    },
  ],
  teardown: [
    {
      label: 'Linear: High-Velocity Issue Tracking',
      topic: 'Linear App: Keyboard-First Fast Issue Tracker & Opinionated Workflow',
      category: 'Product Thinking',
    },
    {
      label: 'Figma: Real-Time Multiplayer Canvas Wedge',
      topic: 'Figma: Browser-Based WebGL Engine & Multiplayer Viral Loop',
      category: 'Growth & Monetization',
    },
    {
      label: 'Substack: Writer Economics & Recommendation Engine',
      topic: 'Substack: Direct-to-Reader Subscription Engine & Cross-Newsletter Network',
      category: 'Growth & Monetization',
    },
    {
      label: 'Zepto / Blinkit: 10-Minute Dark Store Operations',
      topic: 'Quick-Commerce 10-Minute Grocery Delivery UX & Warehouse Route Optimization',
      category: 'Execution & Tech',
    },
  ],
};

export const GeminiGenerateModal: React.FC<GeminiGenerateModalProps> = ({
  isOpen,
  onClose,
  onMaterialPublished,
}) => {
  const { user, openAuthModal } = useAuth();
  const [type, setType] = useState<LearningItemType>('concept');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<LearningCategory>('Product Thinking');
  const [difficulty, setDifficulty] = useState<LearningDifficulty>('intermediate');
  const [contextOrNotes, setContextOrNotes] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<LearningItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectSuggestion = (s: { topic: string; category: LearningCategory }) => {
    setTopic(s.topic);
    setCategory(s.category);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      openAuthModal?.('login');
      setError('Authentication required: Please sign in to generate learning materials with VerseAI.');
      return;
    }
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedItem(null);
    setPublishSuccess(false);

    try {
      const res = await fetch('/api/learn/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          topic: topic.trim(),
          category,
          difficulty,
          contextOrNotes: contextOrNotes.trim() || undefined,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate learning material');
      }

      setGeneratedItem(data.material);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during generation';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedItem) return;

    if (!user) {
      openAuthModal?.('login');
      setError('Authentication required: Please sign in to publish learning materials.');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedItem),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish material');
      }

      setPublishSuccess(true);
      const published = data.item || generatedItem;
      setTimeout(() => {
        onMaterialPublished(published);
        onClose();
      }, 900);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to publish to knowledge base';
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#201e1d] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#201e1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#ec3013] text-white flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white m-0">
                Generate & Publish PM Material
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Powered by VerseAI · Product Management Curriculum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-left text-[#201e1d]">
          {!user && (
            <div className="bg-amber-50 border-2 border-amber-300 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">Sign in required to generate & publish custom curriculum with VerseAI.</span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal?.('login')}
                className="btn btn-primary text-xs font-bold py-1.5 px-3 self-start sm:self-auto whitespace-nowrap shadow-sm"
              >
                Sign In / Register
              </button>
            </div>
          )}

          {/* 1. Material Type Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              1. Select Material Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setType('concept');
                  setGeneratedItem(null);
                }}
                className={`p-3 text-left border-2 transition-all flex flex-col gap-1 ${
                  type === 'concept'
                    ? 'bg-[#201e1d] text-white border-[#201e1d] shadow-sm'
                    : 'bg-white text-[#201e1d] border-[rgba(32,30,29,0.2)] hover:border-[#201e1d]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <BookOpen className="w-4 h-4 text-[#ec3013]" />
                  <span>Basic Concept</span>
                </div>
                <p className="text-[11px] opacity-80 leading-snug">
                  Frameworks, metrics, ELI5 explanation & interview traps.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('case_study');
                  setGeneratedItem(null);
                }}
                className={`p-3 text-left border-2 transition-all flex flex-col gap-1 ${
                  type === 'case_study'
                    ? 'bg-[#201e1d] text-white border-[#201e1d] shadow-sm'
                    : 'bg-white text-[#201e1d] border-[rgba(32,30,29,0.2)] hover:border-[#201e1d]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Case Study Q&A</span>
                </div>
                <p className="text-[11px] opacity-80 leading-snug">
                  Telemetry board, challenge question, model answer & rubric.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('teardown');
                  setGeneratedItem(null);
                }}
                className={`p-3 text-left border-2 transition-all flex flex-col gap-1 ${
                  type === 'teardown'
                    ? 'bg-[#201e1d] text-white border-[#201e1d] shadow-sm'
                    : 'bg-white text-[#201e1d] border-[rgba(32,30,29,0.2)] hover:border-[#201e1d]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Product Teardown</span>
                </div>
                <p className="text-[11px] opacity-80 leading-snug">
                  Wedge, step-by-step UX flow, monetization & vulnerabilities.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Topic Input & Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                2. Topic or Product to Analyze
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Be specific for richer insights</span>
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                type === 'concept'
                  ? 'e.g. Unit Economics: LTV/CAC Ratio and Payback Period'
                  : type === 'case_study'
                  ? 'e.g. Uber Rider Drop-off during 2.5x Surge Pricing in Rainy Weather'
                  : 'e.g. Linear: Opinionated Fast Issue Tracking & Keyboard-First UX'
              }
              className="w-full p-3 bg-white border-2 border-[rgba(32,30,29,0.25)] text-sm font-bold text-[#201e1d] outline-none focus:border-[#ec3013]"
            />

            {/* Suggestions Chips */}
            <div className="mt-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                💡 Quick Inspiration:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS[type].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="text-[11px] font-bold py-1 px-2.5 bg-white border border-slate-300 hover:border-[#ec3013] hover:text-[#ec3013] text-slate-700 transition-colors"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Category & Difficulty Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LearningCategory)}
                className="w-full p-2.5 bg-white border-2 border-[rgba(32,30,29,0.2)] text-xs font-bold text-[#201e1d] outline-none focus:border-[#ec3013]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as LearningDifficulty)}
                className="w-full p-2.5 bg-white border-2 border-[rgba(32,30,29,0.2)] text-xs font-bold text-[#201e1d] outline-none focus:border-[#ec3013]"
              >
                <option value="beginner">Beginner (Foundations & Core Principles)</option>
                <option value="intermediate">Intermediate (Mid-level PM Scenarios)</option>
                <option value="advanced">Advanced (Staff/Principal Level Complexity)</option>
              </select>
            </div>
          </div>

          {/* 4. Optional Context */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Angle or Instructions (Optional)
            </label>
            <input
              type="text"
              value={contextOrNotes}
              onChange={(e) => setContextOrNotes(e.target.value)}
              placeholder="e.g. Focus on B2B SaaS enterprise sales or mobile-first consumer apps"
              className="w-full p-2.5 bg-white border-2 border-[rgba(32,30,29,0.2)] text-xs font-medium text-[#201e1d] outline-none focus:border-[#ec3013]"
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-rose-50 border border-rose-300 p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedItem && (
            <div className="bg-white border-2 border-[#201e1d] p-4 sm:p-5 space-y-4 shadow-md animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#201e1d] text-white">
                    {generatedItem.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700">
                    {generatedItem.difficulty}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    ⏱ {generatedItem.readTimeMinutes} min read
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready to Publish</span>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-[#201e1d] m-0">
                  {generatedItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium leading-relaxed">
                  {generatedItem.summary}
                </p>
              </div>

              {/* Snapshot of structured fields */}
              {generatedItem.conceptDetail && (
                <div className="bg-[#f3f2f2] p-3 text-xs space-y-1 border-l-2 border-[#ec3013]">
                  <div className="font-extrabold text-[10px] uppercase text-[#ae1800]">ELI5 Preview:</div>
                  <p className="text-slate-800 line-clamp-2">{generatedItem.conceptDetail.simpleExplanation}</p>
                </div>
              )}

              {generatedItem.caseStudyDetail && (
                <div className="bg-[#f3f2f2] p-3 text-xs space-y-1 border-l-2 border-amber-500">
                  <div className="font-extrabold text-[10px] uppercase text-amber-800">
                    Challenge Question:
                  </div>
                  <p className="text-slate-800 font-bold">{generatedItem.caseStudyDetail.coreChallengeQuestion}</p>
                </div>
              )}

              {generatedItem.teardownDetail && (
                <div className="bg-[#f3f2f2] p-3 text-xs space-y-1 border-l-2 border-emerald-500">
                  <div className="font-extrabold text-[10px] uppercase text-emerald-800">
                    The Growth Wedge:
                  </div>
                  <p className="text-slate-800 font-medium line-clamp-2">{generatedItem.teardownDetail.growthLoopOrWedge}</p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {generatedItem.tags.map((t, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 font-bold">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 border-t-2 border-[rgba(32,30,29,0.15)] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs font-bold py-2.5 px-4"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!generatedItem ? (
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !topic.trim()}
                className="btn btn-primary text-xs font-bold py-2.5 px-5 flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Curating with VerseAI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate with VerseAI</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="btn btn-secondary text-xs font-bold py-2 px-3 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || publishSuccess}
                  className="btn btn-primary text-xs font-bold py-2.5 px-5 flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] border-[#15803d]"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing to Hub...</span>
                    </>
                  ) : publishSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Published!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publish to Knowledge Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VerseAiGenerateModal = GeminiGenerateModal;
