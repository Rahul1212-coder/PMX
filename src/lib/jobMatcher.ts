import { JobListing, UserProfile } from '@/types';

export interface MatchFactorBreakdown {
  name: string;
  weight: number;
  score: number;
  detail: string;
}

export interface JobMatchCalculation {
  overallScore: number;
  experienceScore: number;
  testScoreComp: number;
  stageScore: number;
  userYears: number;
  requiredYearsMin: number;
  requiredYearsMax: number;
  requiredYearsLabel: string;
  testScoreUser: number | null;
  testScoreBenchmark: number;
  hasTakenAssessment: boolean;
  factors: MatchFactorBreakdown[];
  highlights: string[];
  improvementAdvice: string;
}

// Map role levels to required experience range and diagnostic test score benchmarks
export function getRoleRequirements(level: string, title?: string): {
  minExp: number;
  maxExp: number;
  expLabel: string;
  testBenchmark: number;
} {
  const norm = ((level || '') + ' ' + (title || '')).toLowerCase();

  if (norm.includes('director') || norm.includes('vp') || norm.includes('head of')) {
    return { minExp: 10, maxExp: 18, expLabel: '10–15+ yrs', testBenchmark: 88 };
  }
  if (norm.includes('principal') || norm.includes('lead') || norm.includes('group pm')) {
    return { minExp: 8, maxExp: 12, expLabel: '8–12 yrs', testBenchmark: 85 };
  }
  if (norm.includes('senior') || norm.includes('sr.') || norm.includes('sr ')) {
    return { minExp: 5, maxExp: 8, expLabel: '5–8 yrs', testBenchmark: 80 };
  }
  if (norm.includes('associate') || norm.includes('junior') || norm.includes('apm') || norm.includes('intern')) {
    return { minExp: 0, maxExp: 2, expLabel: '0–2 yrs (Entry/APM)', testBenchmark: 55 };
  }

  // Default: Mid-level Product Manager
  return { minExp: 2, maxExp: 5, expLabel: '2–5 yrs', testBenchmark: 70 };
}

// Determine effective user experience in years
export function resolveUserExperienceYears(userProfile?: UserProfile | null): number {
  if (!userProfile) return 2; // sensible fallback default

  if (typeof userProfile.yearsOfExperience === 'number') {
    return Math.max(0, userProfile.yearsOfExperience);
  }

  // Infer based on pmStage and role
  if (userProfile.pmStage === 'fresher') return 0;
  if (userProfile.pmStage === 'switching_roles') return 2;

  const roleLower = (userProfile.role || '').toLowerCase();
  if (roleLower.includes('director') || roleLower.includes('vp')) return 12;
  if (roleLower.includes('principal') || roleLower.includes('lead')) return 9;
  if (roleLower.includes('senior') || roleLower.includes('sr.')) return 6;
  if (roleLower.includes('associate') || roleLower.includes('apm') || roleLower.includes('intern')) return 1;

  return 3;
}

/**
 * Calculates a verified Job Match % using experience and PM assessment score
 * Formula: 50% Experience Fit + 40% PM Assessment Diagnostic + 10% Career Stage Fit
 */
