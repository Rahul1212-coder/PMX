import {
  DailyChallenge,
  QuestionResult,
  PM_LEVELS,
  AchievementDefinition,
  UserGamificationProfile,
} from '@/types/gamification';
import { INITIAL_ACHIEVEMENTS } from './questionBank';

export interface DailyScoringResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  accuracyPercentage: number;
  questionResults: QuestionResult[];
  baseXp: number;
  correctnessXp: number;
  totalXpEarned: number;
  strongestSkill: string;
  feedbackSummary: string;
}

export function scoreDailyAttempt(
  challenge: DailyChallenge,
  userAnswers: Record<string, string>
): DailyScoringResult {
  let correctCount = 0;
  const questionResults: QuestionResult[] = [];
  const skillPerformance: Record<string, { correct: number; total: number }> = {};

  challenge.questions.forEach((q) => {
    const selected = userAnswers[q.id] || null;
    const isCorrect = selected?.toUpperCase() === q.correctOption.toUpperCase();
    if (isCorrect) correctCount++;

    const maxPoints = q.points || 20;
    const pointsEarned = isCorrect ? maxPoints : 0;

    questionResults.push({
      questionId: q.id,
      selectedOption: selected,
      correctOption: q.correctOption,
      isCorrect,
      pointsEarned,
      maxPoints,
      explanation: q.explanation,
      optionExplanations: q.optionExplanations || {},
      skillCategory: q.skillCategory || 'Product Sense',
    });

    const skill = q.skillCategory || 'Product Sense';
    if (!skillPerformance[skill]) {
      skillPerformance[skill] = { correct: 0, total: 0 };
    }
    skillPerformance[skill].total++;
    if (isCorrect) skillPerformance[skill].correct++;
  });

  const totalQuestions = challenge.questions.length || 5;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const accuracyPercentage = score;

  // XP Rules: 20 XP for completion + 10 XP per correct question
  const baseXp = 20;
  const correctnessXp = correctCount * 10;
  const totalXpEarned = baseXp + correctnessXp; // Max 70 XP

  // Identify strongest area
  let strongestSkill = 'Product Strategy';
  let bestRatio = -1;
  Object.entries(skillPerformance).forEach(([skill, data]) => {
    const ratio = data.total > 0 ? data.correct / data.total : 0;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      strongestSkill = skill;
    }
  });

  let feedbackSummary = '';
  if (score === 100) {
    feedbackSummary = `Flawless execution! You demonstrated outstanding diagnostic rigor in ${strongestSkill} with zero errors.`;
  } else if (score >= 80) {
    feedbackSummary = `Excellent performance (${correctCount}/${totalQuestions})! Your strongest dimension was ${strongestSkill}. Review the distractor notes to refine edge cases.`;
  } else if (score >= 60) {
    feedbackSummary = `Solid diagnostic effort (${correctCount}/${totalQuestions}). You showed good intuition in ${strongestSkill}, but watch out for vanity metric traps and opportunity costs.`;
  } else {
    feedbackSummary = `Tough set today (${correctCount}/${totalQuestions}). Carefully review the detailed rationales below to understand how Principal PMs navigate these tradeoffs.`;
  }

  return {
    score,
    correctCount,
    totalQuestions,
    accuracyPercentage,
    questionResults,
    baseXp,
    correctnessXp,
    totalXpEarned,
    strongestSkill,
    feedbackSummary,
  };
}

/**
 * Calculates updated streak state given previous state and today's activity date
 */
