'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AssessmentLevelConfig,
  AssessmentLevelId,
  UserLevelProgress,
  AssessmentAttempt,
  PublicAssessmentQuestion,
} from '@/types/assessment';
import { ASSESSMENT_LEVEL_CONFIGS } from '@/data/threeLevelQuestions';
import { AssessmentDashboard } from './assessment/AssessmentDashboard';
import { AssessmentRunner } from './assessment/AssessmentRunner';
import { AssessmentResultsView } from './assessment/AssessmentResultsView';
import { AssessmentAdminView } from './assessment/AssessmentAdminView';
import { useAuth } from '@/context/AuthContext';
import { isAuthorizedAdmin } from '@/lib/admin';
import { Award, Sparkles } from 'lucide-react';

interface AssessmentQuizProps {
  setActiveTab?: (tab: any) => void;
}

type AssessmentScreen = 'dashboard' | 'running' | 'results';

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ setActiveTab }) => {
  const { user, profile, updateProfile, openAuthModal } = useAuth();

  // State
  const [screen, setScreen] = useState<AssessmentScreen>('dashboard');
  const [levels, setLevels] = useState<AssessmentLevelConfig[]>([
    ASSESSMENT_LEVEL_CONFIGS.beginner,
    ASSESSMENT_LEVEL_CONFIGS.intermediate,
    ASSESSMENT_LEVEL_CONFIGS.advanced,
  ]);
  const [progress, setProgress] = useState<Record<AssessmentLevelId, UserLevelProgress>>({
    beginner: { levelId: 'beginner', isUnlocked: true, attemptsCount: 0, status: 'not_started' },
    intermediate: { levelId: 'intermediate', isUnlocked: false, attemptsCount: 0, status: 'locked' },
    advanced: { levelId: 'advanced', isUnlocked: false, attemptsCount: 0, status: 'locked' },
  });
  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Test State
  const [activeLevelId, setActiveLevelId] = useState<AssessmentLevelId>('beginner');
  const [activeQuestions, setActiveQuestions] = useState<PublicAssessmentQuestion[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<AssessmentAttempt | null>(null);

  // Admin Modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const isAdmin = Boolean(user?.email && isAuthorizedAdmin(user.email));

  // Load Levels & Progress
  const loadLevelsAndProgress = useCallback(async () => {
    try {
      const userIdParam = user?.id ? `?userId=${user.id}` : '';
      const [levelsRes, historyRes] = await Promise.all([
        fetch(`/api/assessment/levels${userIdParam}`),
        fetch(`/api/assessment/history${userIdParam}`),
      ]);

      const levelsData = await levelsRes.json();
      const historyData = await historyRes.json();

      if (levelsData.success) {
        if (levelsData.levels) setLevels(levelsData.levels);
        if (levelsData.progress) setProgress(levelsData.progress);
      }
      if (historyData.success && Array.isArray(historyData.attempts)) {
        setHistory(historyData.attempts);
      }
    } catch (err) {
      console.warn('Error loading assessment status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadLevelsAndProgress();
  }, [loadLevelsAndProgress]);

  // Handler: Start a level
  const handleStartLevel = async (levelId: AssessmentLevelId) => {
    // If not authenticated, prompt sign-in
    if (!user) {
      if (openAuthModal) {
        openAuthModal('signin');
      }
      // Allow preview / guest attempt
    }

    try {
      const userIdParam = user?.id ? `&userId=${user.id}` : '';
      const res = await fetch(`/api/assessment/questions?levelId=${levelId}${userIdParam}`);
      const data = await res.json();

      if (data.isLocked) {
        alert(data.error || 'This level is locked. Complete the prerequisite level first.');
        return;
      }

      if (data.success && data.questions) {
        setActiveLevelId(levelId);
        setActiveQuestions(data.questions);
        setScreen('running');
      } else {
        alert(data.error || 'Failed to load assessment questions.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error loading questions.');
    }
  };

  // Handler: View Past Attempt
  const handleViewAttempt = async (attemptId: string) => {
    try {
      const res = await fetch(`/api/assessment/attempt/${attemptId}`);
      const data = await res.json();

      if (data.success && data.attempt) {
        setActiveAttempt(data.attempt);
        setActiveLevelId(data.attempt.levelId);
        setScreen('results');
      } else {
        alert(data.error || 'Attempt records not found.');
      }
    } catch (err: any) {
      alert(err.message || 'Error fetching attempt details.');
    }
  };

  // Handler: Test Completed
  const handleTestCompleted = (completedAttempt: AssessmentAttempt) => {
    setActiveAttempt(completedAttempt);
    setScreen('results');
    loadLevelsAndProgress();

    // Update user profile score if higher
    if (completedAttempt.scorePercentage && user && updateProfile) {
      updateProfile({ pmFitScore: completedAttempt.scorePercentage }).catch(() => {});
    }
  };

  // Handler: Retake
  const handleRetake = () => {
    handleStartLevel(activeLevelId);
  };

  // Handler: Next Level
  const handleGoToNextLevel = () => {
    if (activeLevelId === 'beginner') {
      handleStartLevel('intermediate');
    } else if (activeLevelId === 'intermediate') {
      handleStartLevel('advanced');
    }
  };

  const activeLevelConfig =
    levels.find((l) => l.id === activeLevelId) || ASSESSMENT_LEVEL_CONFIGS[activeLevelId];

  return (
    <div className="w-full">
      {/* View 1: Main Landing Dashboard */}
      {screen === 'dashboard' && (
        <AssessmentDashboard
          levels={levels}
          progress={progress}
          history={history}
          onStartLevel={handleStartLevel}
          onViewAttempt={handleViewAttempt}
          isAdmin={isAdmin}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />
      )}

      {/* View 2: Live Assessment Taking Mode */}
      {screen === 'running' && (
        <AssessmentRunner
          levelConfig={activeLevelConfig}
          questions={activeQuestions}
          userId={user?.id || 'guest'}
          onExit={() => {
            setScreen('dashboard');
            loadLevelsAndProgress();
          }}
          onCompleted={handleTestCompleted}
        />
      )}

      {/* View 3: Scored Results View */}
      {screen === 'results' && activeAttempt && (
        <AssessmentResultsView
          attempt={activeAttempt}
          levelConfig={activeLevelConfig}
          onRetake={handleRetake}
          onBackToDashboard={() => {
            setScreen('dashboard');
            loadLevelsAndProgress();
          }}
          onGoToNextLevel={handleGoToNextLevel}
        />
      )}

      {/* Admin Question Bank Modal */}
      {isAdminModalOpen && user?.email && (
        <AssessmentAdminView
          adminEmail={user.email}
          onClose={() => {
            setIsAdminModalOpen(false);
            loadLevelsAndProgress();
          }}
        />
      )}
    </div>
  );
};
