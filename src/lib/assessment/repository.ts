import fs from 'fs';
import path from 'path';
import {
  AssessmentLevelConfig,
  AssessmentLevelId,
  AssessmentQuestion,
  PublicAssessmentQuestion,
  UserLevelProgress,
  AssessmentAttempt,
} from '@/types/assessment';
import {
  ASSESSMENT_LEVEL_CONFIGS,
  INITIAL_ASSESSMENT_QUESTIONS,
} from '@/data/threeLevelQuestions';
import { scoreAssessmentSubmission } from './scoring';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

// Local disk persistence for resilience and immediate zero-latency local operation
const CACHE_DIR = path.join(process.cwd(), 'src', 'data', '.assessment_cache');
const QUESTIONS_FILE = path.join(CACHE_DIR, 'questions.json');
const ATTEMPTS_FILE = path.join(CACHE_DIR, 'attempts.json');

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch {}
  }
}

function loadCachedQuestions(): AssessmentQuestion[] {
  ensureCacheDir();
  const canonicalMap = new Map(INITIAL_ASSESSMENT_QUESTIONS.map((q) => [q.id, q]));
  let questions: AssessmentQuestion[] = [...INITIAL_ASSESSMENT_QUESTIONS];

  if (fs.existsSync(QUESTIONS_FILE)) {
    try {
      const raw = fs.readFileSync(QUESTIONS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Keep custom questions created by administrators
        const customQuestions = parsed.filter(
          (q: AssessmentQuestion) => !canonicalMap.has(q.id)
        );
        // For canonical questions, preserve admin active state if toggled, but take latest definition
        questions = [
          ...INITIAL_ASSESSMENT_QUESTIONS.map((initQ) => {
            const cached = parsed.find((p: AssessmentQuestion) => p.id === initQ.id);
            if (cached && typeof cached.isActive === 'boolean') {
              return { ...initQ, isActive: cached.isActive };
            }
            return initQ;
          }),
          ...customQuestions,
        ];
      }
    } catch {}
  }

  // Persist updated list
  saveCachedQuestions(questions);
  return questions;
}

function saveCachedQuestions(questions: AssessmentQuestion[]) {
  ensureCacheDir();
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write questions cache file:', err);
  }
}

function loadCachedAttempts(): Record<string, AssessmentAttempt> {
  ensureCacheDir();
  if (fs.existsSync(ATTEMPTS_FILE)) {
    try {
      const raw = fs.readFileSync(ATTEMPTS_FILE, 'utf8');
      return JSON.parse(raw) || {};
    } catch {}
  }
  return {};
}

function saveCachedAttempts(attempts: Record<string, AssessmentAttempt>) {
  ensureCacheDir();
  try {
    fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write attempts cache file:', err);
  }
}

// ---------------------------------------------------------------------------
// QUESTIONS MANAGEMENT
// ---------------------------------------------------------------------------

export async function getAllQuestions(): Promise<AssessmentQuestion[]> {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          levelId: row.level_id,
          orderIndex: row.order_index,
          title: row.title,
          scenario: row.scenario,
          questionText: row.question_text,
          difficulty: row.difficulty,
          competency: row.competency,
          format: row.format,
          options: row.options || [],
          correctOption: row.correct_option,
          acceptedCriteria: row.accepted_criteria,
          explanation: row.explanation,
          optionExplanations: row.option_explanations || {},
          scoringWeight: Number(row.scoring_weight) || 1,
          timeLimitSeconds: row.time_limit_seconds,
          rubric: row.rubric || [],
          isActive: row.is_active,
          tags: row.tags || [],
        }));
      }
    } catch {
      // Fallback to local cache
    }
  }

  return loadCachedQuestions();
}

