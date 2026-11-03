import fs from 'fs';
import path from 'path';
import {
  DailyChallenge,
  PublicDailyChallenge,
  ChallengeAttempt,
  UserGamificationProfile,
  LeaderboardResponse,
  LeaderboardEntry,
  LeaderboardLeague,
  LeaderboardTimeframe,
  WeeklyQuest,
  AchievementDefinition,
  XpTransaction,
} from '@/types/gamification';
import {
  getCanonicalDailyChallenge,
  stripAnswersFromChallenge,
  getActiveWeeklyQuests,
  INITIAL_ACHIEVEMENTS,
} from './questionBank';
import {
  scoreDailyAttempt,
  calculateStreak,
  calculateLevelFromXp,
  getStreakMilestoneBonus,
  evaluateUnlockedAchievements,
} from './scoring';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

// Local storage fallback directory
const CACHE_DIR = path.join(process.cwd(), 'src', 'data', '.gamification_cache');
const PROFILES_FILE = path.join(CACHE_DIR, 'profiles.json');
const ATTEMPTS_FILE = path.join(CACHE_DIR, 'attempts.json');
const TRANSACTIONS_FILE = path.join(CACHE_DIR, 'transactions.json');
const ACHIEVEMENTS_FILE = path.join(CACHE_DIR, 'achievements.json');
const QUESTS_FILE = path.join(CACHE_DIR, 'quests.json');

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch {}
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureCacheDir();
  if (!fs.existsSync(filePath)) return fallback;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  ensureCacheDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`Failed to write cache file ${filePath}:`, err);
  }
}

/**
 * Format today's date in YYYY-MM-DD (UTC canonical)
 */
export function getCanonicalDateString(d = new Date()): string {
  return d.toISOString().split('T')[0];
}

/**
 * Seconds until midnight UTC reset
 */
export function getSecondsUntilMidnightUtc(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
}

/**
 * 1. GET DAILY CHALLENGE FOR USER
 * Returns public challenge (answers stripped) + any existing attempt
 */
export async function getDailyChallenge(
  dateStr = getCanonicalDateString(),
  userId?: string
): Promise<{
  challenge: PublicDailyChallenge;
  userAttempt: ChallengeAttempt | null;
}> {
  const admin = getSupabaseAdminClient();
  let challenge = getCanonicalDailyChallenge(dateStr);

  // Attempt to load from Supabase if published
  if (admin) {
    try {
      const { data: dbChallenge } = await admin
        .from('daily_challenges')
        .select('*, challenge_questions(*)')
        .eq('challenge_date', dateStr)
        .eq('publication_status', 'published')
        .single();

      if (dbChallenge && dbChallenge.challenge_questions?.length >= 5) {
        challenge = {
          id: dbChallenge.id,
          challengeDate: dbChallenge.challenge_date,
          title: dbChallenge.title,
          theme: dbChallenge.theme,
          description: dbChallenge.description,
          difficulty: dbChallenge.difficulty,
          timezone: dbChallenge.timezone,
          publicationStatus: dbChallenge.publication_status,
          publishedAt: dbChallenge.published_at,
          createdAt: dbChallenge.created_at,
          questions: dbChallenge.challenge_questions.sort(
            (a: any, b: any) => a.order_index - b.order_index
          ).map((q: any) => ({
            id: q.id,
            challengeId: q.challenge_id,
            orderIndex: q.order_index,
            scenario: q.scenario,
            questionText: q.question_text,
            skillCategory: q.skill_category,
            difficulty: q.difficulty,
            options: q.options,
            correctOption: q.correct_option,
            explanation: q.explanation,
            optionExplanations: q.option_explanations,
            points: q.points || 20,
          })),
        };
      }
    } catch {}
  }

  // Check user attempt
  let userAttempt: ChallengeAttempt | null = null;
  if (userId) {
    if (admin) {
      try {
        const { data: dbAttempt } = await admin
          .from('challenge_attempts')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_date', dateStr)
          .single();

        if (dbAttempt) {
          userAttempt = {
            id: dbAttempt.id,
            userId: dbAttempt.user_id,
            challengeId: dbAttempt.challenge_id,
            challengeDate: dbAttempt.challenge_date,
            status: dbAttempt.status,
            score: dbAttempt.score,
            correctCount: dbAttempt.correct_count,
            totalQuestions: dbAttempt.total_questions,
            timeTakenSeconds: dbAttempt.time_taken_seconds,
            answers: dbAttempt.answers || {},
            questionResults: dbAttempt.question_results || undefined,
            xpAwarded: dbAttempt.xp_awarded || 0,
            streakAfterAttempt: dbAttempt.streak_after_attempt || 0,
            startedAt: dbAttempt.started_at,
            completedAt: dbAttempt.completed_at,
          };
        }
      } catch {}
    }

    if (!userAttempt) {
      // Local fallback lookup
      const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
      const localAttempt = attempts.find(
        (a) => a.userId === userId && a.challengeDate === dateStr
      );
      if (localAttempt) userAttempt = localAttempt;
    }
  }

  const secondsRemaining = getSecondsUntilMidnightUtc();
  const publicChallenge = stripAnswersFromChallenge(challenge, secondsRemaining);

  return {
    challenge: publicChallenge,
    userAttempt,
  };
}

