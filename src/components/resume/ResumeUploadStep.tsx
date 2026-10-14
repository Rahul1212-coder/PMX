'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Eye, Edit3, ArrowRight } from 'lucide-react';
import { ParsedResumeDocument } from '@/types/resume';

interface ResumeUploadStepProps {
  onParsedDocument: (doc: ParsedResumeDocument, rawText: string) => void;
  initialDoc?: ParsedResumeDocument | null;
  initialRawText?: string;
  hasReachedLimit?: boolean;
  onViewExistingAnalysis?: () => void;
}

export const ResumeUploadStep: React.FC<ResumeUploadStepProps> = ({
  onParsedDocument,
  initialDoc,
  initialRawText,
  hasReachedLimit = false,
  onViewExistingAnalysis,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedDoc, setParsedDoc] = useState<ParsedResumeDocument | null>(initialDoc || null);
  const [editableText, setEditableText] = useState<string>(initialRawText || initialDoc?.rawText || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDirectPaste, setShowDirectPaste] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (selectedFile: File) => {
    setErrorMessage(null);
    setFile(selectedFile);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      setErrorMessage('Unsupported file format. Please upload a PDF or DOCX resume document.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('File exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract document contents');
      }

      setParsedDoc(data.document);
      setEditableText(data.document.rawText);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error parsing document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleProcessFile(droppedFile);
    }
  };

  const handleProceed = () => {
    if (!editableText.trim() || editableText.trim().length < 50) {
      setErrorMessage('Please ensure your resume has at least 50 characters of readable text.');
      return;
    }

    const doc: ParsedResumeDocument = parsedDoc || {
      id: `doc-${Date.now()}`,
      fileName: file?.name || 'pasted-resume.txt',
      fileType: 'text',
      fileSize: editableText.length,
      uploadedAt: new Date().toISOString(),
      rawText: editableText,
      pageCount: Math.max(1, Math.ceil(editableText.split(/\s+/).length / 450)),
      wordCount: editableText.split(/\s+/).length,
      extractionConfidence: 90,
      isScanned: false,
      detectedSections: ['experience', 'skills'],
      formattingRisks: [],
    };

    onParsedDocument(doc, editableText);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      {/* Step Header */}
      <div className="text-center space-y-1.5">
        <div className="text-[10px] font-black tracking-widest text-[#ef2b18] uppercase">
          Step 1 of 3: Resume Ingestion
        </div>
        <h2 className="text-2xl font-black text-[#201e1d] m-0 tracking-tight">
          Upload Your Product Resume
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Upload your PDF or DOCX file. Our parser extracts reading order, bullets, and section boundaries without discarding content.
        </p>
      </div>

      {/* Limit Reached Notification */}
      {hasReachedLimit && (
        <div className="p-4 bg-red-50 border border-red-300 rounded text-xs text-red-900 flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Evaluation Limit Reached (2 of 2 Free Analyses Used)</p>
              <p className="text-[11px] text-red-700 mt-0.5 leading-snug">
                You have completed your 2 complimentary AI evaluations. You can still view, edit, and export your previously analyzed resume.
              </p>
            </div>
          </div>
          {onViewExistingAnalysis && (
            <button
              type="button"
              onClick={onViewExistingAnalysis}
              className="btn btn-secondary text-xs font-bold py-1.5 px-3 shrink-0"
            >
              <span>View Existing Analysis →</span>
            </button>
          )}
        </div>
      )}

      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-8 sm:p-10 text-center rounded transition cursor-pointer ${
          isDragOver
            ? 'border-[#ef2b18] bg-[#ef2b18]/5'
            : 'border-[rgba(32,30,29,0.25)] bg-white hover:border-[#201e1d]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleProcessFile(f);
          }}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#ef2b18]/10 text-[#ef2b18] flex items-center justify-center">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <span className="text-sm font-black text-[#201e1d] block">
              {isUploading
                ? 'Parsing document structure & sections...'
                : file
                ? file.name
                : 'Click to upload or drag & drop resume file'}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Supported formats: PDF (.pdf), Microsoft Word (.docx) — Max 10MB
            </span>
          </div>

          {!isUploading && !file && (
            <button
              type="button"
              className="btn btn-secondary text-xs font-bold py-1.5 px-4 mt-2"
            >
              Browse Files
            </button>
          )}
        </div>
      </div>

      {/* Alternative: Paste Plain Text */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowDirectPaste(!showDirectPaste)}
          className="text-xs text-slate-600 hover:text-black font-semibold underline"
        >
          {showDirectPaste ? 'Hide plain text input' : 'Or paste resume plain text directly'}
        </button>
      </div>

      {showDirectPaste && (
        <div className="bg-white p-4 border border-[rgba(32,30,29,0.15)] rounded space-y-2">
          <label className="text-xs font-bold text-[#201e1d] block">Paste Raw Resume Text:</label>
          <textarea
            rows={8}
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            placeholder="Paste complete resume text here including summary, work experience bullets, skills..."
            className="w-full text-xs p-3 border border-slate-300 rounded font-mono text-[#201e1d] outline-none"
          />
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-300 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Extracted Document Preview & Heuristics */}
      {parsedDoc && (
        <div className="bg-white border-2 border-[#201e1d] p-5 rounded space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-black text-sm text-[#201e1d]">
                Extraction Complete ({parsedDoc.wordCount} words, ~{parsedDoc.pageCount} pages)
              </span>
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                parsedDoc.extractionConfidence >= 80
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Confidence: {parsedDoc.extractionConfidence}%
            </span>
          </div>

          {parsedDoc.formattingRisks.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 space-y-1">
              <span className="font-bold block">Document Observations:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                {parsedDoc.formattingRisks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Editable Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-[#ef2b18]" /> Editable Extracted Text:
              </label>
              <span className="text-[11px] text-slate-500 italic">
                Confirm or polish text before running AI analysis
              </span>
            </div>
            <textarea
              rows={8}
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded font-mono text-[#201e1d] outline-none leading-relaxed"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleProceed}
              className="btn btn-primary text-xs font-black py-2.5 px-6 flex items-center gap-2 shadow-md"
            >
              <span>Continue to Target Role</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
