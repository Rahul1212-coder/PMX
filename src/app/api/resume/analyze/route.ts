import { NextResponse } from 'next/server';
import { analyzeResumeWithOpenAI, PROMPT_VERSION, RESUME_MODEL } from '@/lib/resume/openai';
import { calculateDeterministicScores } from '@/lib/resume/scoring';
import { ResumeAnalysisResult, ResumeAnalysisMode } from '@/types/resume';
import { getUserResumeUsage, recordResumeUsage, MAX_RESUME_ANALYSES } from '@/lib/resume/usage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'guest') {
      return NextResponse.json({
        usageCount: 0,
        remaining: 0,
        maxAllowed: MAX_RESUME_ANALYSES,
        hasReachedLimit: true,
        authenticated: false,
      });
    }

    const usage = await getUserResumeUsage(userId);
    return NextResponse.json({
      ...usage,
      authenticated: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch resume usage' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      resumeText,
      targetRole = 'Product Manager',
      targetCompany,
      jobDescription,
      mode = 'job_match',
      detectedFormattingRisks = [],
      resumeId,
      userId,
    } = body;

    // 1. Enforce that only signed in users can use Resume AI
    if (!userId || typeof userId !== 'string' || userId.trim() === '' || userId === 'guest') {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to PMVerse to use Resume AI.' },
        { status: 401 }
      );
    }

    // 2. Enforce 2-evaluations maximum usage limit per user
    const currentUsage = await getUserResumeUsage(userId);
    if (currentUsage.hasReachedLimit) {
      return NextResponse.json(
        {
          error: `You have reached the limit of ${MAX_RESUME_ANALYSES} free AI resume evaluations for this account.`,
          code: 'QUOTA_EXCEEDED',
          usageCount: currentUsage.usageCount,
          remaining: 0,
          maxAllowed: MAX_RESUME_ANALYSES,
        },
        { status: 403 }
      );
    }

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or empty. Please ensure valid resume text is extracted.' },
        { status: 400 }
      );
    }

    const analysisMode: ResumeAnalysisMode =
      mode === 'job_match' && jobDescription && jobDescription.trim().length > 30
        ? 'job_match'
        : 'general_review';

    // 1. Run semantic analysis and extraction with OpenAI
    const semanticOutput = await analyzeResumeWithOpenAI({
      resumeText,
      targetRole,
      targetCompany,
      jobDescription,
      mode: analysisMode,
      detectedFormattingRisks,
    });

    // 2. Deterministically calculate scores based on versioned rubric
    const scoringResult = calculateDeterministicScores({
      mode: analysisMode,
      rawCategoryScores: semanticOutput.rawCategoryScores,
      requirements: semanticOutput.requirementMatches,
      competencies: semanticOutput.pmCompetencies,
      atsChecks: semanticOutput.atsChecks,
    });

    // 3. Assemble complete verified result
    const analysisResult: ResumeAnalysisResult = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      resumeId: resumeId || `res-${Date.now()}`,
      userId,
      mode: analysisMode,
      targetRole,
      targetCompany,
      jobDescription: isJobSpecific(analysisMode, jobDescription) ? jobDescription : undefined,
      overallScore: scoringResult.overallScore,
      scoreTier: scoringResult.scoreTier,
      categoryScores: scoringResult.categoryScores,
      requirementMatches: semanticOutput.requirementMatches,
      pmCompetencies: semanticOutput.pmCompetencies,
      atsChecks: semanticOutput.atsChecks,
      suggestions: semanticOutput.suggestions,
      topStrengths: semanticOutput.topStrengths,
      topImprovements: semanticOutput.topImprovements,
      scoreExplanation: scoringResult.scoreExplanation,
      rubricVersion: scoringResult.rubricVersion,
      promptVersion: PROMPT_VERSION,
      modelUsed: RESUME_MODEL,
      createdAt: new Date().toISOString(),
      structuredResume: semanticOutput.structuredResume,
    };

    // 4. Record usage count for this user
    const updatedUsage = await recordResumeUsage(userId, {
      resumeId: analysisResult.resumeId,
      targetRole,
      score: scoringResult.overallScore,
    });

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      usage: updatedUsage,
    });
  } catch (error: any) {
    console.error('API analyze error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete resume analysis.' },
      { status: 500 }
    );
  }
}

function isJobSpecific(mode: ResumeAnalysisMode, jd?: string): boolean {
  return mode === 'job_match' && Boolean(jd && jd.trim().length > 30);
}