/**
 * 2. SAVE IN-PROGRESS ANSWER (AUTOSAVE)
 */
export async function saveChallengeProgress(
  userId: string,
  challengeId: string,
  challengeDate: string,
  questionId: string,
  selectedOptionId: string
): Promise<ChallengeAttempt> {
  const admin = getSupabaseAdminClient();
  let attempt: ChallengeAttempt | null = null;

  // Retrieve or create in_progress attempt
  if (admin) {
    try {
      const { data: existing } = await admin
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_date', challengeDate)
        .single();

      if (existing) {
        if (existing.status === 'completed') {
          return existing; // Cannot modify completed attempt
        }
        const updatedAnswers = { ...(existing.answers || {}), [questionId]: selectedOptionId };
        const { data: updated } = await admin
          .from('challenge_attempts')
          .update({
            answers: updatedAnswers,
            challenge_id: challengeId,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updated) {
          attempt = {
            id: updated.id,
            userId: updated.user_id,
            challengeId: updated.challenge_id,
            challengeDate: updated.challenge_date,
            status: updated.status,
            score: updated.score,
            correctCount: updated.correct_count,
            totalQuestions: updated.total_questions,
            timeTakenSeconds: updated.time_taken_seconds,
            answers: updated.answers,
            xpAwarded: updated.xp_awarded,
            streakAfterAttempt: updated.streak_after_attempt,
            startedAt: updated.started_at,
          };
        }
      } else {
        const { data: inserted } = await admin
          .from('challenge_attempts')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            challenge_date: challengeDate,
            status: 'in_progress',
            answers: { [questionId]: selectedOptionId },
          })
          .select()
          .single();

        if (inserted) {
          attempt = {
            id: inserted.id,
            userId: inserted.user_id,
            challengeId: inserted.challenge_id,
            challengeDate: inserted.challenge_date,
            status: inserted.status,
            score: inserted.score,
            correctCount: inserted.correct_count,
            totalQuestions: inserted.total_questions,
            timeTakenSeconds: inserted.time_taken_seconds,
            answers: inserted.answers,
            xpAwarded: inserted.xp_awarded,
            streakAfterAttempt: inserted.streak_after_attempt,
            startedAt: inserted.started_at,
          };
        }
      }
    } catch {}
  }

  // Local fallback
  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  let localAttempt = attempts.find(
    (a) => a.userId === userId && a.challengeDate === challengeDate
  );

  if (!localAttempt) {
    localAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      challengeId,
      challengeDate,
      status: 'in_progress',
      score: 0,
      correctCount: 0,
      totalQuestions: 5,
      timeTakenSeconds: 0,
      answers: { [questionId]: selectedOptionId },
      xpAwarded: 0,
      streakAfterAttempt: 0,
      startedAt: new Date().toISOString(),
    };
    attempts.push(localAttempt);
  } else if (localAttempt.status !== 'completed') {
    localAttempt.answers[questionId] = selectedOptionId;
    localAttempt.challengeId = challengeId;
  }

  writeJsonFile(ATTEMPTS_FILE, attempts);
  return attempt || localAttempt;
}

/**
 * 3. SUBMIT CHALLENGE ATTEMPT
 * Evaluates answers server-side, updates streak, awards XP in ledger,
 * updates quests, checks achievements, returns full scorecard.
 */
