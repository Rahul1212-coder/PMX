export type ResumeAnalysisMode = 'job_match' | 'general_review';

export const PREDEFINED_PM_ROLES = [
  'Associate Product Manager',
  'Product Manager',
  'Senior Product Manager',
  'Group Product Manager',
  'Director of Product',
  'Growth Product Manager',
  'Platform Product Manager',
  'Technical Product Manager',
  'AI Product Manager',
  'Product Owner',
] as const;

export type PredefinedPmRole = typeof PREDEFINED_PM_ROLES[number];

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  bullets: string[];
  achievements?: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  field?: string;
  institution: string;
  graduationYear?: string;
  location?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link?: string;
  skillsUsed?: string[];
}

export interface StructuredResumeData {
  contact: ContactInfo;
  summary: string;
  experience: WorkExperienceItem[];
  education: EducationItem[];
  skills: {
    productSkills: string[];
    technicalSkills: string[];
    tools: string[];
    methodologies?: string[];
  };
  certifications: string[];
  projects?: ProjectItem[];
}

export interface ParsedResumeDocument {
  id: string;
  userId?: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'text';
  fileSize: number;
  uploadedAt: string;
  rawText: string;
  pageCount: number;
  wordCount: number;
  extractionConfidence: number; // 0 - 100
  isScanned: boolean;
  detectedSections: string[];
  formattingRisks: string[];
}

export type RequirementMatchStatus =
  | 'Demonstrated'
  | 'Partially Demonstrated'
  | 'Not Evidenced'
  | 'Uncertain';

export interface JobDescriptionRequirement {
  id: string;
  requirementText: string;
  normalizedSkill: string;
  type: 'required' | 'preferred';
  category:
    | 'Product Competency'
    | 'Technical Skill'
    | 'Domain Knowledge'
    | 'Leadership & Collaboration'
    | 'Experience & Seniority'
    | 'Business & Analytics'
    | 'Tools & Methodologies';
  importance: 'Critical' | 'High' | 'Medium';
  matchStatus: RequirementMatchStatus;
  supportingEvidence: string;
  resumeBulletReference?: string;
  explanation: string;
  recommendedAction: string;
  relevantSynonyms?: string[];
}

export interface CategoryScore {
  id: string;
  name: string;
  weight: number; // e.g. 35
  score: number; // normalized 0 - 100
  earnedPoints: number; // (score * weight) / 100
  explanation: string;
  supportingEvidence: string[];
}

export type EvidenceStrength = 'Strong' | 'Moderate' | 'Limited' | 'None';

export interface PmCompetencyEvaluation {
  competency: string;
  score: number; // 0 - 100
  evidenceStrength: EvidenceStrength;
  supportingEvidence: string;
  missingOrUnclear: string;
  recommendedImprovement: string;
}

export interface AtsReadinessCheck {
  id: string;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  recommendation?: string;
}

export interface ResumeSuggestion {
  id: string;
  priority: 'critical' | 'high_impact' | 'optional_polish';
  issue: string;
  whyItMatters: string;
  section: string;
  originalContent?: string;
  recommendedRevision?: string;
  expectedBenefit: string;
  requiresUserConfirmation: boolean;
  applied?: boolean;
}

export type ScoreTier = 'Top Candidate' | 'Strong Fit' | 'Moderate Fit' | 'Needs Revision';

export interface ResumeAnalysisResult {
  id: string;
  resumeId: string;
  userId?: string;
  mode: ResumeAnalysisMode;
  targetRole: string;
  targetCompany?: string;
  jobDescription?: string;
  experienceLevel?: string;
  preferredRegion?: string;

  // Deterministic scores
  overallScore: number; // 0 - 100
  scoreTier: ScoreTier;
  categoryScores: CategoryScore[];

  // Detailed breakdowns
  requirementMatches: JobDescriptionRequirement[];
  pmCompetencies: PmCompetencyEvaluation[];
  atsChecks: AtsReadinessCheck[];
  suggestions: ResumeSuggestion[];

  topStrengths: string[];
  topImprovements: string[];
  scoreExplanation: string;

  // Metadata & Auditability
  rubricVersion: string;
  promptVersion: string;
  modelUsed: string;
  createdAt: string;

  // Current structured resume backing this analysis
  structuredResume: StructuredResumeData;
}

export interface BulletRewriteVariation {
  id: string;
  text: string;
  rationale: string;
  focus: string;
}

export interface BulletRewriteResult {
  originalBullet: string;
  goal: string;
  variations: BulletRewriteVariation[];
  metricPromptQuestion?: string;
  suggestedMetricType?: string;
}

export interface ResumeVersion {
  id: string;
  analysisId: string;
  versionNumber: number;
  label: string;
  structuredResume: StructuredResumeData;
  overallScore: number;
  scoreDelta?: number;
  appliedSuggestionIds: string[];
  createdAt: string;
}
