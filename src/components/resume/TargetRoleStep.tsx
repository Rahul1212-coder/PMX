'use client';

import React, { useState } from 'react';
import { Briefcase, Building, Target, FileText, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { PREDEFINED_PM_ROLES, ResumeAnalysisMode } from '@/types/resume';

interface TargetRoleStepProps {
  onBack: () => void;
  onSubmit: (params: {
    targetRole: string;
    targetCompany?: string;
    jobDescription?: string;
    mode: ResumeAnalysisMode;
    experienceLevel?: string;
    preferredRegion?: string;
  }) => void;
  initialRole?: string;
  initialCompany?: string;
  initialJobDescription?: string;
  initialMode?: ResumeAnalysisMode;
  isLoading?: boolean;
}

export const TargetRoleStep: React.FC<TargetRoleStepProps> = ({
  onBack,
  onSubmit,
  initialRole = 'Product Manager',
  initialCompany = '',
  initialJobDescription = '',
  initialMode = 'job_match',
  isLoading = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [customRole, setCustomRole] = useState<string>('');
  const [company, setCompany] = useState<string>(initialCompany);
  const [mode, setMode] = useState<ResumeAnalysisMode>(initialMode);
  const [jobDescription, setJobDescription] = useState<string>(initialJobDescription);
  const [experienceLevel, setExperienceLevel] = useState<string>('3-5 years');
  const [region, setRegion] = useState<string>('Global / Remote');
  const [validationError, setValidationError] = useState<string | null>(null);

  const effectiveRole = selectedRole === 'Custom' ? customRole.trim() : selectedRole;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!effectiveRole) {
      setValidationError('Please select or specify a target Product Management role title.');
      return;
    }

    if (mode === 'job_match' && (!jobDescription.trim() || jobDescription.trim().length < 40)) {
      setValidationError(
        'Job-Specific Match mode requires a job description (at least 40 characters). Switch to "General Resume Review" if you do not have a specific job description.'
      );
      return;
    }

    onSubmit({
      targetRole: effectiveRole,
      targetCompany: company.trim() || undefined,
      jobDescription: mode === 'job_match' ? jobDescription.trim() : undefined,
      mode,
      experienceLevel,
      preferredRegion: region,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="text-[10px] font-black tracking-widest text-[#ef2b18] uppercase">
          Step 2 of 3: Target Role & Criteria
        </div>
        <h2 className="text-2xl font-black text-[#201e1d] m-0 tracking-tight">
          Select Target Role & Job Match
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Tailor the evaluation engine to your desired seniority level, role focus, and target company requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-[#201e1d] p-6 sm:p-7 rounded space-y-5 text-xs">
        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-bold text-[#201e1d] mb-2 uppercase tracking-wider">
            Choose Analysis Mode:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('job_match')}
              className={`p-3.5 border rounded text-left transition flex flex-col justify-between ${
                mode === 'job_match'
                  ? 'border-[#201e1d] bg-[#f3f2f2] ring-2 ring-[#ef2b18]/25'
                  : 'border-[rgba(32,30,29,0.15)] bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-black text-xs text-[#201e1d] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#ef2b18]" />
                  Job-Specific Match
                </span>
                <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                  Compares resume against a specific target Job Description. Reports requirement-level alignment.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#ef2b18] uppercase tracking-wider mt-2 block">
                Recommended for active applications
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('general_review')}
              className={`p-3.5 border rounded text-left transition flex flex-col justify-between ${
                mode === 'general_review'
                  ? 'border-[#201e1d] bg-[#f3f2f2] ring-2 ring-[#ef2b18]/25'
                  : 'border-[rgba(32,30,29,0.15)] bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-black text-xs text-[#201e1d] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#ef2b18]" />
                  General PM Review
                </span>
                <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                  Audits core PM competencies, impact metrics, bullet quality, and ATS readiness without a JD.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2 block">
                Best for baseline resume polish
              </span>
            </button>
          </div>
        </div>

        {/* Target PM Role */}
        <div>
          <label className="block text-xs font-bold text-[#201e1d] mb-1 uppercase tracking-wider">
            Target Product Management Role:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded text-xs bg-white text-[#201e1d] font-medium"
          >
            {PREDEFINED_PM_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="Custom">Custom PM Role Title...</option>
          </select>

          {selectedRole === 'Custom' && (
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Lead Core Infrastructure PM"
              className="mt-2 w-full p-2 border border-slate-300 rounded text-xs bg-white"
            />
          )}
        </div>

        {/* Optional Target Company & Seniority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#201e1d] mb-1 uppercase tracking-wider">
              Target Company (Optional):
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, Linear, Swiggy, Google"
              className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#201e1d] mb-1 uppercase tracking-wider">
              Target Experience Level:
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="0-2 years">0-2 years (APM / Early Career)</option>
              <option value="3-5 years">3-5 years (Mid-level PM)</option>
              <option value="6-9 years">6-9 years (Senior / Lead PM)</option>
              <option value="10+ years">10+ years (Principal / Director / VP)</option>
            </select>
          </div>
        </div>

        {/* Job Description (Shown if mode === 'job_match') */}
        {mode === 'job_match' && (
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#201e1d] flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-[#ef2b18]" />
                Job Description Text (Required for Match):
              </label>
              <span className="text-[11px] text-slate-500 italic">
                Paste requirements, qualifications & responsibilities
              </span>
            </div>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here. Include About the Role, Requirements, Preferred Qualifications, and Key Responsibilities..."
              className="w-full p-3 border border-slate-300 rounded text-xs text-[#201e1d] leading-relaxed outline-none"
            />
          </div>
        )}

        {validationError && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-300 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Resume Text
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary text-xs font-black py-2.5 px-6 flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Analyzing Resume with AI...' : 'Run AI Resume Audit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