export async function submitChallengeAttempt(
  userId: string,
  challengeDate: string,
  answers: Record<string, string>,
  timeTakenSeconds = 180
): Promise<{
  success: boolean;
  attempt: ChallengeAttempt;
  xpEarned: number;
  newStreak: number;
  streakMilestoneBonus?: { xp: number; milestoneName: string } | null;
  newlyUnlockedAchievements: AchievementDefinition[];
  userProfile: UserGamificationProfile;
}> {
  const challenge = getCanonicalDailyChallenge(challengeDate);
  const scoring = scoreDailyAttempt(challenge, answers);

  // 1. Get or initialize user gamification profile
  const currentProfile = await getUserGamificationProfile(userId);

  // 2. Check if already completed today to prevent duplicate rewards and hold score permanently
  const existingAttempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  let existingAttempt = existingAttempts.find(
    (a) => a.userId === userId && a.challengeDate === challengeDate && a.status === 'completed'
  );

  const admin = getSupabaseAdminClient();
  if (admin && !existingAttempt) {
    try {
      const { data: dbExisting } = await admin
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_date', challengeDate)
        .eq('status', 'completed')
        .single();
      if (dbExisting) {
        existingAttempt = {
          id: dbExisting.id,
          userId: dbExisting.user_id,
          challengeId: dbExisting.challenge_id,
          challengeDate: dbExisting.challenge_date,
          status: dbExisting.status,
          score: dbExisting.score,
          correctCount: dbExisting.correct_count,
          totalQuestions: dbExisting.total_questions,
          timeTakenSeconds: dbExisting.time_taken_seconds,
          answers: dbExisting.answers || {},
          questionResults: dbExisting.question_results || undefined,
          xpAwarded: dbExisting.xp_awarded || 0,
          streakAfterAttempt: dbExisting.streak_after_attempt || 0,
          startedAt: dbExisting.started_at,
          completedAt: dbExisting.completed_at,
        };
      }
    } catch {}
  }

  // Once completed: the score is held and the user cannot retry or re-submit today!
  if (existingAttempt) {
    return {
      success: true,
      attempt: existingAttempt,
      xpEarned: 0,
      newStreak: currentProfile.currentStreak,
      streakMilestoneBonus: null,
      newlyUnlockedAchievements: [],
      userProfile: currentProfile,
    };
  }

  // 3. Streak calculation
  const streakResult = calculateStreak(
    currentProfile.currentStreak,
    currentProfile.longestStreak,
    currentProfile.lastQualifyingDate,
    challengeDate,
    currentProfile.streakFreezesAvailable
  );

  const streakMilestone = streakResult.isNewQualifyingDay
    ? getStreakMilestoneBonus(streakResult.newStreak)
    : null;

  // 4. Calculate total XP award
  let totalXpAwarded = scoring.totalXpEarned;
  if (streakMilestone) {
    totalXpAwarded += streakMilestone.xp;
  }

  // 5. Build completed attempt object with held score
  const completedAttempt: ChallengeAttempt = {
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    challengeId: challenge.id,
    challengeDate,
    status: 'completed',
    score: scoring.score,
    correctCount: scoring.correctCount,
    totalQuestions: scoring.totalQuestions,
    timeTakenSeconds,
    answers,
    questionResults: scoring.questionResults,
    xpAwarded: totalXpAwarded,
    streakAfterAttempt: streakResult.newStreak,
    startedAt: new Date(Date.now() - timeTakenSeconds * 1000).toISOString(),
    completedAt: new Date().toISOString(),
  };

  // 6. Calculate Weekly Arena Score and All-time Arena Score
  const now = new Date();
  const monday = new Date(now);
  const day = now.getUTCDay();
  monday.setUTCDate(now.getUTCDate() + (day === 0 ? -6 : 1 - day));
  monday.setUTCHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];

  const userCompletedAttempts = existingAttempts.filter(
    (a) => a.userId === userId && a.status === 'completed' && a.challengeDate !== challengeDate
  );
  userCompletedAttempts.push(completedAttempt);

  const thisWeekAttempts = userCompletedAttempts.filter((a) => a.challengeDate >= mondayStr);
  const weeklyArenaScore = thisWeekAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const allTimeArenaScore = userCompletedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const weeklyChallengesCompleted = thisWeekAttempts.length;

  // 7. Check for unlocked badges & milestones
  const existingAchievements = readJsonFile<{ userId: string; achievementId: string; earnedAt?: string }[]>(
    ACHIEVEMENTS_FILE,
    []
  );
  const userAchIds = new Set(
    existingAchievements.filter((a) => a.userId === userId).map((a) => a.achievementId)
  );

  const tempTotalXp = currentProfile.totalXp + totalXpAwarded;
  const tempLevelInfo = calculateLevelFromXp(tempTotalXp);

  const updatedProfilePreview: Partial<UserGamificationProfile> = {
    currentStreak: streakResult.newStreak,
    totalXp: tempTotalXp,
    currentLevel: tempLevelInfo.level,
    weeklyArenaScore,
    allTimeArenaScore,
  };

  const unlocked = evaluateUnlockedAchievements(
    updatedProfilePreview,
    userCompletedAttempts.length,
    scoring.score,
    userAchIds,
    weeklyArenaScore,
    weeklyChallengesCompleted,
    1
  );

  // 8. Record transactions in ledger (idempotent)
  const transactions: XpTransaction[] = readJsonFile<XpTransaction[]>(TRANSACTIONS_FILE, []);
  const baseTxKey = `xp_daily_${userId}_${challengeDate}`;
  transactions.push({
    id: `tx_${Date.now()}_1`,
    userId,
    sourceType: 'daily_challenge',
    sourceId: challenge.id,
    xpAmount: scoring.totalXpEarned,
    idempotencyKey: baseTxKey,
    description: `Completed Daily 5 (${challenge.theme}) — ${scoring.correctCount}/5 correct (+${scoring.score} Arena Pts)`,
    createdAt: new Date().toISOString(),
  });

  if (streakMilestone) {
    transactions.push({
      id: `tx_${Date.now()}_2`,
      userId,
      sourceType: 'streak_milestone',
      sourceId: `streak_${streakResult.newStreak}`,
      xpAmount: streakMilestone.xp,
      idempotencyKey: `xp_streak_${userId}_${streakResult.newStreak}_${challengeDate}`,
      description: `Reached ${streakMilestone.milestoneName} Milestone!`,
      createdAt: new Date().toISOString(),
    });
  }

  // Award bonus XP for newly unlocked badges / milestones
  let bonusAchievementXp = 0;
  unlocked.forEach((ach) => {
    existingAchievements.push({
      userId,
      achievementId: ach.id,
      earnedAt: new Date().toISOString(),
    });
    const xpBonus = ach.xpReward || 50;
    bonusAchievementXp += xpBonus;

    transactions.push({
      id: `tx_${Date.now()}_ach_${ach.id}`,
      userId,
      sourceType: 'streak_milestone',
      sourceId: ach.id,
      xpAmount: xpBonus,
      idempotencyKey: `xp_ach_${userId}_${ach.id}_${challengeDate}`,
      description: `Unlocked Badge: ${ach.name} (+${xpBonus} XP)`,
      createdAt: new Date().toISOString(),
    });
  });

  writeJsonFile(TRANSACTIONS_FILE, transactions);
  writeJsonFile(ACHIEVEMENTS_FILE, existingAchievements);

  totalXpAwarded += bonusAchievementXp;
  completedAttempt.xpAwarded = totalXpAwarded;

  const finalTotalXp = currentProfile.totalXp + totalXpAwarded;
  const finalLevelInfo = calculateLevelFromXp(finalTotalXp);

  // 9. Update weekly quest progress
  await incrementQuestProgress(userId, scoring.score >= 80);

  // 10. Update local profile with Arena metrics
  const profiles = readJsonFile<Record<string, UserGamificationProfile>>(PROFILES_FILE, {});
  const updatedProfile: UserGamificationProfile = {
    ...currentProfile,
    totalXp: finalTotalXp,
    currentLevel: finalLevelInfo.level,
    currentLevelName: finalLevelInfo.levelName,
    nextLevelXp: finalLevelInfo.nextLevelXp,
    levelProgressPercentage: finalLevelInfo.progressPercentage,
    currentStreak: streakResult.newStreak,
    longestStreak: streakResult.newLongestStreak,
    lastQualifyingDate: challengeDate,
    streakFreezesAvailable: streakResult.freezesRemaining,
    achievementsCount: userAchIds.size + unlocked.length,
    weeklyArenaScore,
    allTimeArenaScore,
    arenaRank: 1,
    todayScore: scoring.score,
    isTodayCompleted: true,
  };
  profiles[userId] = updatedProfile;
  writeJsonFile(PROFILES_FILE, profiles);

  // Save attempt to local cache
  const attIndex = existingAttempts.findIndex(
    (a) => a.userId === userId && a.challengeDate === challengeDate
  );
  if (attIndex >= 0) {
    existingAttempts[attIndex] = completedAttempt;
  } else {
    existingAttempts.push(completedAttempt);
  }
  writeJsonFile(ATTEMPTS_FILE, existingAttempts);

  // 11. Persist to Supabase if configured
  if (admin) {
    try {
      await admin.from('challenge_attempts').upsert({
        user_id: userId,
        challenge_id: challenge.id,
        challenge_date: challengeDate,
        status: 'completed',
        score: scoring.score,
        correct_count: scoring.correctCount,
        total_questions: 5,
        time_taken_seconds: timeTakenSeconds,
        answers,
        question_results: scoring.questionResults,
        xp_awarded: totalXpAwarded,
        streak_after_attempt: streakResult.newStreak,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,challenge_date' });

      await admin.from('user_gamification').upsert({
        user_id: userId,
        total_xp: finalTotalXp,
        current_level: finalLevelInfo.level,
        current_level_name: finalLevelInfo.levelName,
        current_streak: streakResult.newStreak,
        longest_streak: streakResult.newLongestStreak,
        last_qualifying_date: challengeDate,
        streak_freezes_available: streakResult.freezesRemaining,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      await admin.from('xp_transactions').upsert({
        user_id: userId,
        source_type: 'daily_challenge',
        source_id: challenge.id,
        xp_amount: scoring.totalXpEarned,
        idempotencyKey: baseTxKey,
        description: `Completed Daily 5 (${challenge.theme})`,
      }, { onConflict: 'idempotency_key' });
    } catch (dbErr) {
      console.warn('Non-fatal: Supabase sync warning during challenge submit:', dbErr);
    }
  }

  return {
    success: true,
    attempt: completedAttempt,
    xpEarned: totalXpAwarded,
    newStreak: streakResult.newStreak,
    streakMilestoneBonus: streakMilestone,
    newlyUnlockedAchievements: unlocked,
    userProfile: updatedProfile,
  };
}

/**
 * 4. GET USER GAMIFICATION STATUS & 7-DAY CALENDAR
 */
export async function getUserGamificationProfile(
  userId: string
): Promise<UserGamificationProfile> {
  const admin = getSupabaseAdminClient();
  let dbProfile: any = null;

  if (admin) {
    try {
      const { data } = await admin
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) dbProfile = data;
    } catch {}
  }

  const profiles = readJsonFile<Record<string, UserGamificationProfile>>(PROFILES_FILE, {});
  const cached = profiles[userId];

  const totalXp = dbProfile?.total_xp ?? cached?.totalXp ?? 0;
  const currentStreak = dbProfile?.current_streak ?? cached?.currentStreak ?? 0;
  const longestStreak = dbProfile?.longest_streak ?? cached?.longestStreak ?? 0;
  const lastDate = dbProfile?.last_qualifying_date ?? cached?.lastQualifyingDate ?? null;
  const freezes = dbProfile?.streak_freezes_available ?? cached?.streakFreezesAvailable ?? 1;

  const levelInfo = calculateLevelFromXp(totalXp);

  // Generate 7-day rolling activity calendar (last 6 days + today)
  const todayStr = getCanonicalDateString();
  const today = new Date();
  const sevenDayActivity: UserGamificationProfile['sevenDayActivity'] = [];

  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  const userAttempts = attempts.filter((a) => a.userId === userId && a.status === 'completed');
  const completedDateSet = new Set(userAttempts.map((a) => a.challengeDate));
  if (lastDate) completedDateSet.add(lastDate);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const isCompleted = completedDateSet.has(dateStr);

    let status: 'completed' | 'missed' | 'today_pending' | 'today_completed' = 'missed';
    if (isCompleted) {
      status = isToday ? 'today_completed' : 'completed';
    } else if (isToday) {
      status = 'today_pending';
    }

    sevenDayActivity.push({
      date: dateStr,
      dayLabel: dayNames[d.getUTCDay()],
      status,
    });
  }

  // Count achievements
  const existingAchievements = readJsonFile<{ userId: string }[]>(ACHIEVEMENTS_FILE, []);
  const achCount = existingAchievements.filter((a) => a.userId === userId).length;

  // Compute Arena stats
  const monday = new Date(today);
  const day = today.getUTCDay();
  monday.setUTCDate(today.getUTCDate() + (day === 0 ? -6 : 1 - day));
  monday.setUTCHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];

  const thisWeekAttempts = userAttempts.filter((a) => a.challengeDate >= mondayStr);
  const weeklyArenaScore = thisWeekAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const allTimeArenaScore = userAttempts.reduce((acc, a) => acc + (a.score || 0), 0);

  const todayAttempt = userAttempts.find((a) => a.challengeDate === todayStr);
  const isTodayCompleted = Boolean(todayAttempt);
  const todayScore = todayAttempt ? todayAttempt.score : null;

  // Compute weekly Arena rank
  const eligibleWeeklyAttempts = attempts.filter((a) => a.status === 'completed' && a.challengeDate >= mondayStr);
  const weeklyUserPoints = new Map<string, number>();
  eligibleWeeklyAttempts.forEach((att) => {
    weeklyUserPoints.set(att.userId, (weeklyUserPoints.get(att.userId) || 0) + att.score);
  });
  if (!weeklyUserPoints.has(userId) && weeklyArenaScore > 0) {
    weeklyUserPoints.set(userId, weeklyArenaScore);
  }

  const sortedPoints = Array.from(weeklyUserPoints.entries()).sort((a, b) => b[1] - a[1]);
  const userRankIdx = sortedPoints.findIndex(([uId]) => uId === userId);
  const arenaRank = userRankIdx >= 0 ? userRankIdx + 1 : (weeklyArenaScore > 0 ? 1 : 0);

  return {
    userId,
    totalXp,
    currentLevel: levelInfo.level,
    currentLevelName: levelInfo.levelName,
    nextLevelXp: levelInfo.nextLevelXp,
    levelProgressPercentage: levelInfo.progressPercentage,
    currentStreak,
    longestStreak,
    lastQualifyingDate: lastDate,
    streakFreezesAvailable: freezes,
    streakFreezesUsed: 0,
    preferredLeague: 'intermediate',
    sevenDayActivity,
    activeQuestsCount: 3,
    completedQuestsCount: 0,
    achievementsCount: achCount,
    weeklyArenaScore,
    allTimeArenaScore,
    arenaRank,
    todayScore,
    isTodayCompleted,
  };
}

