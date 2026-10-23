'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AssessmentLevelConfig,
  PublicAssessmentQuestion,
  AssessmentAttempt,
} from '@/types/assessment';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AssessmentRunnerProps {
  levelConfig: AssessmentLevelConfig;
  questions: PublicAssessmentQuestion[];
  userId: string;
  onExit: () => void;
  onCompleted: (attempt: AssessmentAttempt) => void;
}

// Deterministic PRNG shuffle seeded by attempt ID to ensure consistency during an attempt
function seededShuffle<T>(array: T[], seedStr: string): T[] {
  const result = [...array];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  const random = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const AssessmentRunner: React.FC<AssessmentRunnerProps> = ({
  levelConfig,
  questions,
  userId,
  onExit,
  onCompleted,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Attempt ID and timer state
  const [attemptId, setAttemptId] = useState<string>(() => `att-${levelConfig.id}-${Date.now()}`);
  const attemptIdRef = useRef<string>(attemptId);
  const totalSeconds = levelConfig.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const timeSpentRef = useRef<number>(0);

  const storageKey = `pmverse_attempt_${levelConfig.id}_${userId || 'guest'}`;

  // Restore saved draft on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft && draft.answers) {
            setAnswers(draft.answers);
            if (draft.markedForReview) {
              setMarkedForReview(new Set(draft.markedForReview));
            }
            if (draft.currentIndex) {
              setCurrentIndex(Math.min(draft.currentIndex, questions.length - 1));
            }
            if (typeof draft.secondsRemaining === 'number' && draft.secondsRemaining > 0) {
              setSecondsRemaining(draft.secondsRemaining);
              setHasStarted(true);
            }
            if (draft.attemptId) {
              setAttemptId(draft.attemptId);
              attemptIdRef.current = draft.attemptId;
            }
          }
        }
      } catch {}
    }
  }, [storageKey, questions.length]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || isSubmitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        timeSpentRef.current += 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isSubmitting]);

  // Autosave to localStorage and server every 10 seconds or on answer change
  useEffect(() => {
    if (!hasStarted || isSubmitting) return;

    const timeout = setTimeout(() => {
      // 1. Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              attemptId,
              levelId: levelConfig.id,
              answers,
              markedForReview: Array.from(markedForReview),
              currentIndex,
              secondsRemaining,
              updatedAt: new Date().toISOString(),
            })
          );
        } catch {}
      }

      // 2. Autosave to backend API
      setAutoSaveStatus('saving');
      fetch('/api/assessment/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          userId: userId || 'guest',
          levelId: levelConfig.id,
          answers,
          markedForReview: Array.from(markedForReview),
          timeSpentSeconds: totalSeconds - secondsRemaining,
        }),
      })
        .then(() => setAutoSaveStatus('saved'))
        .catch(() => setAutoSaveStatus('error'));
    }, 1500);

    return () => clearTimeout(timeout);
  }, [answers, markedForReview, currentIndex, hasStarted, isSubmitting, secondsRemaining, levelConfig.id, storageKey, totalSeconds, userId, attemptId]);

  const handleStart = () => {
    setHasStarted(true);
  };

  // Randomize question delivery order while keeping Advanced written cases grouped at the end
  const activeQuestions = React.useMemo(() => {
    if (levelConfig.id === 'advanced') {
      const mcqs = questions.filter((q) => q.format !== 'written_case');
      const cases = questions.filter((q) => q.format === 'written_case');
      return [...seededShuffle(mcqs, attemptId), ...cases];
    }
    return seededShuffle(questions, attemptId);
  }, [questions, levelConfig.id, attemptId]);

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];
  const isMarked = markedForReview.has(currentQ?.id);
  const currentAnswer = answers[currentQ?.id] || '';

  // Randomize answer option delivery order per question while preserving canonical answer key mapping
  const displayedOptions = React.useMemo(() => {
    if (!currentQ?.options || currentQ.options.length <= 1) return currentQ?.options || [];
    return seededShuffle(currentQ.options, `${attemptId}_${currentQ.id}`);
  }, [currentQ?.id, currentQ?.options, attemptId]);

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  };

  const handleTextAnswerChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: text,
    }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  const answeredCount = activeQuestions.filter((q) => Boolean(answers[q.id]?.trim())).length;
  const unansweredCount = activeQuestions.length - answeredCount;

  const handleAutoSubmitOnTimeout = () => {
    alert('Time limit reached! Your assessment will now be submitted automatically.');
    executeFinalSubmit();
  };

  const executeFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const timeSpent = Math.max(1, totalSeconds - secondsRemaining);
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attemptIdRef.current,
          userId: userId || 'guest',
          levelId: levelConfig.id,
          answers,
          timeSpentSeconds: timeSpent,
        }),
      });

      const data = await res.json();
      if (data.success && data.attempt) {
        // Clear local draft
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(storageKey);
          } catch {}
        }
        onCompleted(data.attempt);
      } else {
        alert(data.error || 'Failed to submit assessment. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      alert(err.message || 'Submission error. Please check your internet connection.');
      setIsSubmitting(false);
    }
  };

  // Format countdown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = secondsRemaining <= 120; // < 2 minutes

  // -------------------------------------------------------------------------
  // PRE-START BRIEFING SCREEN
  // -------------------------------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-white border-2 border-[#201e1d] p-6 sm:p-8 text-left shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[rgba(32,30,29,0.15)] mb-6">
          <div>
            <span className="tag tag-accent font-bold text-[10px] uppercase tracking-wider">
              Assessment Briefing
            </span>
            <h2 className="text-2xl font-black text-[#201e1d] mt-1 m-0">
              {levelConfig.title}
            </h2>
          </div>
          <button
            onClick={onExit}
            className="p-1 border border-[#201e1d] hover:bg-[#201e1d] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p className="text-sm font-semibold text-[#201e1d]">
            {levelConfig.focusDescription}
          </p>

          <div className="p-4 bg-[#f3f2f2] border border-[#201e1d]/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Questions</span>
              <span className="font-bold text-sm text-[#201e1d]">{questions.length} Total</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Duration</span>
              <span className="font-bold text-sm text-[#201e1d]">{levelConfig.durationMinutes} Minutes</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Passing Score</span>
              <span className="font-bold text-sm text-[#ec3013]">{levelConfig.passingScorePercent}% to Pass</span>
            </div>
          </div>

          <div className="border border-slate-200 p-4 bg-slate-50 space-y-2">
            <span className="font-bold text-xs text-[#201e1d] block">Format & Evaluation Instructions:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>{levelConfig.formatDescription}.</li>
              <li>You can navigate freely between questions using the Question Palette or Next / Previous buttons.</li>
              <li>Use <strong>Mark for Review</strong> to flag uncertain questions for later inspection.</li>
              <li>Your progress is continuously autosaved to prevent data loss.</li>
              {levelConfig.id === 'advanced' && (
                <li>Written strategic cases are evaluated against professional multi-dimensional rubrics (Quantitative rigor, Prioritization quality, Uncertainty treatment, Strategic alignment).</li>
              )}
              <li>Once submitted, you will receive a comprehensive competency breakdown with question-by-question explanations.</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-[rgba(32,30,29,0.15)] flex justify-between items-center gap-4 mt-6">
          <button onClick={onExit} className="btn btn-secondary text-xs font-bold py-2 px-4">
            Cancel & Back
          </button>
          <button
            onClick={handleStart}
            className="btn btn-primary text-xs font-bold uppercase tracking-wider py-2.5 px-6 flex items-center gap-2 shadow"
          >
            Start Assessment Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // IN-PROGRESS DISTRACTION-FREE ASSESSMENT RUNNER
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-4 text-left">
      {/* Sticky Top Status Bar */}
      <div className="sticky top-2 z-30 bg-white border-2 border-[#201e1d] p-3 sm:p-4 shadow-md flex items-center justify-between gap-4">
        {/* Left: Level & Progress */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPalette(true)}
            className="tag bg-slate-100 hover:bg-slate-200 text-[#201e1d] border border-[#201e1d] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Question {currentIndex + 1} of {activeQuestions.length}</span>
          </button>

          <span className="hidden sm:inline-block text-xs font-bold text-slate-500 truncate max-w-[200px]">
            {levelConfig.title.split('—')[0]}
          </span>
        </div>

        {/* Center: Autosave Pill */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span
            className={`w-2 h-2 rounded-full ${
              autoSaveStatus === 'saving'
                ? 'bg-amber-500 animate-ping'
                : autoSaveStatus === 'saved'
                ? 'bg-emerald-500'
                : 'bg-rose-500'
            }`}
          />
          <span>{autoSaveStatus === 'saving' ? 'Saving draft...' : 'All answers saved'}</span>
        </div>

        {/* Right: Timer & Finish */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 border-2 font-mono font-bold text-sm ${
              isTimeCritical
                ? 'border-rose-600 bg-rose-50 text-rose-700 animate-pulse'
                : 'border-[#201e1d] bg-[#f3f2f2] text-[#201e1d]'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="btn btn-primary text-xs font-bold py-1.5 px-3 uppercase tracking-wider"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8 shadow-sm">
        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="tag bg-slate-100 border border-slate-300 text-slate-800 font-bold text-[10px]">
              {currentQ.competency}
            </span>
            <span className="tag bg-orange-100 text-orange-900 border border-orange-300 font-bold text-[10px] uppercase">
              {currentQ.format.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={toggleMarkForReview}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 border transition-colors ${
              isMarked
                ? 'bg-amber-100 text-amber-900 border-amber-400'
                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isMarked ? 'fill-amber-600 text-amber-600' : ''}`} />
            <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
          </button>
        </div>

        {/* Scenario Block (if present) */}
        {currentQ.scenario && (
          <div className="mb-5 p-4 bg-[#f8f7f6] border-l-4 border-[#201e1d] border-y border-r border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Scenario Context:
            </span>
            {currentQ.scenario}
          </div>
        )}

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-black text-[#201e1d] leading-snug mb-6">
          {currentQ.questionText}
        </h2>

        {/* Question Input: Options (MCQ) vs Textarea (Written Case) */}
        {currentQ.format === 'written_case' ? (
          <div className="space-y-4">
            {currentQ.rubric && currentQ.rubric.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-950">
                <span className="font-bold block mb-1">Evaluation Rubric Dimensions:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {currentQ.rubric.map((r) => (
                    <div key={r.id} className="flex items-start gap-1.5">
                      <span className="font-bold text-[#ec3013]">· {r.name} ({r.weight}%):</span>
                      <span className="text-slate-600">{r.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                value={currentAnswer}
                onChange={(e) => handleTextAnswerChange(e.target.value)}
                placeholder="Type your strategic analysis, calculations, trade-offs, and executive recommendation here..."
                rows={12}
                className="w-full p-4 border-2 border-[#201e1d] text-sm text-[#201e1d] font-mono leading-relaxed bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#ec3013]"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1 px-1">
                <span>Auto-saved to draft</span>
                <span className="font-mono font-bold">
                  {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} Words
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedOptions.map((option) => {
              const isSelected = currentAnswer === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => handleSelectOption(option.key)}
                  className={`w-full p-4 border-2 text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-[#201e1d] bg-[#eae9e9] shadow-sm'
                      : 'border-slate-200 bg-white hover:border-[#201e1d]/50 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded border-2 flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'border-[#201e1d] bg-[#201e1d] text-[#f3f2f2]'
                        : 'border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {option.key}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#201e1d] pt-0.5 leading-relaxed">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky Toolbar */}
      <div className="bg-white border-2 border-[#201e1d] p-4 flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={() => setShowPalette(true)}
          className="text-xs font-bold text-slate-600 hover:text-[#201e1d] flex items-center gap-1"
        >
          <span>{answeredCount} / {activeQuestions.length} Answered</span>
        </button>

        {currentIndex === activeQuestions.length - 1 ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn btn-primary text-xs font-bold uppercase tracking-wider py-2 px-6 flex items-center gap-1 shadow"
          >
            Review & Submit <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
            className="btn btn-primary text-xs font-bold py-2 px-5 flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ---------------------------------------------------------------------
          MODAL: QUESTION PALETTE / NAVIGATION DRAWER
      --------------------------------------------------------------------- */}
      {showPalette && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white border-2 border-[#201e1d] max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-[#201e1d] m-0">Question Navigator</h3>
              <button onClick={() => setShowPalette(false)} className="p-1 hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-800" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-600" />
                <span>Marked ({markedForReview.size})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-300" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
              {activeQuestions.map((q, idx) => {
                const isAns = Boolean(answers[q.id]?.trim());
                const isFlg = markedForReview.has(q.id);
                const isCurr = currentIndex === idx;

                let bgClass = 'bg-white border-slate-300 text-slate-700';
                if (isAns) bgClass = 'bg-emerald-600 border-emerald-700 text-white font-black';
                if (isFlg) bgClass = 'bg-amber-400 border-amber-500 text-amber-950 font-black';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPalette(false);
                    }}
                    className={`h-11 rounded border-2 flex flex-col items-center justify-center text-xs relative transition-transform hover:scale-105 ${bgClass} ${
                      isCurr ? 'ring-2 ring-[#201e1d] ring-offset-2 scale-105' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlg && <span className="text-[9px] -mt-1">★</span>}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4 flex justify-end">
              <button
                onClick={() => setShowPalette(false)}
                className="btn btn-secondary text-xs font-bold py-1.5 px-4"
              >
                Close Palette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: SUBMISSION CONFIRMATION
      --------------------------------------------------------------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
          <div className="bg-white border-2 border-[#201e1d] max-w-md w-full p-6 shadow-2xl relative text-left animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 text-amber-800 rounded border border-amber-300 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#201e1d] m-0">Submit Assessment?</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Once submitted, your answers will be graded authoritatively and recorded.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#f3f2f2] border border-[#201e1d]/20 space-y-2 mb-6 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Total Questions:</span>
                <span className="text-[#201e1d]">{activeQuestions.length}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-emerald-700">Answered:</span>
                <span className="text-emerald-700">{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Unanswered:</span>
                  <span>{unansweredCount}</span>
                </div>
              )}
              {markedForReview.size > 0 && (
                <div className="flex justify-between font-bold text-amber-800">
                  <span>Marked for Review:</span>
                  <span>{markedForReview.size}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="btn btn-secondary text-xs font-bold py-2 px-4"
              >
                Back to Questions
              </button>
              <button
                onClick={executeFinalSubmit}
                disabled={isSubmitting}
                className="btn btn-primary text-xs font-bold py-2 px-5 uppercase tracking-wider"
              >
                {isSubmitting ? 'Grading Answers...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
