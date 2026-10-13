import { ParsedResumeDocument } from '@/types/resume';

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  summary: [
    /^(professional\s+summary|executive\s+summary|summary|profile|about\s+me)/i,
  ],
  experience: [
    /^(work\s+experience|professional\s+experience|experience|employment\s+history|career\s+history)/i,
  ],
  skills: [
    /^(skills|core\s+competencies|technical\s+skills|product\s+skills|expertise|tools\s+&\s+technologies)/i,
  ],
  education: [
    /^(education|academic\s+background|academic\s+qualifications|academics)/i,
  ],
  projects: [
    /^(projects|key\s+projects|selected\s+projects|product\s+initiatives|portfolio)/i,
  ],
  certifications: [
    /^(certifications|licenses|courses\s+&\s+certifications|professional\s+certifications)/i,
  ],
  contact: [
    /^(contact|personal\s+details|contact\s+information)/i,
  ],
};

export interface ParseOptions {
  fileName: string;
  fileSize: number;
  buffer: Buffer;
  mimeType?: string;
}

export async function parseResumeDocument(options: ParseOptions): Promise<ParsedResumeDocument> {
  const { fileName, fileSize, buffer, mimeType } = options;

  if (!buffer || buffer.length === 0) {
    throw new Error('The uploaded file is empty (0 bytes). Please upload a valid resume file.');
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  let rawText = '';
  let pageCount = 1;
  let isScanned = false;
  let fileType: 'pdf' | 'docx' | 'text' = 'text';

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    fileType = 'pdf';
    try {
      const { extractText } = require('unpdf');
      const uint8 = new Uint8Array(buffer);
      const res = await extractText(uint8);
      rawText = Array.isArray(res.text) ? res.text.join('\n\n') : res.text || '';
      pageCount = res.totalPages || 1;
    } catch (err: any) {
      if (err?.message?.includes('password') || err?.message?.includes('encrypt')) {
        throw new Error('This PDF is password-protected or encrypted. Please remove password protection before uploading.');
      }
      throw new Error(`Unable to read PDF file: ${err?.message || 'Corrupted or unreadable format'}.`);
    }
  } else if (ext === 'docx' || mimeType?.includes('wordprocessingml') || mimeType === 'application/msword') {
    fileType = 'docx';
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || '';
      // Rough page estimate for Word docs: ~450 words per page
      const wordCountApprox = rawText.trim().split(/\s+/).length;
      pageCount = Math.max(1, Math.ceil(wordCountApprox / 450));
    } catch (err: any) {
      throw new Error(`Unable to read DOCX document: ${err?.message || 'Corrupted or unsupported document structure'}.`);
    }
  } else if (ext === 'txt' || mimeType === 'text/plain') {
    fileType = 'text';
    rawText = buffer.toString('utf-8');
    const wordCountApprox = rawText.trim().split(/\s+/).length;
    pageCount = Math.max(1, Math.ceil(wordCountApprox / 450));
  } else {
    throw new Error(`Unsupported file type: .${ext}. PMVerse Resume Intelligence supports PDF and DOCX documents.`);
  }

  // Clean and normalize text
  const cleanedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  const words = cleanedText ? cleanedText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  // Check for scanned / image PDF:
  // If a multi-page PDF has very few words (< 50 words) or predominantly non-ASCII symbols
  if (fileType === 'pdf' && (wordCount < 40 || (wordCount < 100 && pageCount > 1))) {
    isScanned = true;
  }

  // Section detection
  const detectedSections: string[] = [];
  const lines = cleanedText.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.length > 50) continue; // headers are usually short
    for (const [section, patterns] of Object.entries(SECTION_PATTERNS)) {
      if (patterns.some((p) => p.test(line))) {
        if (!detectedSections.includes(section)) {
          detectedSections.push(section);
        }
      }
    }
  }

  // Formatting risks & checks
  const formattingRisks: string[] = [];
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanedText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(cleanedText);

  if (!hasEmail) {
    formattingRisks.push('No contact email detected in resume header or text.');
  }
  if (!hasPhone) {
    formattingRisks.push('No telephone contact number detected in resume.');
  }
  if (isScanned) {
    formattingRisks.push('Document appears to be an image-only or scanned PDF with little selectable text.');
  }
  if (wordCount < 120 && !isScanned) {
    formattingRisks.push('Extracted word count is unusually short for a professional resume.');
  }
  if (pageCount > 4) {
    formattingRisks.push(`Length is ${pageCount} pages, which may exceed standard PM resume length (1-2 pages recommended).`);
  }
  if (!detectedSections.includes('experience')) {
    formattingRisks.push('Could not detect a clear "Work Experience" section header.');
  }
  if (!detectedSections.includes('skills')) {
    formattingRisks.push('Could not detect a dedicated "Skills" or "Competencies" section header.');
  }

  // Calculate extraction confidence
  let confidence = 95;
  if (isScanned) confidence = 20;
  if (!hasEmail) confidence -= 10;
  if (!detectedSections.includes('experience')) confidence -= 15;
  if (detectedSections.length < 3) confidence -= 10;
  if (wordCount < 150) confidence -= 20;
  confidence = Math.max(10, Math.min(100, confidence));

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName,
    fileType,
    fileSize,
    uploadedAt: new Date().toISOString(),
    rawText: cleanedText,
    pageCount,
    wordCount,
    extractionConfidence: confidence,
    isScanned,
    detectedSections,
    formattingRisks,
  };
}