/**
 * 5. GET ARENA LEADERBOARD
 */
export async function getArenaLeaderboard(
  league: LeaderboardLeague = 'intermediate',
  timeframe: LeaderboardTimeframe = 'weekly',
  currentUserId?: string
): Promise<LeaderboardResponse> {
  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  const profiles = readJsonFile<Record<string, UserGamificationProfile>>(PROFILES_FILE, {});
  const admin = getSupabaseAdminClient();

  // Merge attempts from Supabase to ensure accurate and complete leaderboard
  const allAttempts = [...attempts];
  if (admin) {
    try {
      const { data: dbAttempts } = await admin
        .from('challenge_attempts')
        .select('*')
        .eq('status', 'completed');
      if (dbAttempts && dbAttempts.length > 0) {
        const seen = new Set(allAttempts.map((a) => `${a.userId}_${a.challengeDate}`));
        for (const da of dbAttempts) {
          const key = `${da.user_id}_${da.challenge_date}`;
          if (!seen.has(key)) {
            allAttempts.push({
              id: da.id,
              userId: da.user_id,
              challengeId: da.challenge_id,
              challengeDate: da.challenge_date,
              status: da.status,
              score: da.score,
              correctCount: da.correct_count,
              totalQuestions: da.total_questions,
              timeTakenSeconds: da.time_taken_seconds,
              answers: da.answers || {},
              questionResults: da.question_results || undefined,
              xpAwarded: da.xp_awarded || 0,
              streakAfterAttempt: da.streak_after_attempt || 0,
              startedAt: da.started_at,
              completedAt: da.completed_at,
            });
            seen.add(key);
          }
        }
      }
    } catch {}
  }

  // Determine competition period
  const now = new Date();
  const d = new Date(now);
  const day = d.getUTCDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMon);
  monday.setUTCHours(0, 0, 0, 0);

  const resetSunday = new Date(monday);
  resetSunday.setUTCDate(monday.getUTCDate() + 6);
  resetSunday.setUTCHours(23, 59, 59, 999);

  const secondsUntilReset = Math.max(0, Math.floor((resetSunday.getTime() - now.getTime()) / 1000));
  const mondayStr = monday.toISOString().split('T')[0];

  // Filter attempts based on timeframe
  const eligibleAttempts = allAttempts.filter((a) => {
    if (a.status !== 'completed') return false;
    if (timeframe === 'weekly') {
      return a.challengeDate >= mondayStr;
    }
    if (timeframe === 'monthly') {
      return a.challengeDate.startsWith(now.toISOString().substring(0, 7));
    }
    return true; // all_time
  });

  // Aggregate user points
  const userMap = new Map<
    string,
    {
      userId: string;
      points: number;
      completedCount: number;
      perfectScores: number;
      earliestCompletion: number;
    }
  >();

  eligibleAttempts.forEach((att) => {
    if (!userMap.has(att.userId)) {
      userMap.set(att.userId, {
        userId: att.userId,
        points: 0,
        completedCount: 0,
        perfectScores: 0,
        earliestCompletion: att.completedAt ? new Date(att.completedAt).getTime() : Date.now(),
      });
    }
    const stat = userMap.get(att.userId)!;
    stat.points += att.score;
    stat.completedCount++;
    if (att.score === 100) stat.perfectScores++;
  });

  // Ensure current user is in map if active
  if (currentUserId && !userMap.has(currentUserId)) {
    userMap.set(currentUserId, {
      userId: currentUserId,
      points: 0,
      completedCount: 0,
      perfectScores: 0,
      earliestCompletion: Date.now(),
    });
  }

  // Fetch names from Supabase or fallback profiles
  let dbProfilesMap = new Map<string, any>();
  if (admin) {
    try {
      const { data: dbProfs } = await admin.from('profiles').select('id, full_name, role, company, avatar_url');
      (dbProfs || []).forEach((p) => dbProfilesMap.set(p.id, p));
    } catch {}
  }

  // Convert to sorted leaderboard array with tie-breaking
  const entries: LeaderboardEntry[] = Array.from(userMap.values())
    .map((item) => {
      const prof = dbProfilesMap.get(item.userId);
      const gam = profiles[item.userId];
      const isCurrent = currentUserId ? item.userId === currentUserId : false;

      const rawName = prof?.full_name || (isCurrent ? 'You' : `PM Member ${item.userId.substring(0, 4)}`);

      return {
        rank: 0,
        userId: item.userId,
        displayName: isCurrent ? `${rawName} (You)` : rawName,
        avatarUrl: prof?.avatar_url || '',
        role: prof?.role || 'Product Manager',
        company: prof?.company || 'Tech',
        league,
        points: item.points,
        totalXp: gam?.totalXp || item.points,
        challengesCompleted: item.completedCount,
        perfectScoresCount: item.perfectScores,
        currentStreak: gam?.currentStreak || (item.completedCount > 0 ? 1 : 0),
        isCurrentUser: isCurrent,
      };
    })
    .sort((a, b) => {
      // 1. Points
      if (b.points !== a.points) return b.points - a.points;
      // 2. Perfect scores
      if (b.perfectScoresCount !== a.perfectScoresCount) {
        return b.perfectScoresCount - a.perfectScoresCount;
      }
      // 3. Completed challenges
      return b.challengesCompleted - a.challengesCompleted;
    })
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const topPodium = entries.slice(0, 3);
  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  return {
    timeframe,
    league,
    resetDate: resetSunday.toISOString(),
    secondsUntilReset,
    topPodium,
    entries,
    currentUserEntry,
    totalParticipants: entries.length,
  };
}

