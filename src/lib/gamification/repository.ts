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

// Local storage fallback directory (/tmp on Vercel to avoid EROFS)
const CACHE_DIR = process.env.VERCEL
  ? path.join('/tmp', '.gamification_cache')
  : path.join(process.cwd(), 'src', 'data', '.gamification_cache');

const PROFILES_FILE = path.join(CACHE_DIR, 'profiles.json');
const ATTEMPTS_FILE = path.join(CACHE_DIR, 'attempts.json');
const TRANSACTIONS_FILE = path.join(CACHE_DIR, 'transactions.json');
const ACHIEVEMENTS_FILE = path.join(CACHE_DIR, 'achievements.json');
const QUESTS_FILE = path.join(CACHE_DIR, 'quests.json');

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {}
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureCacheDir();
  try {
    if (!fs.existsSync(filePath)) return fallback;
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
    // Non-fatal warning
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

export interface UserGamificationMetadata {
  totalXp: number;
  currentLevel: number;
  currentLevelName: string;
  currentStreak: number;
  longestStreak: number;
  lastQualifyingDate: string | null;
  streakFreezesAvailable: number;
  weeklyArenaScore: number;
  allTimeArenaScore: number;
  attempts: ChallengeAttempt[];
  achievements: { achievementId: string; earnedAt?: string }[];
  quests: Record<string, { progress: number; isCompleted: boolean; isClaimed: boolean }>;
}

/**
 * Retrieve user gamification state directly from Supabase Auth user_metadata (persistent in Supabase Postgres)
 */
export async function getUserMetadataGamification(userId: string): Promise<UserGamificationMetadata | null> {
  if (!userId || userId === 'guest' || userId.startsWith('guest_')) return null;
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  try {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data?.user) return null;
    return (data.user.user_metadata?.gamification as UserGamificationMetadata) || null;
  } catch {
    return null;
  }
}

/**
 * Persist user gamification state directly to Supabase Auth user_metadata
 */
