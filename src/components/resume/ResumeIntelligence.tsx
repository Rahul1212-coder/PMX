'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ResumeUploadStep } from './ResumeUploadStep';
import { TargetRoleStep } from './TargetRoleStep';
import { ResultsDashboard } from './ResultsDashboard';
import { BulletRewriterModal } from './BulletRewriterModal';
import { ResumeExportModal } from './ResumeExportModal';
import { VersionComparisonModal } from './VersionComparisonModal';
import {
  ParsedResumeDocument,
  ResumeAnalysisResult,
  ResumeAnalysisMode,
  StructuredResumeData,
  ResumeVersion,
} from '@/types/resume';
import {
  Sparkles,
  RefreshCw,
  FileText,
  TrendingUp,
  History,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface ResumeIntelligenceProps {
  initialJobContext?: {
    title: string;
    company: string;
    description: string;
  };
}

export const ResumeIntelligence: React.FC<ResumeIntelligenceProps> = ({ initialJobContext }) => {
  const { user } = useAuth();

  // Wizard state: 1 = Upload, 2 = Target Role & JD, 3 = Results & Editor
  const [step, setStep] = useState<number>(1);
  const [parsedDoc, setParsedDoc] = useState<ParsedResumeDocument | null>(null);
  const [resumeText, setResumeText] = useState<string>('');

  // Target role state
  const [targetRole, setTargetRole] = useState<string>(initialJobContext?.title || 'Product Manager');
  const [targetCompany, setTargetCompany] = useState<string>(initialJobContext?.company || '');
  const [jobDescription, setJobDescription] = useState<string>(initialJobContext?.description || '');
  const [analysisMode, setAnalysisMode] = useState<ResumeAnalysisMode>(
    initialJobContext?.description ? 'job_match' : 'general_review'
  );

  // Analysis results & version history
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [originalAnalysis, setOriginalAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [appliedCount, setAppliedCount] = useState<number>(0);

  // Modals state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isRewriterOpen, setIsRewriterOpen] = useState<boolean>(false);
  const [activeBulletToRewrite, setActiveBulletToRewrite] = useState<string>('');
  const [activeExpId, setActiveExpId] = useState<string | undefined>();
  const [activeBulletIndex, setActiveBulletIndex] = useState<number | undefined>();

  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Load saved analysis from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('pmverse_latest_resume_analysis');
        if (raw) {
          const parsed: ResumeAnalysisResult = JSON.parse(raw);
          if (parsed && parsed.overallScore) {
            setCurrentAnalysis(parsed);
            setOriginalAnalysis(parsed);
            setResumeText(parsed.structuredResume?.summary || '');
            setStep(3);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Step 1: Document parsed
  const handleDocumentParsed = (doc: ParsedResumeDocument, rawText: string) => {
    setParsedDoc(doc);
    setResumeText(rawText);
    setStep(2);
  };

  // Step 2: Trigger full analysis
  const handleRunAnalysis = async (params: {
    targetRole: string;
    targetCompany?: string;
    jobDescription?: string;
    mode: ResumeAnalysisMode;
    experienceLevel?: string;
    preferredRegion?: string;
  }) => {
    setTargetRole(params.targetRole);
    setTargetCompany(params.targetCompany || '');
    setJobDescription(params.jobDescription || '');
    setAnalysisMode(params.mode);

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStage('Extracting structured PM competencies & experience...');

    const stageTimer1 = setTimeout(() => {
      setAnalysisStage('Evaluating against target Product Management qualifications...');
    }, 1800);

    const stageTimer2 = setTimeout(() => {
      setAnalysisStage('Calculating deterministic ATS compatibility score & rubric...');
    }, 3600);

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole: params.targetRole,
          targetCompany: params.targetCompany,
          jobDescription: params.jobDescription,
          mode: params.mode,
          detectedFormattingRisks: parsedDoc?.formattingRisks || [],
          resumeId: parsedDoc?.id,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete resume analysis');
      }

      const result: ResumeAnalysisResult = data.analysis;
      setCurrentAnalysis(result);
      setOriginalAnalysis(result);

      // Save initial version
      const initialVer: ResumeVersion = {
        id: `v-1-${Date.now()}`,
        analysisId: result.id,
        versionNumber: 1,
        label: 'Version 1 (Initial Import)',
        structuredResume: result.structuredResume,
        overallScore: result.overallScore,
        appliedSuggestionIds: [],
        createdAt: new Date().toISOString(),
      };
      setVersions([initialVer]);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmverse_latest_resume_analysis', JSON.stringify(result));
      }

      setStep(3);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred during resume analysis.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsAnalyzing(false);
    }
  };

  // Re-analyze updated structured resume
  const handleReanalyze = async (updatedResume: StructuredResumeData) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStage('Re-scoring updated resume content and verifying bullet improvements...');

    // Reconstruct full text from updated structured resume
    let reconstructedText = `${updatedResume.contact?.name || ''}\n${updatedResume.summary || ''}\n`;
    if (updatedResume.experience) {
      for (const exp of updatedResume.experience) {
        reconstructedText += `\n${exp.role} at ${exp.company}\n`;
        for (const b of exp.bullets) {
          reconstructedText += `• ${b}\n`;
        }
      }
    }
    if (updatedResume.skills) {
      reconstructedText += `\nSkills: ${[
        ...(updatedResume.skills.productSkills || []),
        ...(updatedResume.skills.technicalSkills || []),
        ...(updatedResume.skills.tools || []),
      ].join(', ')}\n`;
    }

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: reconstructedText,
          targetRole,
          targetCompany,
          jobDescription,
          mode: analysisMode,
          detectedFormattingRisks: parsedDoc?.formattingRisks || [],
          resumeId: parsedDoc?.id,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to re-score resume');
      }

      const newAnalysis: ResumeAnalysisResult = data.analysis;
      newAnalysis.structuredResume = updatedResume; // Ensure latest client edits are preserved

      // Append new version
      const nextVerNumber = versions.length + 1;
      const scoreDelta = originalAnalysis
        ? newAnalysis.overallScore - originalAnalysis.overallScore
        : 0;

      const nextVer: ResumeVersion = {
        id: `v-${nextVerNumber}-${Date.now()}`,
        analysisId: newAnalysis.id,
        versionNumber: nextVerNumber,
        label: `Version ${nextVerNumber} (Optimized)`,
        structuredResume: updatedResume,
        overallScore: newAnalysis.overallScore,
        scoreDelta,
        appliedSuggestionIds: [],
        createdAt: new Date().toISOString(),
      };

      setVersions((prev) => [...prev, nextVer]);
      setCurrentAnalysis(newAnalysis);
      setAppliedCount((prev) => prev + 1);

      if (typeof window !== 'undefined') {
        localStorage.setItem('pmverse_latest_resume_analysis', JSON.stringify(newAnalysis));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while re-evaluating resume.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Open interactive bullet rewriter
  const handleOpenRewriter = (bulletText: string, expId?: string, bulletIndex?: number) => {
    setActiveBulletToRewrite(bulletText);
    setActiveExpId(expId);
    setActiveBulletIndex(bulletIndex);
    setIsRewriterOpen(true);
  };

  // Apply rewritten bullet
  const handleApplyRewrittenBullet = (newBulletText: string) => {
    if (!currentAnalysis) return;

    const updated = JSON.parse(JSON.stringify(currentAnalysis.structuredResume)) as StructuredResumeData;

    if (activeExpId && typeof activeBulletIndex === 'number') {
      const exp = updated.experience.find((e) => e.id === activeExpId);
      if (exp && exp.bullets) {
        exp.bullets[activeBulletIndex] = newBulletText;
      }
    } else if (updated.experience?.[0]?.bullets) {
      // Find matching bullet
      let replaced = false;
      for (const exp of updated.experience) {
        const idx = exp.bullets.findIndex((b) => b === activeBulletToRewrite);
        if (idx !== -1) {
          exp.bullets[idx] = newBulletText;
          replaced = true;
          break;
        }
      }
      if (!replaced) {
        updated.experience[0].bullets[0] = newBulletText;
      }
    }

    setCurrentAnalysis({
      ...currentAnalysis,
      structuredResume: updated,
    });
    setAppliedCount((prev) => prev + 1);
  };

  const handleStartNewAnalysis = () => {
    setParsedDoc(null);
    setResumeText('');
    setCurrentAnalysis(null);
    setOriginalAnalysis(null);
    setVersions([]);
    setAppliedCount(0);
    setStep(1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmverse_latest_resume_analysis');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Platform Header Banner */}
      <div className="bg-white border-2 border-[#201e1d] p-5 sm:p-6 shadow-sm rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#ef2b18] bg-[#ef2b18]/10 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" /> PMVerse Intelligence Platform
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#201e1d] m-0 tracking-tight">
            Resume Intelligence & ATS Optimization
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            AI-powered, evidence-based resume evaluation for Product Management roles. Deterministic scoring, job description alignment, and bullet-level optimization.
          </p>
        </div>

        {step === 3 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleStartNewAnalysis}
              className="btn btn-secondary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="btn btn-primary text-xs font-black py-2 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export ATS Resume</span>
            </button>
          </div>
        )}
      </div>

      {/* Analyzing Overlay Indicator */}
      {isAnalyzing && (
        <div className="bg-white border-2 border-[#201e1d] p-8 sm:p-10 shadow-lg rounded text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-[#ef2b18]/10 text-[#ef2b18] mx-auto flex items-center justify-center">
            <RefreshCw className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#201e1d] m-0">
              Running Deterministic Resume Analysis
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
              {analysisStage}
            </p>
          </div>
          <div className="w-48 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#ef2b18] animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-900 border border-red-300 rounded text-xs flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Upload */}
      {!isAnalyzing && step === 1 && (
        <ResumeUploadStep
          onParsedDocument={handleDocumentParsed}
          initialDoc={parsedDoc}
          initialRawText={resumeText}
        />
      )}

      {/* STEP 2: Target Role & Criteria */}
      {!isAnalyzing && step === 2 && (
        <TargetRoleStep
          onBack={() => setStep(1)}
          onSubmit={handleRunAnalysis}
          initialRole={targetRole}
          initialCompany={targetCompany}
          initialJobDescription={jobDescription}
          initialMode={analysisMode}
          isLoading={isAnalyzing}
        />
      )}

      {/* STEP 3: Results Dashboard */}
      {!isAnalyzing && step === 3 && currentAnalysis && (
        <ResultsDashboard
          analysis={currentAnalysis}
          onOpenRewriter={handleOpenRewriter}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenCompare={() => setIsCompareOpen(true)}
          onReanalyze={handleReanalyze}
          hasPreviousVersion={versions.length > 1}
        />
      )}

      {/* MODAL: Bullet Rewriter */}
      {isRewriterOpen && (
        <BulletRewriterModal
          isOpen={isRewriterOpen}
          onClose={() => setIsRewriterOpen(false)}
          originalBullet={activeBulletToRewrite}
          targetRole={targetRole}
          targetJobContext={jobDescription}
          onApplyBullet={handleApplyRewrittenBullet}
        />
      )}

      {/* MODAL: Export ATS Document */}
      {isExportOpen && currentAnalysis && (
        <ResumeExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          structuredResume={currentAnalysis.structuredResume}
          targetRole={targetRole}
        />
      )}

      {/* MODAL: Version Comparison Delta */}
      {isCompareOpen && originalAnalysis && currentAnalysis && (
        <VersionComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          originalAnalysis={originalAnalysis}
          currentAnalysis={currentAnalysis}
          appliedSuggestionsCount={appliedCount}
        />
      )}
    </div>
  );
};