/**
 * 6. GET WEEKLY QUESTS & USER PROGRESS
 */
export async function getWeeklyQuestsWithProgress(
  userId: string
): Promise<WeeklyQuest[]> {
  const quests = getActiveWeeklyQuests();
  const questProgressData = readJsonFile<
    { userId: string; questId: string; progress: number; isCompleted: boolean; isClaimed: boolean }[]
  >(QUESTS_FILE, []);

  // Compute actual completed Daily 5s this week
  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  const now = new Date();
  const monday = new Date(now);
  const day = now.getUTCDay();
  monday.setUTCDate(now.getUTCDate() + (day === 0 ? -6 : 1 - day));
  const mondayStr = monday.toISOString().split('T')[0];

  const thisWeekAttempts = attempts.filter(
    (a) => a.userId === userId && a.status === 'completed' && a.challengeDate >= mondayStr
  );
  const uniqueDaysCompleted = new Set(thisWeekAttempts.map((a) => a.challengeDate)).size;
  const hasAccuracy80 = thisWeekAttempts.some((a) => a.score >= 80);

  return quests.map((q) => {
    let currentProgress = 0;
    if (q.questType === 'daily_count') {
      currentProgress = uniqueDaysCompleted;
    } else if (q.questType === 'score_threshold') {
      currentProgress = hasAccuracy80 ? 1 : 0;
    } else {
      currentProgress = 0;
    }

    const saved = questProgressData.find((p) => p.userId === userId && p.questId === q.id);
    const isCompleted = currentProgress >= q.targetCount;
    const isClaimed = Boolean(saved?.isClaimed);

    return {
      ...q,
      userProgress: {
        currentProgress: Math.min(q.targetCount, currentProgress),
        isCompleted,
        isClaimed,
      },
    };
  });
}

