'use client';

import React, { useState } from 'react';
import { X, Download, Printer, Check, Copy, FileText, Settings, Sparkles } from 'lucide-react';
import { StructuredResumeData } from '@/types/resume';

interface ResumeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  structuredResume: StructuredResumeData;
  targetRole?: string;
}

export const ResumeExportModal: React.FC<ResumeExportModalProps> = ({
  isOpen,
  onClose,
  structuredResume,
  targetRole,
}) => {
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeSkills, setIncludeSkills] = useState(true);
  const [includeEducation, setIncludeEducation] = useState(true);
  const [includeCertifications, setIncludeCertifications] = useState(true);
  const [roleTitle, setRoleTitle] = useState(targetRole || 'Product Manager');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { contact, summary, experience = [], education = [], skills, certifications = [] } = structuredResume;

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const res = await fetch('/api/resume/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredResume: {
            ...structuredResume,
            summary: includeSummary ? summary : '',
            skills: includeSkills ? skills : { productSkills: [], technicalSkills: [], tools: [] },
            education: includeEducation ? education : [],
            certifications: includeCertifications ? certifications : [],
          },
          targetRole: roleTitle,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate DOCX file');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (contact?.name || 'PM_Candidate').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `${safeName}_ATS_Optimized_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(`Export error: ${err?.message || 'Could not download DOCX'}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyPlainText = () => {
    let text = `${contact?.name || 'Product Manager'}\n`;
    if (roleTitle) text += `${roleTitle.toUpperCase()}\n`;
    text += `${[contact?.email, contact?.phone, contact?.location, contact?.linkedin].filter(Boolean).join(' | ')}\n\n`;

    if (includeSummary && summary) {
      text += `PROFESSIONAL SUMMARY\n${summary}\n\n`;
    }

    if (experience.length > 0) {
      text += `WORK EXPERIENCE\n`;
      for (const exp of experience) {
        text += `${exp.role} — ${exp.company} (${[exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' - ')})\n`;
        for (const b of exp.bullets) {
          text += `• ${b.replace(/^[•\-\*]\s*/, '')}\n`;
        }
        text += `\n`;
      }
    }

    if (includeSkills && skills) {
      text += `SKILLS & COMPETENCIES\n`;
      if (skills.productSkills?.length) text += `Product: ${skills.productSkills.join(', ')}\n`;
      if (skills.technicalSkills?.length) text += `Technical: ${skills.technicalSkills.join(', ')}\n`;
      if (skills.tools?.length) text += `Tools: ${skills.tools.join(', ')}\n\n`;
    }

    if (includeEducation && education.length > 0) {
      text += `EDUCATION\n`;
      for (const edu of education) {
        text += `${[edu.degree, edu.field, edu.institution].filter(Boolean).join(', ')} (${edu.graduationYear || ''})\n`;
      }
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-4xl w-full shadow-2xl relative my-6 text-left flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[rgba(32,30,29,0.15)] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#201e1d] text-white flex items-center justify-center font-black">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest text-[#ef2b18] uppercase">
                PMVerse Export Engine
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#201e1d] m-0">
                Export ATS-Optimized Resume
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Left Settings, Right Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="space-y-4">
            <div className="bg-white p-4 border border-[rgba(32,30,29,0.15)] rounded">
              <span className="text-xs font-bold text-[#201e1d] flex items-center gap-1.5 uppercase tracking-wider mb-3">
                <Settings className="w-3.5 h-3.5 text-[#ef2b18]" />
                Export Settings
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Title Subheading</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-[#201e1d]"
                    placeholder="e.g. Senior Product Manager"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700">Include Sections:</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                      className="accent-[#ef2b18]"
                    />
                    <span>Professional Summary</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSkills}
                      onChange={(e) => setIncludeSkills(e.target.checked)}
                      className="accent-[#ef2b18]"
                    />
                    <span>Skills & Competencies</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeEducation}
                      onChange={(e) => setIncludeEducation(e.target.checked)}
                      className="accent-[#ef2b18]"
                    />
                    <span>Education Background</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCertifications}
                      onChange={(e) => setIncludeCertifications(e.target.checked)}
                      className="accent-[#ef2b18]"
                    />
                    <span>Certifications</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 border border-[rgba(32,30,29,0.15)] rounded text-xs space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block w-fit">
                ✓ 100% ATS Single-Column Safe
              </span>
              <p className="text-slate-600 leading-relaxed">
                Uses standard document flow without multi-column tables, charts, or floating text frames. Parsers like Workday, Greenhouse, and Lever parse this structure with near-perfect fidelity.
              </p>
            </div>
          </div>

          {/* Document Preview Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live ATS Document Preview
              </span>
              <button
                type="button"
                onClick={handleCopyPlainText}
                className="text-xs text-slate-600 hover:text-black font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Plain Text!' : 'Copy Plain Text'}
              </button>
            </div>

            {/* Document Sheet */}
            <div
              id="pmverse-resume-print-area"
              className="bg-white p-8 sm:p-10 border-2 border-[#201e1d] shadow-sm text-left font-sans text-xs text-[#201e1d] leading-relaxed overflow-x-auto min-h-[500px]"
            >
              {/* Header */}
              <div className="text-center pb-4 border-b border-[#201e1d]">
                <h1 className="text-xl sm:text-2xl font-black text-[#201e1d] tracking-tight uppercase m-0">
                  {contact?.name || 'Product Manager'}
                </h1>
                {roleTitle && (
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">
                    {roleTitle}
                  </div>
                )}
                <div className="text-[11px] text-slate-600 mt-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
                  {contact?.email && <span>{contact.email}</span>}
                  {contact?.phone && <span>• {contact.phone}</span>}
                  {contact?.location && <span>• {contact.location}</span>}
                  {contact?.linkedin && <span>• {contact.linkedin}</span>}
                  {contact?.portfolio && <span>• {contact.portfolio}</span>}
                </div>
              </div>

              {/* Summary */}
              {includeSummary && summary && (
                <div className="pt-3 pb-2">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-[#201e1d] border-b border-slate-300 pb-0.5 mb-1.5">
                    Professional Summary
                  </h2>
                  <p className="text-[11px] text-slate-800 leading-normal">{summary}</p>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="pt-3 pb-2">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-[#201e1d] border-b border-slate-300 pb-0.5 mb-2">
                    Work Experience
                  </h2>
                  <div className="space-y-3">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex flex-wrap items-baseline justify-between">
                          <span className="font-black text-xs text-[#201e1d]">
                            {exp.role} <span className="font-semibold text-slate-700">— {exp.company}</span>
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 italic">
                            {[exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' - ')}
                          </span>
                        </div>
                        <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-[11px] text-slate-800">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {includeSkills && skills && (
                <div className="pt-3 pb-2">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-[#201e1d] border-b border-slate-300 pb-0.5 mb-1.5">
                    Skills & Competencies
                  </h2>
                  <div className="space-y-1 text-[11px] text-slate-800">
                    {skills.productSkills?.length > 0 && (
                      <p>
                        <strong className="text-[#201e1d]">Product Competencies:</strong>{' '}
                        {skills.productSkills.join(', ')}
                      </p>
                    )}
                    {skills.technicalSkills?.length > 0 && (
                      <p>
                        <strong className="text-[#201e1d]">Technical:</strong>{' '}
                        {skills.technicalSkills.join(', ')}
                      </p>
                    )}
                    {skills.tools?.length > 0 && (
                      <p>
                        <strong className="text-[#201e1d]">Tools:</strong> {skills.tools.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {includeEducation && education.length > 0 && (
                <div className="pt-3 pb-2">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-[#201e1d] border-b border-slate-300 pb-0.5 mb-1.5">
                    Education
                  </h2>
                  <div className="space-y-1 text-[11px] text-slate-800">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <span className="font-bold">
                          {[edu.degree, edu.field, edu.institution].filter(Boolean).join(', ')}
                        </span>
                        {edu.graduationYear && (
                          <span className="text-[10px] text-slate-500">{edu.graduationYear}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {includeCertifications && certifications.length > 0 && (
                <div className="pt-3 pb-2">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-[#201e1d] border-b border-slate-300 pb-0.5 mb-1.5">
                    Certifications
                  </h2>
                  <ul className="list-disc list-outside pl-4 text-[11px] text-slate-800 space-y-0.5">
                    {certifications.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 border-[rgba(32,30,29,0.15)] bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs font-bold py-2 px-4"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1.5 shadow-sm"
              title="Print to PDF or Save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="btn btn-primary text-xs font-black py-2 px-5 flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingDocx ? 'Generating Word DOCX...' : 'Download ATS DOCX'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
