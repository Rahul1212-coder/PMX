export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ChallengePublicationStatus = 'draft' | 'published' | 'archived';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';
export type LeaderboardLeague = 'beginner' | 'intermediate' | 'advanced';
export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'all_time';

export interface ChallengeOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface ChallengeQuestion {
  id: string;
  challengeId: string;
  orderIndex: number;
  scenario: string;
  questionText: string;
  skillCategory: string; // 'Metrics' | 'Prioritization' | 'Strategy' | 'Experimentation' | 'Execution' | 'Discovery' | 'Growth'
  difficulty: ChallengeDifficulty;
  options: ChallengeOption[];
  correctOption: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  optionExplanations: Record<string, string>;
  points: number; // default 20
}

// Client-safe version of question with correctOption and explanations stripped
export interface PublicChallengeQuestion {
  id: string;
  challengeId: string;
  orderIndex: number;
  scenario: string;
  questionText: string;
  skillCategory: string;
  difficulty: ChallengeDifficulty;
  options: ChallengeOption[];
  points: number;
}

export interface DailyChallenge {
  id: string;
  challengeDate: string; // YYYY-MM-DD
  title: string;
  theme: string;
  description: string;
  difficulty: ChallengeDifficulty;
  timezone: string;
  publicationStatus: ChallengePublicationStatus;
  questions: ChallengeQuestion[];
  publishedAt?: string;
  createdAt: string;
}

export interface PublicDailyChallenge {
  id: string;
  challengeDate: string;
  title: string;
  theme: string;
  description: string;
  difficulty: ChallengeDifficulty;
  timezone: string;
  publicationStatus: ChallengePublicationStatus;
  questions: PublicChallengeQuestion[];
  publishedAt?: string;
  timeRemainingSeconds?: number;
}

export interface QuestionResult {
  questionId: string;
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  explanation: string;
  optionExplanations: Record<string, string>;
  skillCategory: string;
}

export interface ChallengeAttempt {
  id: string;
  userId: string;
  challengeId: string;
  challengeDate: string;
  status: AttemptStatus;
  score: number; // 0 - 100
  correctCount: number; // 0 - 5
  totalQuestions: number; // 5
  timeTakenSeconds: number;
  answers: Record<string, string>; // questionId -> selectedOptionId
  questionResults?: QuestionResult[];
  xpAwarded: number;
  streakAfterAttempt: number;
  startedAt: string;
  completedAt?: string;
}

export interface StreakDayStatus {
  date: string;
  dayLabel: string; // 'Mon', 'Tue', etc.
  status: 'completed' | 'missed' | 'today_pending' | 'today_completed' | 'future';
}

export interface UserGamificationProfile {
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentLevelName: string;
  nextLevelXp: number;
  levelProgressPercentage: number;
  currentStreak: number;
  longestStreak: number;
  lastQualifyingDate: string | null;
  streakFreezesAvailable: number;
  streakFreezesUsed: number;
  preferredLeague: LeaderboardLeague;
  sevenDayActivity: StreakDayStatus[];
  activeQuestsCount: number;
  completedQuestsCount: number;
  achievementsCount: number;
}

export interface XpTransaction {
  id: string;
  userId: string;
  sourceType: 'daily_challenge' | 'correct_answer' | 'streak_milestone' | 'weekly_quest' | 'case_study' | 'peer_review';
  sourceId: string;
  xpAmount: number;
  idempotencyKey: string;
  description: string;
  createdAt: string;
}

export interface LevelThreshold {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
}

export const PM_LEVELS: LevelThreshold[] = [
  { level: 1, name: 'PM Rookie', minXp: 0, maxXp: 149 },
  { level: 2, name: 'Product Explorer', minXp: 150, maxXp: 349 },
  { level: 3, name: 'Product Practitioner', minXp: 350, maxXp: 699 },
  { level: 4, name: 'Product Strategist', minXp: 700, maxXp: 1199 },
  { level: 5, name: 'Growth Architect', minXp: 1200, maxXp: 1999 },
  { level: 6, name: 'Senior PM', minXp: 2000, maxXp: 3199 },
  { level: 7, name: 'Principal PM', minXp: 3200, maxXp: 4999 },
  { level: 8, name: 'Product Visionary', minXp: 5000, maxXp: Infinity },
];

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role?: string;
  company?: string;
  league: LeaderboardLeague;
  points: number; // weekly/monthly score
  totalXp: number;
  challengesCompleted: number;
  perfectScoresCount: number;
  currentStreak: number;
  rankDelta?: number; // e.g. +2, 0, -1
  isCurrentUser?: boolean;
}

export interface LeaderboardResponse {
  timeframe: LeaderboardTimeframe;
  league: LeaderboardLeague;
  resetDate: string;
  secondsUntilReset: number;
  topPodium: LeaderboardEntry[];
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
  totalParticipants: number;
}

export interface WeeklyQuest {
  id: string;
  title: string;
  description: string;
  questType: 'daily_count' | 'score_threshold' | 'intermediate_challenge' | 'case_study';
  targetCount: number;
  xpReward: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  userProgress?: {
    currentProgress: number;
    isCompleted: boolean;
    isClaimed: boolean;
    completedAt?: string;
    claimedAt?: string;
  };
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'challenge' | 'accuracy' | 'arena' | 'contribution';
  xpReward: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockCriteria?: Record<string, any>;
  active?: boolean;
  isEarned?: boolean;
  earnedAt?: string;
}

export interface ShareableResultCardData {
  title: string;
  date: string;
  score: number;
  correctCount: number;
  totalCount: number;
  streak: number;
  strongestSkill: string;
  feedbackSummary: string;
  userName: string;
  userLevel: string;
  shareUrl: string;
}
