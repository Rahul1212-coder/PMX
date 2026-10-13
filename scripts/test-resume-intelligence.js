/**
 * PMVerse Resume Intelligence — Automated Test Suite & Evaluation Framework
 * Tests deterministic scoring math, document parser heuristics, DOCX generation,
 * and bullet rewriting guardrails.
 */

const assert = require('assert');

// 1. Test Deterministic Scoring Engine
console.log('--- TEST 1: Deterministic Scoring Math & Boundary Tests ---');

const { calculateDeterministicScores, JOB_MATCH_RUBRIC, GENERAL_REVIEW_RUBRIC, getScoreTier } = require('../src/lib/resume/scoring.ts');

// Check weight totals
const jobMatchWeightTotal = JOB_MATCH_RUBRIC.reduce((acc, c) => acc + c.weight, 0);
assert.strictEqual(jobMatchWeightTotal, 100, 'JOB_MATCH_RUBRIC weights must sum to exactly 100');
console.log('✔ JOB_MATCH_RUBRIC weights sum to 100');

const generalReviewWeightTotal = GENERAL_REVIEW_RUBRIC.reduce((acc, c) => acc + c.weight, 0);
assert.strictEqual(generalReviewWeightTotal, 100, 'GENERAL_REVIEW_RUBRIC weights must sum to exactly 100');
console.log('✔ GENERAL_REVIEW_RUBRIC weights sum to 100');

// Test score boundaries and calculations
const sampleJobMatchRaw = {
  job_alignment: { score: 85, explanation: 'Strong alignment', supportingEvidence: ['Led roadmapping'] },
  product_impact: { score: 70, explanation: 'Good outcomes', supportingEvidence: ['+15% conversion'] },
  pm_experience: { score: 90, explanation: 'Extensive PM scope', supportingEvidence: ['5 years experience'] },
  parsing_readability: { score: 95, explanation: 'Clean layout', supportingEvidence: ['Standard headers'] },
  keywords_terminology: { score: 80, explanation: 'Good terminology', supportingEvidence: ['OKRs, RICE'] },
};

const jobMatchResult = calculateDeterministicScores({
  mode: 'job_match',
  rawCategoryScores: sampleJobMatchRaw,
});

assert(jobMatchResult.overallScore >= 0 && jobMatchResult.overallScore <= 100, 'Overall score must be within [0, 100]');
assert.strictEqual(typeof jobMatchResult.scoreTier, 'string', 'Score tier must be a string');
console.log(`✔ Job match calculation succeeded: Overall score = ${jobMatchResult.overallScore}/100 (${jobMatchResult.scoreTier})`);

// Boundary tests: All 0s and all 100s
const zeroResult = calculateDeterministicScores({
  mode: 'job_match',
  rawCategoryScores: {
    job_alignment: { score: 0, explanation: '', supportingEvidence: [] },
    product_impact: { score: 0, explanation: '', supportingEvidence: [] },
    pm_experience: { score: 0, explanation: '', supportingEvidence: [] },
    parsing_readability: { score: 0, explanation: '', supportingEvidence: [] },
    keywords_terminology: { score: 0, explanation: '', supportingEvidence: [] },
  },
});
assert.strictEqual(zeroResult.overallScore, 0, 'Zero inputs must produce 0 overall score');
assert.strictEqual(zeroResult.scoreTier, 'Needs Revision', 'Score 0 must be Needs Revision');
console.log('✔ Zero boundary test passed (score = 0, tier = Needs Revision)');

const perfectResult = calculateDeterministicScores({
  mode: 'job_match',
  rawCategoryScores: {
    job_alignment: { score: 100, explanation: '', supportingEvidence: [] },
    product_impact: { score: 100, explanation: '', supportingEvidence: [] },
    pm_experience: { score: 100, explanation: '', supportingEvidence: [] },
    parsing_readability: { score: 100, explanation: '', supportingEvidence: [] },
    keywords_terminology: { score: 100, explanation: '', supportingEvidence: [] },
  },
});
assert.strictEqual(perfectResult.overallScore, 100, '100 inputs must produce 100 overall score');
assert.strictEqual(perfectResult.scoreTier, 'Top Candidate', 'Score 100 must be Top Candidate');
console.log('✔ Max boundary test passed (score = 100, tier = Top Candidate)');

// 2. Test Document Parser Heuristics
console.log('\n--- TEST 2: Document Parser Heuristics ---');
const { parseResumeDocument } = require('../src/lib/resume/parser.ts');

