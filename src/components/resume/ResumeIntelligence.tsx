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
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { ResumeUsageInfo, MAX_RESUME_ANALYSES } from '@/lib/resume/usage-types';
import { getClientAccountUsage, recordClientAccountUsage } from '@/lib/resume/client-usage';

interface ResumeIntelligenceProps {
  initialJobContext?: {
    title: string;
    company: string;
    description: string;
  };
}

export const ResumeIntelligence: React.FC<ResumeIntelligenceProps> = ({ initialJobContext }) => {
  const { user, session, openAuthModal } = useAuth();

  // Usage quota state (max 2 evaluations per user account)
  const [usageInfo, setUsageInfo] = useState<ResumeUsageInfo>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('pmverse_user');
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        const uid = parsedUser?.id;
        const email = parsedUser?.email;
        const byId = uid ? parseInt(localStorage.getItem(`pmverse_resume_usage_${uid}`) || '0', 10) : 0;
        const byEmail = email ? parseInt(localStorage.getItem(`pmverse_resume_usage_${email}`) || '0', 10) : 0;
        const count = Math.min(MAX_RESUME_ANALYSES, Math.max(isNaN(byId) ? 0 : byId, isNaN(byEmail) ? 0 : byEmail));
        if (count > 0) {
          return {
            usageCount: count,
            remaining: Math.max(0, MAX_RESUME_ANALYSES - count),
            maxAllowed: MAX_RESUME_ANALYSES,
            hasReachedLimit: count >= MAX_RESUME_ANALYSES,
            history: [],
          };
        }
      } catch {}
    }
    return {
      usageCount: 0,
      remaining: MAX_RESUME_ANALYSES,
      maxAllowed: MAX_RESUME_ANALYSES,
      hasReachedLimit: false,
      history: [],
    };
  });
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

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

  // Sync account usage across Supabase Auth user_metadata, saved_jobs table, localStorage, and API
  const syncUsage = React.useCallback(async () => {
    if (!user?.id || user.id === 'guest') return;
    try {
      setIsLoadingUsage(true);

      // 1. Resolve client-side usage (instantaneous from user_metadata + saved_jobs + localStorage)
      const clientUsage = await getClientAccountUsage(user, session);
      setUsageInfo(clientUsage);

      // 2. Fetch server-verified usage to ensure server cache is warm and synced
      const query = new URLSearchParams({
        userId: user.id,
        ...(user.email ? { userEmail: user.email } : {}),
        clientUsageCount: clientUsage.usageCount.toString(),
      });
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/resume/analyze?${query.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const serverCount = typeof data.usageCount === 'number' ? data.usageCount : 0;
        const finalCount = Math.min(MAX_RESUME_ANALYSES, Math.max(clientUsage.usageCount, serverCount));
        setUsageInfo({
          usageCount: finalCount,
          remaining: Math.max(0, MAX_RESUME_ANALYSES - finalCount),
          maxAllowed: MAX_RESUME_ANALYSES,
          hasReachedLimit: finalCount >= MAX_RESUME_ANALYSES,
          history: data.history || clientUsage.history || [],
        });
      }
    } catch (err) {
      console.warn('Failed to sync resume usage:', err);
    } finally {
      setIsLoadingUsage(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (user?.id) {
      syncUsage();
    }
  }, [user?.id, user?.user_metadata?.resume_eval_count, user?.user_metadata?.resume_analyses_count, syncUsage]);

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

  // If user is not signed in, show members-only lock screen
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center space-y-6 animate-in fade-in duration-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ef2b18]/10 text-[#ef2b18] border border-[#ef2b18]/25 text-xs font-black uppercase tracking-wider rounded">
          <Shield className="w-3.5 h-3.5" />
          <span>PMVerse Members Only</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#201e1d] tracking-tight">
            Resume Intelligence & ATS Optimization
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            AI-powered, evidence-based resume evaluation for Product Management roles. Sign in to access your complimentary analyses.
          </p>
        </div>

        <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8 rounded space-y-6 text-left shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#201e1d] text-white flex items-center justify-center font-black rounded shrink-0">
              <Sparkles className="w-6 h-6 text-[#ef2b18]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#201e1d]">2 Free Analyses Per Account</h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded">
                  Member Benefit
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sign in or create a free account to unlock 2 full AI resume audits compared against real PM competencies, ATS keyword matrices, and job descriptions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#ef2b18] shrink-0" />
              <span>100-pt ATS Compatibility Rubric</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#ef2b18] shrink-0" />
              <span>Hard Skill & Keyword Gap Scans</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#ef2b18] shrink-0" />
              <span>Outcome-Focused Bullet Rewriting</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#ef2b18] shrink-0" />
              <span>Native ATS DOCX Export</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => openAuthModal('signin')}
              className="btn btn-primary w-full sm:w-auto flex-1 text-xs font-black py-3 px-6 justify-center shadow"
            >
              <span>Sign In to Continue</span>
              <span>→</span>
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn btn-secondary w-full sm:w-auto flex-1 text-xs font-bold py-3 px-6 justify-center"
            >
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    // Quota check before requesting analysis
    if (usageInfo.hasReachedLimit) {
      setErrorMessage(
        'You have reached your limit of 2 free AI resume evaluations. You can continue reviewing, editing, and exporting your existing resume.'
      );
      return;
    }

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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resumeText,
          targetRole: params.targetRole,
          targetCompany: params.targetCompany,
          jobDescription: params.jobDescription,
          mode: params.mode,
          detectedFormattingRisks: parsedDoc?.formattingRisks || [],
          resumeId: parsedDoc?.id,
          userId: user.id,
          userEmail: user.email,
          clientUsageCount: usageInfo.usageCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete resume analysis');
      }

      const result: ResumeAnalysisResult = data.analysis;
      setCurrentAnalysis(result);
      setOriginalAnalysis(result);

      // Record client account usage permanently in Supabase user_metadata, saved_jobs, and localStorage
      const updatedUsage = await recordClientAccountUsage(user, {
        targetRole: params.targetRole,
        score: result.overallScore,
        resumeId: parsedDoc?.id,
      });
      setUsageInfo(updatedUsage);

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
    if (usageInfo.hasReachedLimit) {
      setErrorMessage(
        'You have reached your limit of 2 free AI resume evaluations. You can continue editing bullets and exporting your ATS DOCX resume.'
      );
      return;
    }

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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resumeText: reconstructedText,
          targetRole,
          targetCompany,
          jobDescription,
          mode: analysisMode,
          detectedFormattingRisks: parsedDoc?.formattingRisks || [],
          resumeId: parsedDoc?.id,
          userId: user.id,
          userEmail: user.email,
          clientUsageCount: usageInfo.usageCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to re-score resume');
      }

      const updatedUsage = await recordClientAccountUsage(user, {
        targetRole,
        score: data.analysis?.overallScore,
        resumeId: parsedDoc?.id,
      });
      setUsageInfo(updatedUsage);

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
    if (usageInfo.hasReachedLimit) {
      setErrorMessage(
        'You have completed your 2 free AI resume evaluations for this account. You can continue reviewing, editing, and exporting your existing analyzed resume.'
      );
      return;
    }
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
      {/* Quota & Usage Status Bar */}
      <div className="bg-white border-2 border-[#201e1d] p-3 sm:p-4 rounded flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#ef2b18]" />
          <span className="font-bold text-[#201e1d]">AI Resume Evaluations:</span>
          <span
            className={`px-2.5 py-0.5 font-black uppercase text-[11px] rounded tracking-wide ${
              usageInfo.hasReachedLimit
                ? 'bg-red-100 text-red-700 border border-red-300'
                : usageInfo.remaining === 1
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {usageInfo.hasReachedLimit
              ? 'Limit Reached (2 of 2 Used)'
              : `${usageInfo.remaining} of 2 Remaining`}
          </span>
        </div>

        <div className="text-slate-500 text-[11px]">
          {usageInfo.hasReachedLimit ? (
            <span className="text-red-700 font-semibold">
              Maximum 2 free analyses used. You can continue editing and exporting your existing ATS resume.
            </span>
          ) : (
            <span>Each registered account receives 2 complimentary AI evaluations.</span>
          )}
        </div>
      </div>

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
          hasReachedLimit={usageInfo.hasReachedLimit}
          onViewExistingAnalysis={currentAnalysis ? () => setStep(3) : undefined}
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
          hasReachedLimit={usageInfo.hasReachedLimit}
          remainingCount={usageInfo.remaining}
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
          hasReachedLimit={usageInfo.hasReachedLimit}
          remainingCount={usageInfo.remaining}
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