/**
 * Increment / update quest progress
 */
async function incrementQuestProgress(userId: string, hasScore80: boolean) {
  const questProgressData = readJsonFile<
    { userId: string; questId: string; progress: number; isCompleted: boolean; isClaimed: boolean }[]
  >(QUESTS_FILE, []);

  const quests = getActiveWeeklyQuests();
  quests.forEach((q) => {
    let item = questProgressData.find((p) => p.userId === userId && p.questId === q.id);
    if (!item) {
      item = { userId, questId: q.id, progress: 0, isCompleted: false, isClaimed: false };
      questProgressData.push(item);
    }

    if (q.questType === 'daily_count') {
      item.progress += 1;
      if (item.progress >= q.targetCount) item.isCompleted = true;
    }
    if (q.questType === 'score_threshold' && hasScore80) {
      item.progress = 1;
      item.isCompleted = true;
    }
  });

  writeJsonFile(QUESTS_FILE, questProgressData);
}

/**
 * 7. CLAIM QUEST REWARD
 */
export async function claimQuestReward(
  userId: string,
  questId: string
): Promise<{ success: boolean; xpAwarded: number; updatedProfile: UserGamificationProfile }> {
  const questProgressData = readJsonFile<
    { userId: string; questId: string; progress: number; isCompleted: boolean; isClaimed: boolean }[]
  >(QUESTS_FILE, []);

  const item = questProgressData.find((p) => p.userId === userId && p.questId === questId);
  if (!item || !item.isCompleted || item.isClaimed) {
    throw new Error('Quest is not eligible for claim or reward has already been claimed');
  }

  const quests = getActiveWeeklyQuests();
  const questDef = quests.find((q) => q.id === questId);
  const xpReward = questDef?.xpReward || 50;

  item.isClaimed = true;
  writeJsonFile(QUESTS_FILE, questProgressData);

  // Record in ledger
  const transactions: XpTransaction[] = readJsonFile<XpTransaction[]>(TRANSACTIONS_FILE, []);
  transactions.push({
    id: `tx_${Date.now()}_quest`,
    userId,
    sourceType: 'weekly_quest',
    sourceId: questId,
    xpAmount: xpReward,
    idempotencyKey: `xp_quest_${userId}_${questId}`,
    description: `Claimed Weekly Quest: ${questDef?.title || 'Weekly Mission'}`,
    createdAt: new Date().toISOString(),
  });
  writeJsonFile(TRANSACTIONS_FILE, transactions);

  // Update profile
  const profile = await getUserGamificationProfile(userId);
  const newXp = profile.totalXp + xpReward;
  const levelInfo = calculateLevelFromXp(newXp);

  const profiles = readJsonFile<Record<string, UserGamificationProfile>>(PROFILES_FILE, {});
  const updatedProfile: UserGamificationProfile = {
    ...profile,
    totalXp: newXp,
    currentLevel: levelInfo.level,
    currentLevelName: levelInfo.levelName,
    nextLevelXp: levelInfo.nextLevelXp,
    levelProgressPercentage: levelInfo.progressPercentage,
    completedQuestsCount: (profile.completedQuestsCount || 0) + 1,
  };
  profiles[userId] = updatedProfile;
  writeJsonFile(PROFILES_FILE, profiles);

  // Sync to Supabase if configured
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      await admin.from('user_gamification').update({
        total_xp: newXp,
        current_level: levelInfo.level,
        current_level_name: levelInfo.levelName,
      }).eq('user_id', userId);
    } catch {}
  }

  return {
    success: true,
    xpAwarded: xpReward,
    updatedProfile,
  };
}