export async function saveUserMetadataGamification(
  userId: string,
  gamData: Partial<UserGamificationMetadata>
): Promise<boolean> {
  if (!userId || userId === 'guest' || userId.startsWith('guest_')) return false;
  const admin = getSupabaseAdminClient();
  if (!admin) return false;
  try {
    const { data: userRecord, error: fetchErr } = await admin.auth.admin.getUserById(userId);
    if (fetchErr || !userRecord?.user) return false;
    const existingMeta = userRecord.user.user_metadata || {};
    const existingGam = (existingMeta.gamification || {}) as Partial<UserGamificationMetadata>;

    // Merge attempts without duplicate dates
    let mergedAttempts = existingGam.attempts || [];
    if (gamData.attempts) {
      const attemptMap = new Map<string, ChallengeAttempt>();
      mergedAttempts.forEach((a) => attemptMap.set(a.challengeDate, a));
      gamData.attempts.forEach((a) => attemptMap.set(a.challengeDate, a));
      mergedAttempts = Array.from(attemptMap.values());
    }

    // Merge achievements without duplicate achievementId
    let mergedAchievements = existingGam.achievements || [];
    if (gamData.achievements) {
      const achMap = new Map<string, { achievementId: string; earnedAt?: string }>();
      mergedAchievements.forEach((a) => achMap.set(a.achievementId, a));
      gamData.achievements.forEach((a) => achMap.set(a.achievementId, a));
      mergedAchievements = Array.from(achMap.values());
    }

    const updatedGam: UserGamificationMetadata = {
      totalXp: gamData.totalXp ?? existingGam.totalXp ?? 0,
      currentLevel: gamData.currentLevel ?? existingGam.currentLevel ?? 1,
      currentLevelName: gamData.currentLevelName ?? existingGam.currentLevelName ?? 'PM Rookie',
      currentStreak: gamData.currentStreak ?? existingGam.currentStreak ?? 0,
      longestStreak: gamData.longestStreak ?? existingGam.longestStreak ?? 0,
      lastQualifyingDate: gamData.lastQualifyingDate ?? existingGam.lastQualifyingDate ?? null,
      streakFreezesAvailable: gamData.streakFreezesAvailable ?? existingGam.streakFreezesAvailable ?? 1,
      weeklyArenaScore: gamData.weeklyArenaScore ?? existingGam.weeklyArenaScore ?? 0,
      allTimeArenaScore: gamData.allTimeArenaScore ?? existingGam.allTimeArenaScore ?? 0,
      attempts: mergedAttempts,
      achievements: mergedAchievements,
      quests: { ...(existingGam.quests || {}), ...(gamData.quests || {}) },
    };

    const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingMeta,
        gamification: updatedGam,
      },
    });

    return !updateErr;
  } catch (err) {
    console.warn('saveUserMetadataGamification warning:', err);
    return false;
  }
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

  // Attempt to load from Supabase if published table exists
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
          questions: dbChallenge.challenge_questions
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((q: any) => ({
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
    // 1. Check persistent Supabase user_metadata
    try {
      const userMeta = await getUserMetadataGamification(userId);
      if (userMeta?.attempts) {
        const found = userMeta.attempts.find((a) => a.challengeDate === dateStr);
        if (found) userAttempt = found;
      }
    } catch {}

    // 2. Check Supabase challenge_attempts table if available
    if (!userAttempt && admin) {
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

    // 3. Check local JSON fallback
    if (!userAttempt) {
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

  // Local fallback / storage
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

  // Sync to user_metadata in Supabase
  try {
    const userMeta = await getUserMetadataGamification(userId);
    const existingAttempts = userMeta?.attempts || [];
    const attIdx = existingAttempts.findIndex((a) => a.challengeDate === challengeDate);
    if (attIdx >= 0) {
      if (existingAttempts[attIdx].status !== 'completed') {
        existingAttempts[attIdx].answers = {
          ...(existingAttempts[attIdx].answers || {}),
          [questionId]: selectedOptionId,
        };
      }
    } else {
      existingAttempts.push(localAttempt);
    }
    await saveUserMetadataGamification(userId, { attempts: existingAttempts });
  } catch {}

  // Sync to Supabase table if available
  if (admin) {
    try {
      const { data: existing } = await admin
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_date', challengeDate)
        .single();

      if (existing && existing.status !== 'completed') {
        const updatedAnswers = { ...(existing.answers || {}), [questionId]: selectedOptionId };
        const { data: updated } = await admin
          .from('challenge_attempts')
          .update({ answers: updatedAnswers })
          .eq('id', existing.id)
          .select()
          .single();
        if (updated) attempt = updated;
      }
    } catch {}
  }

  return attempt || localAttempt;
}

/**
 * 3. SUBMIT CHALLENGE ATTEMPT
 * Evaluates answers server-side, updates streak, awards XP,
 * updates weekly arena score, checks achievements, holds score permanently.
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
  const userMeta = await getUserMetadataGamification(userId);
  let existingAttempt = userMeta?.attempts?.find(
    (a) => a.challengeDate === challengeDate && a.status === 'completed'
  );

  const existingAttempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  if (!existingAttempt) {
    existingAttempt = existingAttempts.find(
      (a) => a.userId === userId && a.challengeDate === challengeDate && a.status === 'completed'
    );
  }

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

  // Once completed: the score is held and user cannot retry or re-submit today!
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

  const allPreviousAttempts = [
    ...(userMeta?.attempts || []),
    ...existingAttempts.filter((a) => a.userId === userId),
  ];
  const uniqueAttemptsMap = new Map<string, ChallengeAttempt>();
  allPreviousAttempts.forEach((a) => {
    if (a.status === 'completed' && a.challengeDate !== challengeDate) {
      uniqueAttemptsMap.set(a.challengeDate, a);
    }
  });
  uniqueAttemptsMap.set(challengeDate, completedAttempt);

  const userCompletedAttempts = Array.from(uniqueAttemptsMap.values());
  const thisWeekAttempts = userCompletedAttempts.filter((a) => a.challengeDate >= mondayStr);
  const weeklyArenaScore = thisWeekAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const allTimeArenaScore = userCompletedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const weeklyChallengesCompleted = thisWeekAttempts.length;

  // 7. Check for unlocked badges & milestones
  const existingAchievements = [
    ...(userMeta?.achievements || []),
    ...readJsonFile<{ userId: string; achievementId: string; earnedAt?: string }[]>(ACHIEVEMENTS_FILE, [])
      .filter((a) => a.userId === userId),
  ];
  const userAchIds = new Set(existingAchievements.map((a) => a.achievementId));

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

  // Award bonus XP for newly unlocked badges / milestones
  let bonusAchievementXp = 0;
  const newAchievementsToSave: { achievementId: string; earnedAt: string }[] = [];
  unlocked.forEach((ach) => {
    const earnedAt = new Date().toISOString();
    newAchievementsToSave.push({ achievementId: ach.id, earnedAt });
    const xpBonus = ach.xpReward || 50;
    bonusAchievementXp += xpBonus;
  });

  totalXpAwarded += bonusAchievementXp;
  completedAttempt.xpAwarded = totalXpAwarded;

  const finalTotalXp = currentProfile.totalXp + totalXpAwarded;
  const finalLevelInfo = calculateLevelFromXp(finalTotalXp);

  // 8. Update weekly quest progress
  await incrementQuestProgress(userId, scoring.score >= 80);

  // 9. Update profile
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

  // 10. Persist to Supabase Auth user_metadata (guaranteed storage in Supabase)
  await saveUserMetadataGamification(userId, {
    totalXp: finalTotalXp,
    currentLevel: finalLevelInfo.level,
    currentLevelName: finalLevelInfo.levelName,
    currentStreak: streakResult.newStreak,
    longestStreak: streakResult.newLongestStreak,
    lastQualifyingDate: challengeDate,
    streakFreezesAvailable: streakResult.freezesRemaining,
    weeklyArenaScore,
    allTimeArenaScore,
    attempts: userCompletedAttempts,
    achievements: newAchievementsToSave,
  });

  // 11. Also persist to local cache files
  const profiles = readJsonFile<Record<string, UserGamificationProfile>>(PROFILES_FILE, {});
  profiles[userId] = updatedProfile;
  writeJsonFile(PROFILES_FILE, profiles);

  const attIndex = existingAttempts.findIndex(
    (a) => a.userId === userId && a.challengeDate === challengeDate
  );
  if (attIndex >= 0) {
    existingAttempts[attIndex] = completedAttempt;
  } else {
    existingAttempts.push(completedAttempt);
  }
  writeJsonFile(ATTEMPTS_FILE, existingAttempts);

  // 12. Also try persisting to dedicated Supabase tables if they exist
  if (admin) {
    try {
      await admin.from('daily_challenges').upsert({
        id: challenge.id,
        challenge_date: challengeDate,
        title: challenge.title,
        theme: challenge.theme,
        description: challenge.description,
        difficulty: challenge.difficulty,
        timezone: challenge.timezone,
        publication_status: challenge.publicationStatus,
      }, { onConflict: 'id' });
    } catch {}

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
    } catch {}

    try {
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
    } catch {}

    try {
      const baseTxKey = `xp_daily_${userId}_${challengeDate}`;
      await admin.from('xp_transactions').upsert({
        user_id: userId,
        source_type: 'daily_challenge',
        source_id: challenge.id,
        xp_amount: scoring.totalXpEarned,
        idempotency_key: baseTxKey,
        description: `Completed Daily 5 (${challenge.theme})`,
      }, { onConflict: 'idempotency_key' });
    } catch {}
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
  const userMeta = await getUserMetadataGamification(userId);

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

  // Merge attempts
  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  const allAttempts = [
    ...(userMeta?.attempts || []),
    ...attempts.filter((a) => a.userId === userId),
  ];

  if (admin) {
    try {
      const { data: dbAttempts } = await admin
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed');
      if (dbAttempts) {
        dbAttempts.forEach((da) => {
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
        });
      }
    } catch {}
  }

  const uniqueAttemptsMap = new Map<string, ChallengeAttempt>();
  allAttempts.forEach((a) => {
    if (a.status === 'completed') {
      uniqueAttemptsMap.set(a.challengeDate, a);
    }
  });
  const userCompletedAttempts = Array.from(uniqueAttemptsMap.values());

  const todayStr = getCanonicalDateString();
  const todayAttempt = userCompletedAttempts.find((a) => a.challengeDate === todayStr);
  const isTodayCompleted = Boolean(todayAttempt);
  const todayScore = todayAttempt ? todayAttempt.score : null;

  // Streak & dates
  let currentStreak = userMeta?.currentStreak ?? dbProfile?.current_streak ?? cached?.currentStreak ?? (userCompletedAttempts.length > 0 ? 1 : 0);
  let longestStreak = userMeta?.longestStreak ?? dbProfile?.longest_streak ?? cached?.longestStreak ?? currentStreak;
  let lastDate = userMeta?.lastQualifyingDate ?? dbProfile?.last_qualifying_date ?? cached?.lastQualifyingDate ?? (todayAttempt ? todayStr : null);
  const freezes = userMeta?.streakFreezesAvailable ?? dbProfile?.streak_freezes_available ?? cached?.streakFreezesAvailable ?? 1;

  // XP calculation
  const totalXp = Math.max(
    userMeta?.totalXp ?? 0,
    dbProfile?.total_xp ?? 0,
    cached?.totalXp ?? 0,
    userCompletedAttempts.reduce((acc, a) => acc + (a.xpAwarded || a.score || 0), 0)
  );

  const levelInfo = calculateLevelFromXp(totalXp);

  // Generate 7-day rolling activity calendar (last 6 days + today)
  const today = new Date();
  const sevenDayActivity: UserGamificationProfile['sevenDayActivity'] = [];
  const completedDateSet = new Set(userCompletedAttempts.map((a) => a.challengeDate));
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
  const achCount = (userMeta?.achievements?.length || 0) + (userCompletedAttempts.length >= 1 ? 1 : 0);

  // Compute Arena stats
  const monday = new Date(today);
  const day = today.getUTCDay();
  monday.setUTCDate(today.getUTCDate() + (day === 0 ? -6 : 1 - day));
  monday.setUTCHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];

  const thisWeekAttempts = userCompletedAttempts.filter((a) => a.challengeDate >= mondayStr);
  const weeklyArenaScore = thisWeekAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const allTimeArenaScore = userCompletedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);

  // Compute arena rank
  const arenaRank = weeklyArenaScore > 0 ? 1 : 0;

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
  const admin = getSupabaseAdminClient();

  // Merge attempts from Supabase table if available
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

  // If current user has metadata gamification attempts, merge those as well
  if (currentUserId) {
    try {
      const userMeta = await getUserMetadataGamification(currentUserId);
      if (userMeta?.attempts) {
        const seen = new Set(allAttempts.map((a) => `${a.userId}_${a.challengeDate}`));
        for (const ma of userMeta.attempts) {
          const key = `${currentUserId}_${ma.challengeDate}`;
          if (!seen.has(key) && ma.status === 'completed') {
            allAttempts.push(ma);
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
      streak: number;
      totalXp: number;
    }
  >();

  eligibleAttempts.forEach((att) => {
    if (!userMap.has(att.userId)) {
      userMap.set(att.userId, {
        userId: att.userId,
        points: 0,
        completedCount: 0,
        perfectScores: 0,
        streak: att.streakAfterAttempt || 1,
        totalXp: 0,
      });
    }
    const stat = userMap.get(att.userId)!;
    stat.points += att.score;
    stat.completedCount++;
    stat.totalXp += att.xpAwarded || att.score;
    if (att.streakAfterAttempt) stat.streak = Math.max(stat.streak, att.streakAfterAttempt);
    if (att.score === 100) stat.perfectScores++;
  });

  // Ensure current user is in map if active
  if (currentUserId && !userMap.has(currentUserId)) {
    userMap.set(currentUserId, {
      userId: currentUserId,
      points: 0,
      completedCount: 0,
      perfectScores: 0,
      streak: 0,
      totalXp: 0,
    });
  }

  // Fetch profiles from Supabase
  let dbProfilesMap = new Map<string, any>();
  if (admin) {
    try {
      const { data: dbProfs } = await admin
        .from('profiles')
        .select('id, full_name, role, company, avatar_url');
      (dbProfs || []).forEach((p) => dbProfilesMap.set(p.id, p));
    } catch {}
  }

  // Convert to sorted leaderboard array with tie-breaking
  const entries: LeaderboardEntry[] = Array.from(userMap.values())
    .map((item) => {
      const prof = dbProfilesMap.get(item.userId);
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
        totalXp: item.totalXp || item.points,
        challengesCompleted: item.completedCount,
        perfectScoresCount: item.perfectScores,
        currentStreak: item.streak,
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
  const userMeta = await getUserMetadataGamification(userId);
  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  const allAttempts = [
    ...(userMeta?.attempts || []),
    ...attempts.filter((a) => a.userId === userId),
  ];

  const now = new Date();
  const monday = new Date(now);
  const day = now.getUTCDay();
  monday.setUTCDate(now.getUTCDate() + (day === 0 ? -6 : 1 - day));
  const mondayStr = monday.toISOString().split('T')[0];

  const thisWeekAttempts = allAttempts.filter(
    (a) => a.status === 'completed' && a.challengeDate >= mondayStr
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
      currentProgress = uniqueDaysCompleted;
    }

    const saved = questProgressData.find((p) => p.userId === userId && p.questId === q.id);
    const metaSaved = userMeta?.quests?.[q.id];
    const isCompleted = currentProgress >= q.targetCount;
    const isClaimed = Boolean(saved?.isClaimed || metaSaved?.isClaimed);

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
  const updatedMetaQuests: Record<string, { progress: number; isCompleted: boolean; isClaimed: boolean }> = {};

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

    updatedMetaQuests[q.id] = {
      progress: item.progress,
      isCompleted: item.isCompleted,
      isClaimed: item.isClaimed,
    };
  });

  writeJsonFile(QUESTS_FILE, questProgressData);
  await saveUserMetadataGamification(userId, { quests: updatedMetaQuests });
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

  const questsWithProg = await getWeeklyQuestsWithProgress(userId);
  const targetQuest = questsWithProg.find((q) => q.id === questId);

  if (!targetQuest || !targetQuest.userProgress?.isCompleted || targetQuest.userProgress?.isClaimed) {
    throw new Error('Quest is not eligible for claim or reward has already been claimed');
  }

  const xpReward = targetQuest.xpReward || 50;

  // Mark claimed in local and metadata
  let item = questProgressData.find((p) => p.userId === userId && p.questId === questId);
  if (!item) {
    item = { userId, questId, progress: targetQuest.targetCount, isCompleted: true, isClaimed: true };
    questProgressData.push(item);
  } else {
    item.isClaimed = true;
  }
  writeJsonFile(QUESTS_FILE, questProgressData);

  // Update profile
  const profile = await getUserGamificationProfile(userId);
  const newXp = profile.totalXp + xpReward;
  const levelInfo = calculateLevelFromXp(newXp);

  const updatedProfile: UserGamificationProfile = {
    ...profile,
    totalXp: newXp,
    currentLevel: levelInfo.level,
    currentLevelName: levelInfo.levelName,
    nextLevelXp: levelInfo.nextLevelXp,
    levelProgressPercentage: levelInfo.progressPercentage,
    completedQuestsCount: (profile.completedQuestsCount || 0) + 1,
  };

  await saveUserMetadataGamification(userId, {
    totalXp: newXp,
    currentLevel: levelInfo.level,
    currentLevelName: levelInfo.levelName,
    quests: {
      [questId]: { progress: targetQuest.targetCount, isCompleted: true, isClaimed: true },
    },
  });

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
  const userMeta = await getUserMetadataGamification(userId);
  const existingAchievements = [
    ...(userMeta?.achievements || []),
    ...readJsonFile<{ userId: string; achievementId: string; earnedAt?: string }[]>(ACHIEVEMENTS_FILE, [])
      .filter((a) => a.userId === userId),
  ];
  const earnedMap = new Map(
    existingAchievements.map((a) => [a.achievementId, a.earnedAt || 'Earned'])
  );

  const profile = await getUserGamificationProfile(userId);
  const attempts = readJsonFile<ChallengeAttempt[]>(ATTEMPTS_FILE, []);
  const allAttempts = [
    ...(userMeta?.attempts || []),
    ...attempts.filter((a) => a.userId === userId),
  ];

  const uniqueAttemptsMap = new Map<string, ChallengeAttempt>();
  allAttempts.forEach((a) => {
    if (a.status === 'completed') {
      uniqueAttemptsMap.set(a.challengeDate, a);
    }
  });
  const userAttempts = Array.from(uniqueAttemptsMap.values());
  const totalCount = userAttempts.length;

  const now = new Date();
  const monday = new Date(now);
  const day = now.getUTCDay();
  monday.setUTCDate(now.getUTCDate() + (day === 0 ? -6 : 1 - day));
  monday.setUTCHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];
  const weeklyCount = userAttempts.filter((a) => a.challengeDate >= mondayStr).length;

  return INITIAL_ACHIEVEMENTS.map((ach) => {
    let isEarned = earnedMap.has(ach.id);
    let progressCurrent = 0;
    let progressTarget = 1;
    let progressLabel = '';

    if (ach.id === 'first_challenge') {
      progressCurrent = Math.min(1, totalCount);
      progressTarget = 1;
      progressLabel = `${progressCurrent}/1 Challenge Completed`;
      if (totalCount >= 1) isEarned = true;
    } else if (ach.id === 'consistency_starter') {
      progressCurrent = Math.min(3, profile.currentStreak);
      progressTarget = 3;
      progressLabel = `${progressCurrent}/3 Days Streak`;
      if (profile.currentStreak >= 3) isEarned = true;
    } else if (ach.id === 'week_warrior') {
      progressCurrent = Math.min(7, profile.currentStreak);
      progressTarget = 7;
      progressLabel = `${progressCurrent}/7 Days Streak`;
      if (profile.currentStreak >= 7) isEarned = true;
    } else if (ach.id === 'habit_builder') {
      progressCurrent = Math.min(14, profile.currentStreak);
      progressTarget = 14;
      progressLabel = `${progressCurrent}/14 Days Streak`;
      if (profile.currentStreak >= 14) isEarned = true;
    } else if (ach.id === 'monthly_master') {
      progressCurrent = Math.min(30, profile.currentStreak);
      progressTarget = 30;
      progressLabel = `${progressCurrent}/30 Days Streak`;
      if (profile.currentStreak >= 30) isEarned = true;
    } else if (ach.id === 'perfect_five') {
      const hasPerfect = userAttempts.some((a) => a.score === 100);
      progressCurrent = hasPerfect ? 1 : 0;
      progressTarget = 1;
      progressLabel = hasPerfect ? '100% Score Achieved' : 'Score 100% on a Daily 5';
      if (hasPerfect) isEarned = true;
    } else if (ach.id === 'arena_contender') {
      progressCurrent = Math.min(100, profile.weeklyArenaScore);
      progressTarget = 100;
      progressLabel = `${progressCurrent}/100 Arena Pts`;
      if (profile.weeklyArenaScore >= 100) isEarned = true;
    } else if (ach.id === 'arena_titan') {
      progressCurrent = Math.min(300, profile.weeklyArenaScore);
      progressTarget = 300;
      progressLabel = `${progressCurrent}/300 Arena Pts`;
      if (profile.weeklyArenaScore >= 300) isEarned = true;
    } else if (ach.id === 'arena_champion') {
      progressCurrent = (profile.arenaRank > 0 && profile.arenaRank <= 3 && totalCount >= 1) ? 1 : 0;
      progressTarget = 1;
      progressLabel = profile.arenaRank > 0 ? `Current Rank: #${profile.arenaRank}` : 'Top 3 on Leaderboard';
      if (profile.arenaRank > 0 && profile.arenaRank <= 3 && totalCount >= 1) isEarned = true;
    } else if (ach.id === 'sprint_centurion') {
      progressCurrent = Math.min(5, weeklyCount);
      progressTarget = 5;
      progressLabel = `${progressCurrent}/5 Challenges this week`;
      if (weeklyCount >= 5) isEarned = true;
    } else if (ach.id === 'pm_strategist') {
      progressCurrent = Math.min(700, profile.totalXp);
      progressTarget = 700;
      progressLabel = `${profile.totalXp}/700 XP`;
      if (profile.totalXp >= 700) isEarned = true;
    } else if (ach.id === 'quest_completer') {
      progressCurrent = Math.min(3, profile.completedQuestsCount || 0);
      progressTarget = 3;
      progressLabel = `${progressCurrent}/3 Quests Completed`;
      if ((profile.completedQuestsCount || 0) >= 3) isEarned = true;
    }

    return {
      ...ach,
      isEarned,
      earnedAt: isEarned ? (earnedMap.get(ach.id) || 'Earned') : undefined,
      progressCurrent,
      progressTarget,
      progressLabel,
    };
  });
}
