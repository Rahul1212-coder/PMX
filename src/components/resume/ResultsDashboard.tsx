'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Download,
  RefreshCw,
  Edit3,
  Layers,
  ChevronRight,
  TrendingUp,
  Briefcase,
  FileText,
  Search,
  Filter,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ResumeAnalysisResult,
  JobDescriptionRequirement,
  RequirementMatchStatus,
  ResumeSuggestion,
  StructuredResumeData,
  WorkExperienceItem,
} from '@/types/resume';

interface ResultsDashboardProps {
  analysis: ResumeAnalysisResult;
  onOpenRewriter: (bulletText: string, expId?: string, bulletIndex?: number) => void;
  onOpenExport: () => void;
  onOpenCompare?: () => void;
  onReanalyze: (updatedResume: StructuredResumeData) => void;
  hasPreviousVersion?: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  analysis,
  onOpenRewriter,
  onOpenExport,
  onOpenCompare,
  onReanalyze,
  hasPreviousVersion = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'requirements' | 'competencies' | 'ats' | 'suggestions' | 'editor'
  >('overview');

  const [reqFilter, setReqFilter] = useState<'all' | RequirementMatchStatus>('all');
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'critical' | 'high_impact' | 'optional_polish'>('all');

  // Local editable resume copy
  const [editableResume, setEditableResume] = useState<StructuredResumeData>(analysis.structuredResume);
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<string[]>([]);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  // Apply a specific suggestion directly into the resume text
  const handleApplySuggestion = (sug: ResumeSuggestion) => {
    if (!sug.recommendedRevision) return;

    const newResume = JSON.parse(JSON.stringify(editableResume)) as StructuredResumeData;

    // Check if original content matches any bullet in experience
    let replaced = false;
    if (newResume.experience) {
      for (const exp of newResume.experience) {
        if (exp.bullets) {
          for (let i = 0; i < exp.bullets.length; i++) {
            if (
              sug.originalContent &&
              exp.bullets[i].toLowerCase().includes(sug.originalContent.slice(0, 30).toLowerCase())
            ) {
              exp.bullets[i] = sug.recommendedRevision;
              replaced = true;
              break;
            }
          }
        }
        if (replaced) break;
      }
    }

    // If not matched to a specific bullet, append to first experience
    if (!replaced && newResume.experience?.[0]?.bullets) {
      newResume.experience[0].bullets.push(sug.recommendedRevision);
    }

    setEditableResume(newResume);
    setAppliedSuggestionIds((prev) => [...prev, sug.id]);
    setHasUnsavedEdits(true);
  };

  const handleUpdateBullet = (expIndex: number, bulletIndex: number, val: string) => {
    const updated = JSON.parse(JSON.stringify(editableResume)) as StructuredResumeData;
    if (updated.experience[expIndex]?.bullets) {
      updated.experience[expIndex].bullets[bulletIndex] = val;
      setEditableResume(updated);
      setHasUnsavedEdits(true);
    }
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = JSON.parse(JSON.stringify(editableResume)) as StructuredResumeData;
    if (updated.experience[expIndex]?.bullets) {
      updated.experience[expIndex].bullets.push('Led cross-functional product squad to deliver key features.');
      setEditableResume(updated);
      setHasUnsavedEdits(true);
    }
  };

  const handleDeleteBullet = (expIndex: number, bulletIndex: number) => {
    const updated = JSON.parse(JSON.stringify(editableResume)) as StructuredResumeData;
    if (updated.experience[expIndex]?.bullets) {
      updated.experience[expIndex].bullets.splice(bulletIndex, 1);
      setEditableResume(updated);
      setHasUnsavedEdits(true);
    }
  };

  const filteredRequirements = analysis.requirementMatches.filter((req) => {
    if (reqFilter === 'all') return true;
    return req.matchStatus === reqFilter;
  });

  const filteredSuggestions = analysis.suggestions.filter((sug) => {
    if (suggestionFilter === 'all') return true;
    return sug.priority === suggestionFilter;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Top Candidate':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'Strong Fit':
        return 'bg-blue-600 text-white border-blue-700';
      case 'Moderate Fit':
        return 'bg-amber-500 text-slate-950 border-amber-600';
      default:
        return 'bg-[#ef2b18] text-white border-[#ae1800]';
    }
  };