/**
 * 8. GET USER ACHIEVEMENTS GALLERY
 */
export async function getUserAchievements(
  userId: string
): Promise<AchievementDefinition[]> {
  const existingAchievements = readJsonFile<{ userId: string; achievementId: string; earnedAt?: string }[]>(
    ACHIEVEMENTS_FILE,
    []
  );
  const earnedMap = new Map(
    existingAchievements.filter((a) => a.userId === userId).map((a) => [a.achievementId, a.earnedAt || 'Earned'])
  );

  const profile = await getUserGamificationProfile(userId);
  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  const userAttempts = attempts.filter((a) => a.userId === userId && a.status === 'completed');
  const totalCount = userAttempts.length;

  const now = new Date();
  const monday = new Date(now);
  const day = now.getUTCDay();
  monday.setUTCDate(now.getUTCDate() + (day === 0 ? -6 : 1 - day));
  monday.setUTCHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];
  const weeklyCount = userAttempts.filter((a) => a.challengeDate >= mondayStr).length;

  return INITIAL_ACHIEVEMENTS.map((ach) => {
    const isEarned = earnedMap.has(ach.id);
    let progressCurrent = 0;
    let progressTarget = 1;
    let progressLabel = '';

    if (ach.id === 'first_challenge') {
      progressCurrent = Math.min(1, totalCount);
      progressTarget = 1;
      progressLabel = `${progressCurrent}/1 Challenge Completed`;
    } else if (ach.id === 'consistency_starter') {
      progressCurrent = Math.min(3, profile.currentStreak);
      progressTarget = 3;
      progressLabel = `${progressCurrent}/3 Days Streak`;
    } else if (ach.id === 'week_warrior') {
      progressCurrent = Math.min(7, profile.currentStreak);
      progressTarget = 7;
      progressLabel = `${progressCurrent}/7 Days Streak`;
    } else if (ach.id === 'habit_builder') {
      progressCurrent = Math.min(14, profile.currentStreak);
      progressTarget = 14;
      progressLabel = `${progressCurrent}/14 Days Streak`;
    } else if (ach.id === 'monthly_master') {
      progressCurrent = Math.min(30, profile.currentStreak);
      progressTarget = 30;
      progressLabel = `${progressCurrent}/30 Days Streak`;
    } else if (ach.id === 'perfect_five') {
      const hasPerfect = userAttempts.some((a) => a.score === 100);
      progressCurrent = hasPerfect ? 1 : 0;
      progressTarget = 1;
      progressLabel = hasPerfect ? '100% Score Achieved' : 'Score 100% on a Daily 5';
    } else if (ach.id === 'arena_contender') {
      progressCurrent = Math.min(100, profile.weeklyArenaScore);
      progressTarget = 100;
      progressLabel = `${progressCurrent}/100 Arena Pts`;
    } else if (ach.id === 'arena_titan') {
      progressCurrent = Math.min(300, profile.weeklyArenaScore);
      progressTarget = 300;
      progressLabel = `${progressCurrent}/300 Arena Pts`;
    } else if (ach.id === 'arena_champion') {
      progressCurrent = (profile.arenaRank > 0 && profile.arenaRank <= 3 && totalCount >= 1) ? 1 : 0;
      progressTarget = 1;
      progressLabel = profile.arenaRank > 0 ? `Current Rank: #${profile.arenaRank}` : 'Top 3 on Leaderboard';
    } else if (ach.id === 'sprint_centurion') {
      progressCurrent = Math.min(5, weeklyCount);
      progressTarget = 5;
      progressLabel = `${progressCurrent}/5 Challenges this week`;
    } else if (ach.id === 'pm_strategist') {
      progressCurrent = Math.min(700, profile.totalXp);
      progressTarget = 700;
      progressLabel = `${profile.totalXp}/700 XP`;
    } else if (ach.id === 'quest_completer') {
      progressCurrent = Math.min(3, profile.completedQuestsCount || 0);
      progressTarget = 3;
      progressLabel = `${progressCurrent}/3 Quests Completed`;
    }

    return {
      ...ach,
      isEarned,
      earnedAt: earnedMap.get(ach.id),
      progressCurrent,
      progressTarget,
      progressLabel,
    };
  });
}