export async function getPublicQuestionsForLevel(
  levelId: AssessmentLevelId
): Promise<PublicAssessmentQuestion[]> {
  const all = await getAllQuestions();
  const levelQuestions = all
    .filter((q) => q.levelId === levelId && q.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Strip answers, explanations, and internal scoring criteria for security
  return levelQuestions.map((q) => ({
    id: q.id,
    levelId: q.levelId,
    orderIndex: q.orderIndex,
    title: q.title,
    scenario: q.scenario,
    questionText: q.questionText,
    difficulty: q.difficulty,
    competency: q.competency,
    format: q.format,
    options: q.options,
    scoringWeight: q.scoringWeight,
    rubric: q.rubric,
  }));
}

export async function saveQuestion(question: AssessmentQuestion): Promise<AssessmentQuestion> {
  const all = loadCachedQuestions();
  const index = all.findIndex((q) => q.id === question.id);
  if (index >= 0) {
    all[index] = { ...question };
  } else {
    all.push({ ...question });
  }
  saveCachedQuestions(all);

  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      await admin.from('assessment_questions').upsert({
        id: question.id,
        level_id: question.levelId,
        order_index: question.orderIndex,
        title: question.title,
        scenario: question.scenario,
        question_text: question.questionText,
        difficulty: question.difficulty,
        competency: question.competency,
        format: question.format,
        options: question.options,
        correct_option: question.correctOption,
        accepted_criteria: question.acceptedCriteria,
        explanation: question.explanation,
        option_explanations: question.optionExplanations,
        scoring_weight: question.scoringWeight,
        time_limit_seconds: question.timeLimitSeconds,
        rubric: question.rubric,
        is_active: question.isActive,
        tags: question.tags,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase question upsert notice:', err);
    }
  }

  return question;
}

// ---------------------------------------------------------------------------
// LEVELS & USER PROGRESS
// ---------------------------------------------------------------------------

export async function getLevelsWithUserProgress(userId?: string): Promise<{
  levels: AssessmentLevelConfig[];
  progress: Record<AssessmentLevelId, UserLevelProgress>;
}> {
  const levels = [
    ASSESSMENT_LEVEL_CONFIGS.beginner,
    ASSESSMENT_LEVEL_CONFIGS.intermediate,
    ASSESSMENT_LEVEL_CONFIGS.advanced,
  ];

  const attempts = await getUserAttempts(userId);

  // Compute progress for each level
  const progress: Record<AssessmentLevelId, UserLevelProgress> = {
    beginner: {
      levelId: 'beginner',
      isUnlocked: true, // Beginner always unlocked for authenticated users
      attemptsCount: 0,
      status: 'not_started',
    },
    intermediate: {
      levelId: 'intermediate',
      isUnlocked: false,
      attemptsCount: 0,
      status: 'locked',
    },
    advanced: {
      levelId: 'advanced',
      isUnlocked: false,
      attemptsCount: 0,
      status: 'locked',
    },
  };

  // Filter completed attempts per level
  for (const levelId of ['beginner', 'intermediate', 'advanced'] as AssessmentLevelId[]) {
    const levelAttempts = attempts.filter((a) => a.levelId === levelId && a.status === 'completed');
    if (levelAttempts.length > 0) {
      const best = Math.max(...levelAttempts.map((a) => a.scorePercentage || 0));
      const latest = levelAttempts[0];
      progress[levelId].attemptsCount = levelAttempts.length;
      progress[levelId].bestScore = best;
      progress[levelId].latestScore = latest.scorePercentage;
      progress[levelId].lastAttemptAt = latest.completedAt;
      progress[levelId].status = best >= 70 ? 'passed' : 'failed';
    } else {
      const inProgressAttempt = attempts.find(
        (a) => a.levelId === levelId && a.status === 'in_progress'
      );
      if (inProgressAttempt) {
        progress[levelId].status = 'in_progress';
      }
    }
  }

  // Progressive unlocking rules (prompt specifies >= 70% required to unlock subsequent level)
  const beginnerPassed = (progress.beginner.bestScore ?? 0) >= 70;
  if (beginnerPassed) {
    progress.intermediate.isUnlocked = true;
    if (progress.intermediate.status === 'locked') {
      progress.intermediate.status = 'not_started';
    }
  }

  const intermediatePassed = (progress.intermediate.bestScore ?? 0) >= 70;
  if (beginnerPassed && intermediatePassed) {
    progress.advanced.isUnlocked = true;
    if (progress.advanced.status === 'locked') {
      progress.advanced.status = 'not_started';
    }
  }

  return { levels, progress };
}

// ---------------------------------------------------------------------------
// ATTEMPTS & PERSISTENCE
// ---------------------------------------------------------------------------

export async function getUserAttempts(userId?: string): Promise<AssessmentAttempt[]> {
  const cached = loadCachedAttempts();
  const allAttempts = Object.values(cached);

  let userAttempts = userId
    ? allAttempts.filter((a) => a.userId === userId)
    : allAttempts.filter((a) => a.userId === 'guest');

  // Also query Supabase if configured
  const admin = getSupabaseAdminClient();
  if (admin && userId && userId !== 'guest') {
    try {
      const { data, error } = await admin
        .from('assessment_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbAttempts: AssessmentAttempt[] = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          levelId: row.level_id as AssessmentLevelId,
          status: row.status,
          scorePercentage: Number(row.score_percentage) || 0,
          isPassed: row.is_passed,
          totalCorrect: row.total_correct,
          totalQuestions: row.total_questions,
          answers: row.answers || {},
          markedForReview: row.marked_for_review || [],
          competencyScores: row.competency_scores || {},
          caseEvaluations: row.case_evaluations || {},
          questionReviews: row.question_reviews || [],
          strengths: row.strengths || [],
          growthAreas: row.growth_areas || [],
          recommendations: row.recommendations || [],
          timeSpentSeconds: row.time_spent_seconds || 0,
          startedAt: row.started_at,
          completedAt: row.completed_at,
        }));

        // Merge with cached, preferring DB
        const ids = new Set(dbAttempts.map((a) => a.id));
        const filteredCached = userAttempts.filter((a) => !ids.has(a.id));
        userAttempts = [...dbAttempts, ...filteredCached];
      }
    } catch {}
  }

  return userAttempts.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export async function saveAttemptProgress(params: {
  attemptId: string;
  userId: string;
  levelId: AssessmentLevelId;
  answers: Record<string, string>;
  markedForReview: string[];
  timeSpentSeconds: number;
}): Promise<AssessmentAttempt> {
  const { attemptId, userId, levelId, answers, markedForReview, timeSpentSeconds } = params;

  const cached = loadCachedAttempts();
  const existing = cached[attemptId];

  const updated: AssessmentAttempt = {
    id: attemptId,
    userId: userId || 'guest',
    levelId,
    status: 'in_progress',
    answers,
    markedForReview,
    timeSpentSeconds,
    startedAt: existing?.startedAt || new Date().toISOString(),
  };

  cached[attemptId] = updated;
  saveCachedAttempts(cached);

  const admin = getSupabaseAdminClient();
  if (admin && userId && userId !== 'guest') {
    try {
      await admin.from('assessment_attempts').upsert({
        id: attemptId,
        user_id: userId,
        level_id: levelId,
        status: 'in_progress',
        answers,
        marked_for_review: markedForReview,
        time_spent_seconds: timeSpentSeconds,
        started_at: updated.startedAt,
      });
    } catch {}
  }

  return updated;
}