export function calculateJobMatch(
  job: JobListing,
  userProfile?: UserProfile | null,
  overrideTestScore?: number | null
): JobMatchCalculation {
  const userYears = resolveUserExperienceYears(userProfile);
  const req = getRoleRequirements(job.level, job.title);

  // 1. Experience Match Score (0 - 100)
  let experienceScore = 80;
  let expDetail = '';

  if (userYears >= req.minExp && userYears <= req.maxExp) {
    // Perfect experience window
    experienceScore = 95;
    expDetail = `Your ${userYears} yr${userYears === 1 ? '' : 's'} falls right within the target ${req.expLabel}.`;
  } else if (userYears < req.minExp) {
    const diff = req.minExp - userYears;
    if (diff === 1) {
      experienceScore = 80;
      expDetail = `Near fit: 1 yr below standard ${req.expLabel}, strong project evidence can bridge this.`;
    } else if (diff === 2) {
      experienceScore = 65;
      expDetail = `Growth role: ${diff} yrs below target ${req.expLabel}.`;
    } else {
      experienceScore = Math.max(30, 50 - diff * 8);
      expDetail = `Significant seniority gap: requires ${req.expLabel}.`;
    }
  } else {
    // User has more experience than maxExp (slight overqualification)
    const excess = userYears - req.maxExp;
    if (excess <= 2) {
      experienceScore = 88;
      expDetail = `Strong senior capability: ${userYears} yrs brings immediate operational readiness.`;
    } else {
      experienceScore = Math.max(70, 85 - excess * 4);
      expDetail = `Overqualified: ${userYears} yrs vs ${req.expLabel} scope.`;
    }
  }

  // 2. Test Score Alignment (0 - 100)
  const rawTestScore = overrideTestScore ?? userProfile?.pmFitScore ?? null;
  const hasTakenAssessment = rawTestScore !== null && rawTestScore !== undefined && rawTestScore > 0;

  let testScoreComp = 70;
  let testDetail = '';

  if (hasTakenAssessment) {
    const score = Number(rawTestScore);
    if (score >= req.testBenchmark) {
      const surplus = score - req.testBenchmark;
      testScoreComp = Math.min(99, Math.round(88 + surplus * 0.6));
      testDetail = `Verified diagnostic score of ${score}% surpasses the ${req.testBenchmark}% benchmark.`;
    } else {
      const deficit = req.testBenchmark - score;
      testScoreComp = Math.max(35, Math.round(80 - deficit * 1.5));
      testDetail = `Your verified score of ${score}% is below the ${req.testBenchmark}% benchmark for this role level.`;
    }
  } else {
    // Baseline estimation for unverified users
    const defaultEstimate = userProfile?.pmStage === 'fresher' ? 62 : userProfile?.pmStage === 'switching_roles' ? 68 : 75;
    const deficit = Math.max(0, req.testBenchmark - defaultEstimate);
    testScoreComp = Math.max(50, Math.round(75 - deficit * 0.8));
    testDetail = `Diagnostic unverified (estimated ~${defaultEstimate}%). Complete the PM test to unlock verified score.`;
  }

  // 3. Career Stage Alignment (0 - 100)
  let stageScore = 80;
  let stageDetail = '';
  const isApmOrEntry = req.minExp === 0;

  if (userProfile?.pmStage === 'fresher') {
    if (isApmOrEntry) {
      stageScore = 98;
      stageDetail = 'Designed specifically for early-career & APM candidates.';
    } else if (req.minExp <= 3) {
      stageScore = 70;
      stageDetail = 'Possible with demonstrator PM portfolio or case study submissions.';
    } else {
      stageScore = 35;
      stageDetail = 'Senior roles typically require prior full lifecycle track record.';
    }
  } else if (userProfile?.pmStage === 'switching_roles') {
    if (isApmOrEntry || req.minExp <= 4) {
      stageScore = 92;
      stageDetail = 'High transition suitability with transferable functional skillsets.';
    } else {
      stageScore = 60;
      stageDetail = 'Transition into senior product leadership usually requires lateral step first.';
    }
  } else {
    // Practicing PM
    if (isApmOrEntry && userYears > 2) {
      stageScore = 75;
      stageDetail = 'Entry-level scope for a practicing product manager.';
    } else {
      stageScore = 95;
      stageDetail = 'Direct alignment with professional Product Management trajectory.';
    }
  }

  // Overall Weighted Match: 50% Exp + 40% Test + 10% Stage
  const weighted = 0.50 * experienceScore + 0.40 * testScoreComp + 0.10 * stageScore;
  const overallScore = Math.min(99, Math.max(25, Math.round(weighted)));

  // Match Factors Breakdown
  const factors: MatchFactorBreakdown[] = [
    {
      name: 'Experience Fit',
      weight: 50,
      score: Math.round((experienceScore / 100) * 50),
      detail: expDetail,
    },
    {
      name: 'PM Test Score',
      weight: 40,
      score: Math.round((testScoreComp / 100) * 40),
      detail: testDetail,
    },
    {
      name: 'Career Stage Alignment',
      weight: 10,
      score: Math.round((stageScore / 100) * 10),
      detail: stageDetail,
    },
  ];

  // Highlights
  const highlights: string[] = [];
  if (experienceScore >= 85) {
    highlights.push(`✓ Excellent experience calibration (${userYears} yrs vs ${req.expLabel} required)`);
  } else if (experienceScore < 60) {
    highlights.push(`! Requires ${req.expLabel}; current profile has ${userYears} yrs`);
  }

  if (hasTakenAssessment && testScoreComp >= 85) {
    highlights.push(`✓ Assessment score (${rawTestScore}%) exceeds the ${req.testBenchmark}% role benchmark`);
  } else if (hasTakenAssessment && testScoreComp < 65) {
    highlights.push(`! Assessment score (${rawTestScore}%) is below the ${req.testBenchmark}% benchmark`);
  } else if (!hasTakenAssessment) {
    highlights.push(`ℹ PM Assessment diagnostic not yet taken (baseline applied)`);
  }

  if (stageScore >= 90) {
    highlights.push(`✓ High role alignment for your ${userProfile?.pmStage === 'fresher' ? 'Fresher' : userProfile?.pmStage === 'switching_roles' ? 'Career Switcher' : 'Practicing PM'} stage`);
  }

  // Improvement Advice
  let improvementAdvice = '';
  if (!hasTakenAssessment) {
    improvementAdvice = 'Take the 10-question PM Diagnostic Quiz to verify your score and sharpen your match accuracy.';
  } else if (testScoreComp < 75) {
    improvementAdvice = `Score gap of ${(req.testBenchmark - Number(rawTestScore)).toFixed(0)}% for this seniority. Practice case studies in AI Tutor to boost your score.`;
  } else if (experienceScore < 70) {
    improvementAdvice = 'Bridge the experience gap by highlighting shipped side projects and cross-functional leadership in your resume.';
  } else {
    improvementAdvice = 'Strong overall profile match! Tailor your application emphasizing role-specific tooling and metrics impact.';
  }

  return {
    overallScore,
    experienceScore,
    testScoreComp,
    stageScore,
    userYears,
    requiredYearsMin: req.minExp,
    requiredYearsMax: req.maxExp,
    requiredYearsLabel: req.expLabel,
    testScoreUser: rawTestScore ? Number(rawTestScore) : null,
    testScoreBenchmark: req.testBenchmark,
    hasTakenAssessment,
    factors,
    highlights,
    improvementAdvice,
  };
}
