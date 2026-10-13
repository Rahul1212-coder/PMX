import { NextResponse } from 'next/server';
import { analyzeResumeWithOpenAI, PROMPT_VERSION, RESUME_MODEL } from '@/lib/resume/openai';
import { calculateDeterministicScores } from '@/lib/resume/scoring';
import { ResumeAnalysisResult, ResumeAnalysisMode } from '@/types/resume';

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

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
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