export async function submitAssessmentAttempt(params: {
  attemptId: string;
  userId: string;
  levelId: AssessmentLevelId;
  answers: Record<string, string>;
  timeSpentSeconds: number;
}): Promise<AssessmentAttempt> {
  const { attemptId, userId, levelId, answers, timeSpentSeconds } = params;
  const levelConfig = ASSESSMENT_LEVEL_CONFIGS[levelId];
  const allQuestions = await getAllQuestions();
  const levelQuestions = allQuestions
    .filter((q) => q.levelId === levelId && q.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Execute authoritative scoring
  const scored = await scoreAssessmentSubmission({
    levelConfig,
    questions: levelQuestions,
    userAnswers: answers,
    timeSpentSeconds,
  });

  const completedAt = new Date().toISOString();
  const completedAttempt: AssessmentAttempt = {
    id: attemptId,
    userId: userId || 'guest',
    levelId,
    status: 'completed',
    answers,
    markedForReview: [],
    scorePercentage: scored.scorePercentage,
    isPassed: scored.isPassed,
    totalCorrect: scored.totalCorrect,
    totalQuestions: scored.totalQuestions,
    competencyScores: scored.competencyScores,
    caseEvaluations: scored.caseEvaluations,
    questionReviews: scored.questionReviews,
    strengths: scored.strengths,
    growthAreas: scored.growthAreas,
    recommendations: scored.recommendations,
    timeSpentSeconds,
    startedAt: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
    completedAt,
  };

  // 1. Save to local cache
  const cached = loadCachedAttempts();
  cached[attemptId] = completedAttempt;
  saveCachedAttempts(cached);

  // 2. Persist to Supabase assessment_attempts
  const admin = getSupabaseAdminClient();
  if (admin && userId && userId !== 'guest') {
    try {
      await admin.from('assessment_attempts').upsert({
        id: attemptId,
        user_id: userId,
        level_id: levelId,
        status: 'completed',
        score_percentage: scored.scorePercentage,
        is_passed: scored.isPassed,
        total_correct: scored.totalCorrect,
        total_questions: scored.totalQuestions,
        answers,
        competency_scores: scored.competencyScores,
        case_evaluations: scored.caseEvaluations,
        question_reviews: scored.questionReviews,
        strengths: scored.strengths,
        growth_areas: scored.growthAreas,
        recommendations: scored.recommendations,
        time_spent_seconds: timeSpentSeconds,
        completed_at: completedAt,
      });

      // 3. Also update profile pm_fit_score and legacy quiz_results for full platform compatibility
      await admin
        .from('profiles')
        .update({ pm_fit_score: scored.scorePercentage })
        .eq('id', userId);

      await admin.from('quiz_results').insert({
        user_id: userId,
        score_percentage: scored.scorePercentage,
        archetype: `${levelConfig.title} (${scored.statusLabel})`,
        summary: `Completed official ${levelConfig.title} with a verified score of ${scored.scorePercentage}%.`,
        dimension_scores: Object.values(scored.competencyScores).map((cs) => ({
          dimension: cs.category,
          score: cs.scorePercentage,
          percentage: cs.scorePercentage,
          rawCorrect: cs.pointsEarned,
          total: cs.totalPoints,
        })),
        strengths: scored.strengths,
        growth_areas: scored.growthAreas,
        recommended_role:
          scored.scorePercentage >= 80
            ? 'Senior Product Manager / Lead PM'
            : scored.scorePercentage >= 70
            ? 'Product Manager (Core Squad)'
            : 'Associate Product Manager',
      });
    } catch (err) {
      console.warn('Supabase completed attempt persistence notice:', err);
    }
  }

  return completedAttempt;
}

export async function getAttemptById(
  attemptId: string,
  userId?: string
): Promise<AssessmentAttempt | null> {
  const cached = loadCachedAttempts();
  if (cached[attemptId]) {
    return cached[attemptId];
  }

  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('assessment_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          levelId: data.level_id as AssessmentLevelId,
          status: data.status,
          scorePercentage: Number(data.score_percentage) || 0,
          isPassed: data.is_passed,
          totalCorrect: data.total_correct,
          totalQuestions: data.total_questions,
          answers: data.answers || {},
          markedForReview: data.marked_for_review || [],
          competencyScores: data.competency_scores || {},
          caseEvaluations: data.case_evaluations || {},
          questionReviews: data.question_reviews || [],
          strengths: data.strengths || [],
          growthAreas: data.growth_areas || [],
          recommendations: data.recommendations || [],
          timeSpentSeconds: data.time_spent_seconds || 0,
          startedAt: data.started_at,
          completedAt: data.completed_at,
        };
      }
    } catch {}
  }

  return null;
}

