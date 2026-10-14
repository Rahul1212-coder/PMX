/**
 * Resume AI Usage Types & Constants
 * Safe to import in both Client ('use client') and Server components.
 */

export const MAX_RESUME_ANALYSES = 2;

export interface ResumeUsageInfo {
  usageCount: number;
  remaining: number;
  maxAllowed: number;
  hasReachedLimit: boolean;
  history?: Array<{
    id?: string;
    createdAt?: string;
    targetRole?: string;
    score?: number;
  }>;
}
