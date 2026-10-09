'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AssessmentQuestion,
  AssessmentResult,
  CategoryScore,
  AnswerReviewItem,
  SavedQuizResult,
  AssessmentCategory,
} from '@/types';
import {
  PM_ASSESSMENT_QUESTIONS,
  PM_COMPETENCY_CATEGORIES,
  CATEGORY_RECOMMENDATIONS,
  PM_CASE_STUDIES,
} from '@/data/assessmentQuestions';
import {
  Award,
  BarChart3,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Filter,
  Flame,
  HelpCircle,
  History,
  Layers,
  Lightbulb,
  ListOrdered,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  XCircle,
  Briefcase,
  TrendingUp,
  Sliders,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { saveQuizResultToDb, getUserQuizResultsFromDb } from '@/lib/supabase/database';

interface AssessmentQuizProps {
  questions?: AssessmentQuestion[];
}

type AssessmentMode = 'full_50' | 'rapid_10' | 'category_focus' | 'case_studies';

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = () => {
  const { user, profile, updateProfile, openAuthModal, isConfigured } = useAuth();

  // Mode & configuration
  const [mode, setMode] = useState<AssessmentMode>('full_50');
  const [selectedFocusCategory, setSelectedFocusCategory] = useState<AssessmentCategory>(
    'Product Thinking'
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [caseStudyNotes, setCaseStudyNotes] = useState<Record<string, string>>({});

  // Active question set based on mode
  const activeQuestionSet = useMemo(() => {
    if (mode === 'rapid_10') {
      // Pick question 1 of each of the 10 categories (e.g. Q1, Q6, Q11, Q16, Q21, Q26, Q31, Q36, Q41, Q46)
      return PM_COMPETENCY_CATEGORIES.map((cat) => {
        return PM_ASSESSMENT_QUESTIONS.find((q) => q.category === cat) || PM_ASSESSMENT_QUESTIONS[0];
      });
    }
    if (mode === 'category_focus') {
      return PM_ASSESSMENT_QUESTIONS.filter((q) => q.category === selectedFocusCategory);
    }
    // Default full 50
    return PM_ASSESSMENT_QUESTIONS;
  }, [mode, selectedFocusCategory]);

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState(false);
  const [isBadgeAddedToProfile, setIsBadgeAddedToProfile] = useState(false);
  const [pastResults, setPastResults] = useState<SavedQuizResult[]>([]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>('all');

  const currentQ = activeQuestionSet[currentIdx] || activeQuestionSet[0];
  const progressPercent = Math.round(((currentIdx + 1) / activeQuestionSet.length) * 100);
  const answeredCount = Object.keys(selectedAnswers).length;

  // Load past quiz results if authenticated
  useEffect(() => {
    let mounted = true;
    async function loadPast() {
      if (user && isConfigured) {
        const history = await getUserQuizResultsFromDb(user.id);
        if (mounted && history.length > 0) {
          setPastResults(history);
        }
      }
    }
    loadPast();
    return () => {
      mounted = false;
    };
  }, [user, isConfigured]);

  // Reset indices when mode changes
  const switchMode = (newMode: AssessmentMode) => {
    setMode(newMode);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setResult(null);
    setIsBadgeAddedToProfile(false);
    setIsPaletteOpen(false);
  };

  const handleSelectOption = (qId: number, optionKey: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  const handleNext = () => {
    if (currentIdx < activeQuestionSet.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Comprehensive Rubric & Evaluation Engine
  const calculateResult = async () => {
    let totalCorrect = 0;
    const totalQuestions = activeQuestionSet.length;

    // Track category scores
    const categoryStats: Record<string, { correct: number; total: number }> = {};
    PM_COMPETENCY_CATEGORIES.forEach((cat) => {
      categoryStats[cat] = { correct: 0, total: 0 };
    });

    const answersReview: AnswerReviewItem[] = [];

    activeQuestionSet.forEach((q) => {
      const selected = selectedAnswers[q.id] || null;
      const isCorrect = selected === q.correctOption;

      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { correct: 0, total: 0 };
      }
      categoryStats[q.category].total += 1;

      if (isCorrect) {
        totalCorrect += 1;
        categoryStats[q.category].correct += 1;
      }

      answersReview.push({
        questionId: q.id,
        category: q.category,
        title: q.title,
        scenario: q.scenario,
        selectedOption: selected,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
        competencyTested: q.competencyTested,
      });
    });

    const scorePercentage = Math.round((totalCorrect / totalQuestions) * 100);

    // Compute category level and recommendations
    const categoryScores: CategoryScore[] = Object.entries(categoryStats)
      .filter(([_, data]) => data.total > 0)
      .map(([catName, data]) => {
        const cat = catName as AssessmentCategory;
        const pct = Math.round((data.correct / data.total) * 100);
        let level = 'Foundational understanding';
        if (data.correct === data.total) level = 'Excellent performance';
        else if (data.correct >= 4) level = 'Strong understanding';
        else if (data.correct === 3) level = 'Foundational understanding';
        else if (data.correct === 2) level = 'Developing';
        else level = 'Needs significant improvement';

        return {
          category: cat,
          score: data.correct,
          total: data.total,
          percentage: pct,
          level,
          recommendation: CATEGORY_RECOMMENDATIONS[cat] || 'Deepen fundamentals in this area.',
        };
      });

    // Score Bands
    let assessmentLabel: AssessmentResult['assessmentLabel'] = 'Competent';
    let archetype = 'Product Strategist';
    let recommendedRole = 'Product Manager (B2B SaaS / Growth)';
    let summary =
      'You demonstrate a solid foundation across product management competencies with strong judgment in user-centric problem solving.';

    if (scorePercentage >= 90) {
      assessmentLabel = 'Advanced';
      archetype = 'High-Agency Product Leader';
      recommendedRole = 'Lead / Principal Product Manager or Group PM';
      summary =
        'Exceptional product judgment! You excel at ruthless prioritization, risk mitigation, data analysis, and cross-functional leadership under high uncertainty.';
    } else if (scorePercentage >= 75) {
      assessmentLabel = 'Strong';
      archetype = 'Strategic Product Builder';
      recommendedRole = 'Senior Product Manager';
      summary =
        'Strong, mature product instincts! You balance commercial goals with engineering realities and make sound evidence-based trade-offs.';
    } else if (scorePercentage >= 60) {
      assessmentLabel = 'Competent';
      archetype = 'Product Specialist';
      recommendedRole = 'Product Manager (Feature / Growth Squad)';
      summary =
        'Good working foundation across core PM competencies. With focused practice in root cause analysis and technical trade-offs, you will excel.';
    } else if (scorePercentage >= 40) {
      assessmentLabel = 'Developing';
      archetype = 'Emerging Product Builder';
      recommendedRole = 'Associate PM / Product Analyst';
      summary =
        'You understand essential concepts but show occasional inconsistency in navigating ambiguous edge-cases and stakeholder trade-offs.';
    } else {
      assessmentLabel = 'Beginner';
      archetype = 'Aspiring Product Explorer';
      recommendedRole = 'Associate PM Intern / Product Operations';
      summary =
        'Foundational PM concepts need development. Focus on problem discovery, metric literacy, and separating symptoms from root causes.';
    }

    // Top strengths (highest category scores)
    const sortedCategories = [...categoryScores].sort((a, b) => b.percentage - a.percentage);
    const strengths = sortedCategories
      .filter((c) => c.percentage >= 60)
      .slice(0, 3)
      .map((c) => `${c.category}: ${c.level} (${c.percentage}%)`);

    // Growth areas (lowest category scores)
    const growthAreas = sortedCategories
      .filter((c) => c.percentage < 80)
      .reverse()
      .slice(0, 3)
      .map((c) => `${c.category}: ${c.recommendation}`);

    const calculated: AssessmentResult = {
      scorePercentage,
      totalCorrect,
      totalQuestions,
      archetype,
      assessmentLabel,
      summary,
      categoryScores,
      strengths:
        strengths.length > 0
          ? strengths
          : ['Continue building hands-on familiarity with end-to-end product lifecycles.'],
      growthAreas:
        growthAreas.length > 0
          ? growthAreas
          : ['Maintain high standards across experimentation and systems architecture.'],
      recommendedRole,
      answersReview,
    };

    setResult(calculated);

    // Save to user profile & Supabase
    if (user) {
      updateProfile({ pmFitScore: scorePercentage }).catch(() => {});
      if (isConfigured) {
        const ok = await saveQuizResultToDb(user.id, calculated);
        if (ok) {
          setIsSavedToDb(true);
        }
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setResult(null);
    setIsSavedToDb(false);
    setIsBadgeAddedToProfile(false);
  };

  // Filtered review items
  const filteredReviews = useMemo(() => {
    if (!result?.answersReview) return [];
    return result.answersReview.filter((item) => {
      const matchStatus =
        reviewFilter === 'all' ||
        (reviewFilter === 'correct' && item.isCorrect) ||
        (reviewFilter === 'incorrect' && !item.isCorrect);

      const matchCategory =
        reviewCategoryFilter === 'all' || item.category === reviewCategoryFilter;

      return matchStatus && matchCategory;
    });
  }, [result, reviewFilter, reviewCategoryFilter]);

  const activeCase =
    PM_CASE_STUDIES.find((c) => c.id === selectedCaseId) || PM_CASE_STUDIES[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Modernist PMX Assessment Header */}
      <div className="bg-[#f3f2f2] border-2 border-[rgba(32,30,29,0.15)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[rgba(32,30,29,0.15)]">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#ae1800] font-bold mb-1">
              PM Fit Assessment · Official Diagnostic
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201e1d] tracking-tight m-0">
              PM Competency Assessment
            </h1>
            <p className="text-xs text-[#605d5d] mt-1 max-w-xl">
              50 scenario-based questions across 10 core PM disciplines designed to evaluate real-world product judgment, trade-offs, and analytical rigor.
            </p>
          </div>

          {/* Quick stats on user profile */}
          {profile?.pmFitScore && (
            <div className="border-2 border-[#201e1d] p-3 flex items-center gap-3 shrink-0 bg-[#eae9e9]">
              <div className="text-3xl font-black text-[#ec3013] leading-none">
                {profile.pmFitScore}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#605d5d]">
                  Profile Score
                </p>
                <p className="text-xs font-bold text-[#201e1d]">Verified / 100</p>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selector Tabs (Modernist Segmented) */}
        <div className="flex flex-wrap border-2 border-[rgba(32,30,29,0.15)] mt-4 text-xs font-bold">
          <button
            onClick={() => switchMode('full_50')}
            className={`flex-1 py-2.5 px-3 text-center transition-colors border-r border-[rgba(32,30,29,0.15)] ${
              mode === 'full_50'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'bg-transparent text-[#201e1d] hover:bg-[rgba(32,30,29,0.05)]'
            }`}
          >
            Full 50 Exam
          </button>

          <button
            onClick={() => switchMode('rapid_10')}
            className={`flex-1 py-2.5 px-3 text-center transition-colors border-r border-[rgba(32,30,29,0.15)] ${
              mode === 'rapid_10'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'bg-transparent text-[#201e1d] hover:bg-[rgba(32,30,29,0.05)]'
            }`}
          >
            10-Question Pulse
          </button>

          <button
            onClick={() => switchMode('category_focus')}
            className={`flex-1 py-2.5 px-3 text-center transition-colors border-r border-[rgba(32,30,29,0.15)] ${
              mode === 'category_focus'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'bg-transparent text-[#201e1d] hover:bg-[rgba(32,30,29,0.05)]'
            }`}
          >
            Category Focus
          </button>

          <button
            onClick={() => switchMode('case_studies')}
            className={`flex-1 py-2.5 px-3 text-center transition-colors ${
              mode === 'case_studies'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'bg-transparent text-[#201e1d] hover:bg-[rgba(32,30,29,0.05)]'
            }`}
          >
            Case Studies
          </button>
        </div>

        {/* Category Focus Dropdown */}
        {mode === 'category_focus' && (
          <div className="mt-3 pt-3 border-t border-[rgba(32,30,29,0.15)] flex items-center gap-2 text-xs">
            <span className="text-[#605d5d] font-semibold">Select Focus Category:</span>
            <select
              value={selectedFocusCategory}
              onChange={(e) => {
                setSelectedFocusCategory(e.target.value as AssessmentCategory);
                setCurrentIdx(0);
                setSelectedAnswers({});
                setResult(null);
              }}
              className="px-2.5 py-1 border border-[rgba(32,30,29,0.3)] bg-white text-[#201e1d] font-bold outline-none"
            >
              {PM_COMPETENCY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} (5 Questions)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================
          MODE 1, 2, 3: QUIZ QUESTION ENGINE OR RESULTS VIEW
         ======================================================== */}
      {mode !== 'case_studies' && (
        <>
          {!result ? (
            /* Active Question Card */            <div className="bg-[#f3f2f2] border-2 border-[rgba(32,30,29,0.15)] p-5 sm:p-6 space-y-5">
              {/* Top Progress & Stats */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#605d5d] mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-[#201e1d]">
                      Question {currentIdx + 1} of {activeQuestionSet.length}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>
                      {answeredCount} of {activeQuestionSet.length} answered
                    </span>
                  </div>

                  <button
                    onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                    className="text-xs font-bold text-[#ae1800] hover:underline"
                  >
                    <span>{isPaletteOpen ? 'Hide Question Grid' : 'Question Grid (Jump)'}</span>
                  </button>
                </div>

                <div className="w-full h-1 bg-[#d7d3d3]">
                  <div
                    className="h-full bg-[#ec3013] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Collapsible Question Palette Drawer */}
              {isPaletteOpen && (
                <div className="p-3 bg-[#eae9e9] border border-[rgba(32,30,29,0.15)] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(32,30,29,0.15)] text-xs font-bold text-[#201e1d]">
                    <span>Jump to Question</span>
                    <div className="flex items-center space-x-3 text-[11px] text-[#605d5d]">
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 bg-[#ec3013]" />
                        <span>Answered</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 bg-white border border-slate-300" />
                        <span>Unanswered</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {activeQuestionSet.map((q, idx) => {
                      const isAnswered = selectedAnswers[q.id] !== undefined;
                      const isCurrent = idx === currentIdx;

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentIdx(idx);
                            setIsPaletteOpen(false);
                          }}
                          className={`h-8 text-xs font-bold transition flex items-center justify-center ${
                            isCurrent
                              ? 'border-2 border-[#201e1d] bg-[#ec3013] text-white'
                              : isAnswered
                              ? 'bg-[#201e1d] text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category & Competency Meta */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="tag tag-accent font-bold">
                  {currentQ.category}
                </span>
                <span className="text-xs text-[#605d5d] font-semibold">
                  Evaluates: {currentQ.competencyTested}
                </span>
              </div>

              {/* Question Title & Scenario */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#605d5d]">
                  {currentQ.title}
                </h3>
                <div className="bg-[#eae9e9] p-4 border border-[rgba(32,30,29,0.15)] text-sm text-[#201e1d] leading-relaxed">
                  {currentQ.scenario}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#201e1d] leading-snug">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options List (Modernist 2px border boxes) */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.key;

                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`w-full text-left p-3.5 border-2 transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#ec3013] bg-[#fff2ef]'
                          : 'border-[rgba(32,30,29,0.15)] bg-[#eae9e9] hover:border-[#201e1d]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 border text-xs font-black flex items-center justify-center shrink-0 mt-0.5 select-none transition ${
                          isSelected
                            ? 'border-[#ec3013] bg-[#ec3013] text-[#f3f2f2]'
                            : 'border-slate-300 bg-white text-[#201e1d]'
                        }`}
                      >
                        {opt.key}
                      </div>
                      <span className="text-sm text-[#201e1d] font-semibold leading-relaxed">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-[rgba(32,30,29,0.15)]">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="btn btn-secondary text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {currentIdx === activeQuestionSet.length - 1 ? (
                    <button
                      onClick={calculateResult}
                      disabled={!selectedAnswers[currentQ.id]}
                      className="btn btn-primary text-xs font-bold px-5"
                    >
                      <span>Submit & Grade Assessment</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!selectedAnswers[currentQ.id]}
                      className="btn btn-primary text-xs font-bold px-5"
                    >
                      <span>Next Question</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results & Competency Diagnostic Report View */
            <div className="bg-[#f3f2f2] border-2 border-[rgba(32,30,29,0.15)] p-6 sm:p-8 space-y-8">
              {/* Score Header Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end pb-8 border-b-2 border-[rgba(32,30,29,0.15)]">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#ae1800] font-bold">
                    Your PM Fit Score · Official Diagnostic
                  </div>
                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-8xl sm:text-9xl font-black text-[#ec3013] leading-none tracking-tighter">
                      {result.scorePercentage}
                    </span>
                    <span className="text-2xl font-bold text-[#7d7979]">/ 100</span>
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight mt-3 text-[#201e1d]">
                    {result.archetype}
                  </div>
                  <p className="text-sm text-[#201e1d] mt-2 max-w-md leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Score Bands Bar */}
                <div className="border-t-2 border-[rgba(32,30,29,0.15)] pt-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#605d5d] mb-2">
                    Score Distribution Bands
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[
                      { label: 'Low fit', range: '0–39', active: result.scorePercentage < 40 },
                      {
                        label: 'Developing',
                        range: '40–59',
                        active: result.scorePercentage >= 40 && result.scorePercentage < 60,
                      },
                      {
                        label: 'Good potential',
                        range: '60–74',
                        active: result.scorePercentage >= 60 && result.scorePercentage < 75,
                      },
                      {
                        label: 'Strong PM fit',
                        range: '75–89',
                        active: result.scorePercentage >= 75 && result.scorePercentage < 90,
                      },
                      {
                        label: 'Exceptional',
                        range: '90–100',
                        active: result.scorePercentage >= 90,
                      },
                    ].map((b, bi) => (
                      <div key={bi}>
                        <div
                          className={`h-3 ${b.active ? 'bg-[#ec3013]' : 'bg-[#d7d3d3]'}`}
                        />
                        <div
                          className={`text-[11px] mt-1.5 leading-tight ${
                            b.active ? 'font-extrabold text-[#ae1800]' : 'text-slate-600'
                          }`}
                        >
                          {b.label}
                        </div>
                        <div className="text-[10px] text-[#605d5d]">{b.range}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        if (!user) {
                          openAuthModal('signin');
                          return;
                        }
                        setIsBadgeAddedToProfile(true);
                        await updateProfile({ pmFitScore: result.scorePercentage });
                        alert(
                          `Certified PM Skill Badge (${result.scorePercentage}%) added to your public profile!`
                        );
                      }}
                      className="btn btn-primary text-xs font-bold"
                    >
                      <span>
                        {isBadgeAddedToProfile
                          ? '✓ Badge Displayed on Profile'
                          : 'Add Certified Badge to Profile'}
                      </span>
                    </button>
                    <button
                      onClick={handleRetake}
                      className="btn btn-secondary text-xs font-bold"
                    >
                      <span>Retake Assessment</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-Column Diagnostic Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-[rgba(32,30,29,0.15)] border-2 border-[rgba(32,30,29,0.15)]">
                {/* 1. Category Diagnostic Breakdown */}
                <div className="bg-[#f3f2f2] p-6 space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-3">
                    Competencies (10 Areas)
                  </div>
                  <div className="divide-y divide-[rgba(32,30,29,0.15)]">
                    {result.categoryScores.map((cat, idx) => (
                      <div key={idx} className="py-2.5">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-[#201e1d]">{cat.category}</span>
                          <span className="font-extrabold text-[#ec3013]">
                            {cat.score}/{cat.total} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#d7d3d3]">
                          <div
                            className={`h-full ${
                              cat.percentage >= 80 ? 'bg-[#201e1d]' : 'bg-[#ec3013]'
                            }`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Natural Strengths & Growth Areas */}
                <div className="bg-[#f3f2f2] p-6 space-y-6">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-2">
                      Key Strengths
                    </div>
                    <div className="space-y-1.5 text-sm font-semibold text-[#201e1d]">
                      {result.strengths.map((str, i) => (
                        <div key={i}>✓ {str}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#ae1800] font-bold mb-2">
                      Growth Areas to Improve
                    </div>
                    <div className="space-y-1.5 text-sm font-semibold text-[#ae1800]">
                      {result.growthAreas.map((ga, i) => (
                        <div key={i}>→ {ga}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-2">
                      Recommended Track
                    </div>
                    <span className="tag tag-neutral text-xs font-bold">
                      {result.recommendedRole}
                    </span>
                  </div>
                </div>

                {/* 3. Action Cards */}
                <div className="bg-[#f3f2f2] p-6 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-3">
                      Recommended Next Steps
                    </div>
                    <p className="text-xs text-[#605d5d] leading-relaxed mb-4">
                      Review question-by-question explanations or jump directly to open roles matching your score.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById('answers-review-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="btn btn-secondary w-full justify-between text-xs font-bold"
                    >
                      <span>Review All 50 Answers</span>
                      <span>↓</span>
                    </button>
                    <button
                      onClick={handleRetake}
                      className="btn btn-ghost w-full justify-start text-xs font-bold"
                    >
                      Retake Diagnostic
                    </button>
                  </div>
                </div>
              </div>

              {/* Natural Strengths & Growth Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Strengths</span>
                  </h4>
                  <ul className="text-xs text-emerald-950 space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span>Areas to Develop</span>
                  </h4>
                  <ul className="text-xs text-amber-950 space-y-2">
                    {result.growthAreas.map((g, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-amber-600 font-bold">→</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Question-by-Question Review with Explanations */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Question Review & Evaluation Logic
                    </h3>
                    <p className="text-xs text-slate-500">
                      Understand why the best answer is strongest for each realistic PM business scenario.
                    </p>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-slate-200 rounded-md overflow-hidden text-xs">
                      <button
                        onClick={() => setReviewFilter('all')}
                        className={`px-2.5 py-1 ${
                          reviewFilter === 'all'
                            ? 'bg-[#0a66c2] text-white font-bold'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        All ({result.totalQuestions})
                      </button>
                      <button
                        onClick={() => setReviewFilter('correct')}
                        className={`px-2.5 py-1 ${
                          reviewFilter === 'correct'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Correct ({result.totalCorrect})
                      </button>
                      <button
                        onClick={() => setReviewFilter('incorrect')}
                        className={`px-2.5 py-1 ${
                          reviewFilter === 'incorrect'
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Missed ({result.totalQuestions - result.totalCorrect})
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredReviews.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border text-left transition ${
                        item.isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              item.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {item.isCorrect ? '✓' : '✕'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Q{item.questionId}. {item.title}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold ${
                            item.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {item.isCorrect ? '+1 Pt' : '0 Pts'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 mt-2 italic bg-white/70 p-2.5 rounded border border-slate-200">
                        "{item.scenario}"
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 text-xs">
                        <div className="p-2 rounded bg-white border border-slate-200">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Your Selection:
                          </span>
                          <span
                            className={`font-bold ${
                              item.isCorrect ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            Option {item.selectedOption || 'Unanswered'}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-white border border-slate-200">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Correct Best Answer:
                          </span>
                          <span className="font-bold text-emerald-700">
                            Option {item.correctOption}
                          </span>
                        </div>
                      </div>

                      {/* Explanation Callout */}
                      <div className="mt-2.5 p-3 rounded-md bg-white border border-slate-200 text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-900 font-bold mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Evaluation Logic & Why:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {item.explanation}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Competency: {item.competencyTested}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          MODE 4: LAYER 2 PRACTICAL PM CASE STUDIES
         ======================================================== */}
      {mode === 'case_studies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Layer 2 Practical PM Cases
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Open-Ended Scenario Case Studies
                </h2>
                <p className="text-xs text-slate-500">
                  Go beyond multiple-choice: write realistic product proposals and action plans evaluated against calibrated PM rubrics.
                </p>
              </div>

              {/* Case Picker */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Select Case:</span>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900 outline-none focus:border-[#0a66c2]"
                >
                  {PM_CASE_STUDIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Case Details Card */}
            <div className="pt-4 space-y-4 text-left">
              <div>
                <span className="text-[11px] font-bold text-[#0a66c2] uppercase tracking-wider">
                  {activeCase.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeCase.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {activeCase.scenario}
                </p>
              </div>

              {/* Context Points */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Context & Operating Constraints:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 pl-1">
                  {activeCase.contextPoints.map((pt, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-[#0a66c2] font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Tasks */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Your PM Deliverables:
                </h4>
                <div className="space-y-1.5">
                  {activeCase.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-sky-50/50 border border-sky-100 text-xs font-medium text-slate-800"
                    >
                      {task}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Notepad */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Draft Your PM Proposal / Action Plan:
                </label>
                <textarea
                  rows={6}
                  value={caseStudyNotes[activeCase.id] || ''}
                  onChange={(e) =>
                    setCaseStudyNotes({ ...caseStudyNotes, [activeCase.id]: e.target.value })
                  }
                  placeholder="Outline your problem definition, root cause hypotheses, metrics, and trade-off rationale here..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:border-[#0a66c2] outline-none text-[#191919] leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Self-evaluate your answer using the rubric below</span>
                  <button
                    onClick={() => {
                      alert('Proposal draft saved locally in your active PMVerse workspace!');
                    }}
                    className="px-3 py-1 bg-[#0a66c2] text-white rounded text-xs font-semibold hover:bg-[#004182]"
                  >
                    Save Draft
                  </button>
                </div>
              </div>

              {/* Evaluation Rubric Table */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Official Evaluation Rubric:
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {activeCase.rubric.map((r, i) => (
                    <div key={i} className="p-3 bg-white flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{r.dimension}</span>
                        <span className="text-slate-500 text-[11px]">{r.description}</span>
                      </div>
                      <span className="font-bold text-[#0a66c2] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200 shrink-0">
                        {r.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