// ---------------------------------------------------------------------------
// ADMIN ANALYTICS & STATS
// ---------------------------------------------------------------------------

export async function getAdminAssessmentStats() {
  const cachedAttempts = Object.values(loadCachedAttempts());
  const allQuestions = await getAllQuestions();

  const completedAttempts = cachedAttempts.filter((a) => a.status === 'completed');

  const levelStats: Record<
    AssessmentLevelId,
    {
      attempts: number;
      completions: number;
      passCount: number;
      passRate: number;
      avgScore: number;
    }
  > = {
    beginner: { attempts: 0, completions: 0, passCount: 0, passRate: 0, avgScore: 0 },
    intermediate: { attempts: 0, completions: 0, passCount: 0, passRate: 0, avgScore: 0 },
    advanced: { attempts: 0, completions: 0, passCount: 0, passRate: 0, avgScore: 0 },
  };

  for (const a of cachedAttempts) {
    if (levelStats[a.levelId]) {
      levelStats[a.levelId].attempts += 1;
    }
  }

  for (const a of completedAttempts) {
    const s = levelStats[a.levelId];
    if (s) {
      s.completions += 1;
      if (a.isPassed) s.passCount += 1;
      s.avgScore += a.scorePercentage || 0;
    }
  }

  for (const lvl of ['beginner', 'intermediate', 'advanced'] as AssessmentLevelId[]) {
    const s = levelStats[lvl];
    if (s.completions > 0) {
      s.avgScore = Math.round(s.avgScore / s.completions);
      s.passRate = Math.round((s.passCount / s.completions) * 100);
    }
  }

  // Calculate common incorrect answers across questions
  const questionMissCounts: Record<
    string,
    { questionId: string; title: string; levelId: string; misses: number; totalAttempts: number }
  > = {};

  for (const a of completedAttempts) {
    if (a.questionReviews) {
      for (const rev of a.questionReviews) {
        if (!questionMissCounts[rev.questionId]) {
          questionMissCounts[rev.questionId] = {
            questionId: rev.questionId,
            title: rev.title,
            levelId: a.levelId,
            misses: 0,
            totalAttempts: 0,
          };
        }
        questionMissCounts[rev.questionId].totalAttempts += 1;
        if (rev.isCorrect === false) {
          questionMissCounts[rev.questionId].misses += 1;
        }
      }
    }
  }

  const commonIncorrectQuestions = Object.values(questionMissCounts)
    .filter((q) => q.totalAttempts > 0)
    .sort((a, b) => b.misses / b.totalAttempts - a.misses / a.totalAttempts)
    .slice(0, 5);

  return {
    totalQuestions: allQuestions.length,
    totalAttempts: cachedAttempts.length,
    totalCompleted: completedAttempts.length,
    levelStats,
    commonIncorrectQuestions,
  };
}