export function calculateStreak(
  currentStreak: number,
  longestStreak: number,
  lastQualifyingDate: string | null,
  attemptDate: string, // YYYY-MM-DD
  freezesAvailable = 1
): {
  newStreak: number;
  newLongestStreak: number;
  freezeConsumed: boolean;
  freezesRemaining: number;
  isNewQualifyingDay: boolean;
} {
  if (!lastQualifyingDate) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      freezeConsumed: false,
      freezesRemaining: freezesAvailable,
      isNewQualifyingDay: true,
    };
  }

  if (lastQualifyingDate === attemptDate) {
    // Already completed today: do not increment streak again
    return {
      newStreak: currentStreak,
      newLongestStreak: longestStreak,
      freezeConsumed: false,
      freezesRemaining: freezesAvailable,
      isNewQualifyingDay: false,
    };
  }

  // Parse dates to check consecutive days
  const lastDate = new Date(lastQualifyingDate + 'T00:00:00Z');
  const currentDate = new Date(attemptDate + 'T00:00:00Z');
  const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Exact consecutive day
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongestStreak: Math.max(longestStreak, newStreak),
      freezeConsumed: false,
      freezesRemaining: freezesAvailable,
      isNewQualifyingDay: true,
    };
  }

  if (diffDays === 2 && freezesAvailable > 0) {
    // Missed 1 day but has a freeze available: preserve streak
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongestStreak: Math.max(longestStreak, newStreak),
      freezeConsumed: true,
      freezesRemaining: freezesAvailable - 1,
      isNewQualifyingDay: true,
    };
  }

  // Streak broken: reset to 1
  return {
    newStreak: 1,
    newLongestStreak: Math.max(longestStreak, 1),
    freezeConsumed: false,
    freezesRemaining: freezesAvailable,
    isNewQualifyingDay: true,
  };
}

/**
 * Calculates current level and progress from cumulative XP
 */
export function calculateLevelFromXp(totalXp: number): {
  level: number;
  levelName: string;
  nextLevelXp: number;
  progressPercentage: number;
} {
  const currentLevelDef =
    [...PM_LEVELS].reverse().find((l) => totalXp >= l.minXp) || PM_LEVELS[0];

  const nextLevelDef = PM_LEVELS.find((l) => l.level === currentLevelDef.level + 1);

  if (!nextLevelDef) {
    return {
      level: currentLevelDef.level,
      levelName: currentLevelDef.name,
      nextLevelXp: currentLevelDef.minXp,
      progressPercentage: 100,
    };
  }

  const range = nextLevelDef.minXp - currentLevelDef.minXp;
  const earnedInRange = Math.max(0, totalXp - currentLevelDef.minXp);
  const progressPercentage = Math.min(100, Math.round((earnedInRange / range) * 100));

  return {
    level: currentLevelDef.level,
    levelName: currentLevelDef.name,
    nextLevelXp: nextLevelDef.minXp,
    progressPercentage,
  };
}

/**
 * Check if the streak qualifies for milestone XP & badge
 */
export function getStreakMilestoneBonus(streak: number): { xp: number; milestoneName: string } | null {
  switch (streak) {
    case 3:
      return { xp: 30, milestoneName: '3-Day Consistency Starter' };
    case 7:
      return { xp: 100, milestoneName: '7-Day Week Warrior' };
    case 14:
      return { xp: 150, milestoneName: '14-Day Habit Builder' };
    case 30:
      return { xp: 300, milestoneName: '30-Day Monthly Master' };
    case 60:
      return { xp: 600, milestoneName: '60-Day Unstoppable PM' };
    case 100:
      return { xp: 1000, milestoneName: '100-Day Product Centurion' };
    default:
      return null;
  }
}

/**
 * Evaluates which achievements are unlocked
 */
export function evaluateUnlockedAchievements(
  profile: Partial<UserGamificationProfile>,
  totalChallengesCompleted: number,
  lastScore: number,
  existingAchievementIds: Set<string>
): AchievementDefinition[] {
  const newlyUnlocked: AchievementDefinition[] = [];

  INITIAL_ACHIEVEMENTS.forEach((ach) => {
    if (existingAchievementIds.has(ach.id)) return;

    let qualifies = false;
    if (ach.id === 'first_challenge' && totalChallengesCompleted >= 1) {
      qualifies = true;
    } else if (ach.id === 'consistency_starter' && (profile.currentStreak || 0) >= 3) {
      qualifies = true;
    } else if (ach.id === 'week_warrior' && (profile.currentStreak || 0) >= 7) {
      qualifies = true;
    } else if (ach.id === 'monthly_master' && (profile.currentStreak || 0) >= 30) {
      qualifies = true;
    } else if (ach.id === 'perfect_five' && lastScore === 100) {
      qualifies = true;
    } else if (ach.id === 'pm_strategist' && (profile.currentLevel || 1) >= 4) {
      qualifies = true;
    }

    if (qualifies) {
      newlyUnlocked.push(ach);
    }
  });

  return newlyUnlocked;
}