  const getMatchStatusBadge = (status: RequirementMatchStatus) => {
    switch (status) {
      case 'Demonstrated':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Demonstrated
          </span>
        );
      case 'Partially Demonstrated':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3" /> Partial Evidence
          </span>
        );
      case 'Not Evidenced':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3" /> Not Evidenced
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
            <HelpCircle className="w-3 h-3" /> Uncertain Match
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. TOP SCORE HERO CARD */}
      <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-7 shadow-sm rounded relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Score Gauge & Tier */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative shrink-0 flex items-center justify-center">
              {/* Radial Score Gauge Badge */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#201e1d] bg-[#f3f2f2] flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl sm:text-4xl font-black text-[#201e1d] leading-none">
                  {analysis.overallScore}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${getTierColor(analysis.scoreTier)}`}>
                  {analysis.scoreTier}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {analysis.mode === 'job_match' ? 'Job-Specific Match' : 'General PM Audit'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#201e1d] m-0 tracking-tight">
                {analysis.targetRole}
                {analysis.targetCompany ? ` @ ${analysis.targetCompany}` : ''}
              </h2>

              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                {analysis.scoreExplanation}
              </p>
            </div>
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={onOpenExport}
              className="btn btn-primary text-xs font-black py-2.5 px-4 flex items-center justify-center gap-2 shadow-sm flex-1 lg:flex-initial"
            >
              <Download className="w-4 h-4" />
              <span>Export ATS Resume</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className="btn btn-secondary text-xs font-bold py-2 px-3.5 flex items-center justify-center gap-1.5 flex-1 lg:flex-initial"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#ef2b18]" />
              <span>Open Resume Editor</span>
            </button>

            {hasPreviousVersion && onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="btn btn-ghost text-xs font-bold py-1.5 px-3 flex items-center justify-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex-1 lg:flex-initial"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>View V1 vs Current Delta</span>
              </button>
            )}
          </div>
        </div>

        {/* Strengths & Improvements Chips */}
        <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Top Evidenced Strengths
            </span>
            <ul className="space-y-1 text-slate-800 text-[11px]">
              {analysis.topStrengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-3 rounded">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Key Improvement Opportunities
            </span>
            <ul className="space-y-1 text-slate-800 text-[11px]">
              {analysis.topImprovements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-700 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b-2 border-[#201e1d] overflow-x-auto pb-[-2px] text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-3.5 rounded-t transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#201e1d] text-white'
              : 'bg-white hover:bg-slate-100 text-[#201e1d] border border-b-0 border-[rgba(32,30,29,0.15)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Category Breakdown</span>
        </button>

        {analysis.requirementMatches.length > 0 && (
          <button
            onClick={() => setActiveTab('requirements')}
            className={`py-2 px-3.5 rounded-t transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'bg-[#201e1d] text-white'
                : 'bg-white hover:bg-slate-100 text-[#201e1d] border border-b-0 border-[rgba(32,30,29,0.15)]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Requirements ({analysis.requirementMatches.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('competencies')}
          className={`py-2 px-3.5 rounded-t transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'competencies'
              ? 'bg-[#201e1d] text-white'
              : 'bg-white hover:bg-slate-100 text-[#201e1d] border border-b-0 border-[rgba(32,30,29,0.15)]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>PM Competencies</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`py-2 px-3.5 rounded-t transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ats'
              ? 'bg-[#201e1d] text-white'
              : 'bg-white hover:bg-slate-100 text-[#201e1d] border border-b-0 border-[rgba(32,30,29,0.15)]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>ATS Readiness ({analysis.atsChecks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`py-2 px-3.5 rounded-t transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'suggestions'
              ? 'bg-[#201e1d] text-white'
              : 'bg-white hover:bg-slate-100 text-[#201e1d] border border-b-0 border-[rgba(32,30,29,0.15)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ef2b18]" />
          <span>Improvement Plan ({analysis.suggestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`py-2 px-3.5 rounded-t transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'editor'
              ? 'bg-[#201e1d] text-white'
              : 'bg-white hover:bg-slate-100 text-[#201e1d] border border-b-0 border-[rgba(32,30,29,0.15)]'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Resume Editor {hasUnsavedEdits && <span className="w-2 h-2 rounded-full bg-[#ef2b18]" />}</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB: CATEGORY BREAKDOWN */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5">
            {analysis.categoryScores.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-[rgba(32,30,29,0.15)] p-4 sm:p-5 rounded hover:border-[#201e1d] transition text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-black text-[#201e1d] m-0">{cat.name}</h3>
                    <span className="text-[11px] text-slate-500">
                      Configured Rubric Weight: {cat.weight}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#201e1d]">
                      {cat.score} <span className="text-xs font-medium text-slate-400">/ 100</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 block">
                      +{cat.earnedPoints} pts earned
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cat.score >= 80 ? 'bg-emerald-600' : cat.score >= 65 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-2">{cat.explanation}</p>

                {cat.supportingEvidence?.length > 0 && (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                    <span className="font-bold text-slate-600 block mb-1">Supporting Quotes from Resume:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700 italic">
                      {cat.supportingEvidence.map((ev, evIdx) => (
                        <li key={evIdx}>"{ev}"</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: JOB REQUIREMENTS MATCH */}
      {activeTab === 'requirements' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 border border-[rgba(32,30,29,0.15)] rounded text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by Status:
            </span>
            {(['all', 'Demonstrated', 'Partially Demonstrated', 'Not Evidenced', 'Uncertain'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setReqFilter(s)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  reqFilter === s
                    ? 'bg-[#201e1d] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? `All (${analysis.requirementMatches.length})` : s}
              </button>
            ))}
          </div>

          {/* Requirement Cards */}
          <div className="space-y-3">
            {filteredRequirements.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-[rgba(32,30,29,0.15)] p-4 sm:p-5 rounded space-y-2.5 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getMatchStatusBadge(req.matchStatus)}
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {req.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        req.type === 'required' ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {req.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Priority: {req.importance}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-black text-[#201e1d] m-0">
                  {req.requirementText}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {req.explanation}
                </p>

                {req.supportingEvidence && (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Matched Evidence in Candidate Resume:
                    </span>
                    <p className="italic text-slate-800 font-medium">"{req.supportingEvidence}"</p>
                  </div>
                )}

                <div className="bg-amber-50/60 p-2.5 rounded border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ef2b18] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Recommended Action: </span>
                    <span>{req.recommendedAction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PM COMPETENCIES */}
      {activeTab === 'competencies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {analysis.pmCompetencies.map((comp, idx) => (
              <div
                key={idx}
                className="bg-white border border-[rgba(32,30,29,0.15)] p-4 rounded text-left space-y-2 hover:border-[#201e1d] transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#201e1d] m-0">{comp.competency}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      comp.evidenceStrength === 'Strong'
                        ? 'bg-emerald-100 text-emerald-800'
                        : comp.evidenceStrength === 'Moderate'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {comp.evidenceStrength} Evidence
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef2b18] transition-all"
                    style={{ width: `${comp.score}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-800">Demonstrated:</strong> {comp.supportingEvidence}
                  </p>
                  {comp.missingOrUnclear && (
                    <p className="text-amber-900">
                      <strong className="text-amber-950">Gaps / Unclear:</strong> {comp.missingOrUnclear}
                    </p>
                  )}
                  <p className="text-slate-700 italic">
                    <strong className="text-slate-900 not-italic">Improvement:</strong> {comp.recommendedImprovement}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ATS READINESS CHECKS */}
      {activeTab === 'ats' && (
        <div className="space-y-3">
          {analysis.atsChecks.map((chk) => (
            <div
              key={chk.id}
              className="bg-white border border-[rgba(32,30,29,0.15)] p-4 rounded flex items-start gap-3.5 text-left"
            >
              {chk.status === 'pass' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : chk.status === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-[#201e1d] m-0">{chk.title}</h4>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded ${
                      chk.status === 'pass'
                        ? 'bg-emerald-50 text-emerald-800'
                        : chk.status === 'warning'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {chk.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{chk.description}</p>
                {chk.recommendation && (
                  <p className="text-[11px] text-[#ef2b18] font-bold">
                    Action: {chk.recommendation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: IMPROVEMENT PLAN */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 border border-[rgba(32,30,29,0.15)] rounded text-xs">
            <span className="font-bold text-slate-700">Filter Priority:</span>
            {(['all', 'critical', 'high_impact', 'optional_polish'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSuggestionFilter(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  suggestionFilter === p
                    ? 'bg-[#201e1d] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p === 'all'
                  ? `All (${analysis.suggestions.length})`
                  : p === 'critical'
                  ? 'Critical'
                  : p === 'high_impact'
                  ? 'High Impact'
                  : 'Polish'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredSuggestions.map((sug) => {
              const isApplied = appliedSuggestionIds.includes(sug.id);

              return (
                <div
                  key={sug.id}
                  className={`bg-white border rounded p-4 sm:p-5 text-left space-y-3 transition ${
                    isApplied ? 'border-emerald-500 bg-emerald-50/20' : 'border-[rgba(32,30,29,0.15)]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          sug.priority === 'critical'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : sug.priority === 'high_impact'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {sug.priority.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">Section: {sug.section}</span>
                    </div>

                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">
                        <Check className="w-3.5 h-3.5" /> Applied to Draft
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {sug.originalContent && (
                          <button
                            type="button"
                            onClick={() => onOpenRewriter(sug.originalContent || '')}
                            className="btn btn-ghost text-xs font-bold py-1 px-2.5 text-[#ef2b18]"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Rewrite
                          </button>
                        )}
                        {sug.recommendedRevision && (
                          <button
                            type="button"
                            onClick={() => handleApplySuggestion(sug)}
                            className="btn btn-primary text-xs font-black py-1 px-3"
                          >
                            Apply Revision
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#201e1d] m-0">{sug.issue}</h4>
                    <p className="text-xs text-slate-600 mt-1">{sug.whyItMatters}</p>
                  </div>

                  {sug.originalContent && sug.recommendedRevision && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Current Text:
                        </span>
                        <p className="text-slate-700 italic">"{sug.originalContent}"</p>
                      </div>
                      <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-300">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                          Recommended PM Revision:
                        </span>
                        <p className="text-emerald-950 font-medium">"{sug.recommendedRevision}"</p>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 italic">
                    <strong>Expected Benefit:</strong> {sug.expectedBenefit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: INTERACTIVE RESUME EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="bg-white p-4 border border-[rgba(32,30,29,0.15)] rounded flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-black text-sm text-[#201e1d] block">
                Interactive Resume Content Editor
              </span>
              <span className="text-slate-500 text-[11px]">
                Fine-tune bullets, click AI Rewrite on any bullet, and re-run your score.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onReanalyze(editableResume)}
                className="btn btn-primary text-xs font-black py-2 px-4 flex items-center gap-1.5 shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Analyze & Update Score</span>
              </button>
            </div>
          </div>

          {/* Experience Bullets Editor */}
          <div className="space-y-4">
            {editableResume.experience?.map((exp, expIdx) => (
              <div
                key={exp.id || expIdx}
                className="bg-white p-5 border border-[rgba(32,30,29,0.15)] rounded space-y-3 text-left"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-black text-sm text-[#201e1d]">
                    {exp.role} <span className="text-slate-500 font-semibold">— {exp.company}</span>
                  </div>
                  <span className="text-xs text-slate-500 italic">
                    {[exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' - ')}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {exp.bullets?.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                        className="flex-1 text-xs p-2 border border-slate-300 rounded bg-white font-medium text-[#201e1d] leading-relaxed"
                      />
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenRewriter(bullet, exp.id, bIdx)}
                          className="btn btn-secondary p-1.5 text-xs text-[#ef2b18]"
                          title="Rewrite this bullet with AI"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(expIdx, bIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddBullet(expIdx)}
                    className="text-xs font-bold text-[#ef2b18] hover:underline flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" /> Add Achievement Bullet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