const sampleResumeText = `
Alex Mercer
alex.mercer@gmail.com | (555) 234-5678 | San Francisco, CA | linkedin.com/in/alexmercer

PROFESSIONAL SUMMARY
Senior Product Manager with 6+ years driving platform and growth initiatives. Led cross-functional squads across discovery, roadmap execution, and metrics instrumentation.

WORK EXPERIENCE
Senior Product Manager — FinTech Corp (2021 - Present)
• Spearheaded self-serve onboarding redesign, increasing activation by 28% and reducing 30-day drop-off across 400K monthly active users.
• Established experimentation framework, running 14 A/B tests to optimize core checkout conversion.
• Partnered with engineering, design, and compliance leads to deliver enterprise API integrations on time.

Product Manager — CloudScale Systems (2018 - 2021)
• Owned developer platform API roadmap, growing monthly API transaction volume from 2M to 15M calls.
• Conducted 50+ qualitative user interviews to define multi-tenant permission specifications.

SKILLS & COMPETENCIES
Product: User Research, Roadmap Planning, A/B Testing, RICE Prioritization, Product Analytics
Technical: SQL, REST APIs, System Architecture, Agile / Scrum
Tools: Mixpanel, Amplitude, Figma, Jira, Postman

EDUCATION
Bachelor of Science in Computer Science — University of California, Berkeley (2018)
`;

async function runParserTest() {
  const parsed = await parseResumeDocument({
    fileName: 'alex_mercer_resume.txt',
    fileSize: Buffer.byteLength(sampleResumeText),
    buffer: Buffer.from(sampleResumeText, 'utf-8'),
    mimeType: 'text/plain',
  });

  assert(parsed.wordCount > 100, 'Word count should be > 100');
  assert(parsed.detectedSections.includes('summary'), 'Should detect summary section');
  assert(parsed.detectedSections.includes('experience'), 'Should detect experience section');
  assert(parsed.detectedSections.includes('skills'), 'Should detect skills section');
  assert(parsed.detectedSections.includes('education'), 'Should detect education section');
  assert.strictEqual(parsed.isScanned, false, 'Should not detect as scanned');
  assert(parsed.extractionConfidence >= 80, 'Confidence should be >= 80 for clean resume');

  console.log(`✔ Parser accurately extracted ${parsed.wordCount} words and identified sections: [${parsed.detectedSections.join(', ')}]`);
  console.log(`✔ Extraction confidence: ${parsed.extractionConfidence}%`);

  // Test PDF parsing via unpdf
  const validPdfBuffer = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n' +
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' +
    '5 0 obj\n<< /Length 67 >>\nstream\n' +
    'BT /F1 12 Tf 72 712 Td (Alex Mercer - Senior Product Manager) Tj ET\n' +
    'endstream\nendobj\n' +
    'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000241 00000 n \n0000000311 00000 n \n' +
    'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n428\n%%EOF\n',
    'utf-8'
  );

  const parsedPdf = await parseResumeDocument({
    fileName: 'resume.pdf',
    fileSize: validPdfBuffer.length,
    buffer: validPdfBuffer,
    mimeType: 'application/pdf',
  });

  assert.strictEqual(parsedPdf.fileType, 'pdf', 'File type should be pdf');
  assert.strictEqual(parsedPdf.pageCount, 1, 'Page count should be 1');
  assert(parsedPdf.rawText.includes('Alex Mercer'), 'Parsed PDF text must include Alex Mercer');
  console.log(`✔ PDF parser (unpdf) successfully extracted text: "${parsedPdf.rawText.trim()}", pages: ${parsedPdf.pageCount}`);
}

// 3. Test DOCX Generation with docx library
console.log('\n--- TEST 3: DOCX Generation ---');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

async function runDocxTest() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: 'Alex Mercer', heading: HeadingLevel.TITLE }),
          new Paragraph({ text: 'alex.mercer@gmail.com | San Francisco, CA' }),
          new Paragraph({ text: 'WORK EXPERIENCE', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'Spearheaded self-serve onboarding redesign.', bullet: { level: 0 } }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  assert(buffer.length > 1000, 'DOCX buffer should be > 1KB');
  console.log(`✔ Native ATS DOCX generated successfully (${buffer.length} bytes)`);
}

// 4. Test Bullet Rewriting Logic
console.log('\n--- TEST 4: Bullet Rewriting Guardrails ---');
const { rewriteResumeBullet } = require('../src/lib/resume/openai.ts');

async function runBulletRewriterTest() {
  const originalBullet = 'Worked with team on shipping customer onboarding flow.';
  const res = await rewriteResumeBullet({
    originalBullet,
    goal: 'impact',
    targetRole: 'Senior Product Manager',
  });

  assert(res.variations && res.variations.length >= 3, 'Must return at least 3 variations');
  assert.strictEqual(typeof res.metricPromptQuestion, 'string', 'Must provide metric probing prompt question');
  console.log('✔ Bullet rewriter generated 3 variations:');
  res.variations.forEach((v, i) => console.log(`   [Variation ${i + 1} - ${v.focus}]: "${v.text}"`));
  console.log(`✔ Metric Probing Question: "${res.metricPromptQuestion}"`);
}

async function runAll() {
  await runParserTest();
  await runDocxTest();
  await runBulletRewriterTest();
  console.log('\n========================================');
  console.log('🎉 ALL RESUME INTELLIGENCE TESTS PASSED!');
  console.log('========================================\n');
}

runAll().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
