'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { JobListing } from '../types';
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Search,
  Bookmark,
  Building2,
  PlusCircle,
  X,
  Check,
  Send,
  Clock,
  ChevronRight,
  ArrowRight,
  Sliders,
  RefreshCw,
  Loader2,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isAiMentorEnabled } from '@/lib/features';
import {
  getSavedJobIdsFromDb,
  toggleSavedJobInDb,
  getJobListingsFromDb,
  insertJobListingToDb,
  getJobApplicationsFromDb,
  upsertJobApplicationInDb,
  deleteJobApplicationInDb,
} from '@/lib/supabase/database';
import { JobApplication, ApplicationStage } from '../types';
import { calculateJobMatch, resolveUserExperienceYears } from '@/lib/jobMatcher';

interface JobBoardProps {
  initialJobs: JobListing[];
  initialActiveSubTab?: 'browse' | 'tracker';
  onNavigateToMentor?: (prompt: string) => void;
  onNavigateToAssessment?: () => void;
  onAnalyzeJobResume?: (job: { title: string; company: string; description: string }) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({
  initialJobs,
  initialActiveSubTab = 'browse',
  onNavigateToMentor,
  onNavigateToAssessment,
  onAnalyzeJobResume,
}) => {
  const { user, profile, openAuthModal, isConfigured } = useAuth();
  const mentorEnabled = isAiMentorEnabled();
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filterChip, setFilterChip] = useState('All');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'tracker'>(initialActiveSubTab);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [trackerToast, setTrackerToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync incoming initialActiveSubTab prop
  useEffect(() => {
    if (initialActiveSubTab) {
      setActiveSubTab(initialActiveSubTab);
    }
  }, [initialActiveSubTab]);

  // Auto-dismiss tracker toast
  useEffect(() => {
    if (trackerToast) {
      const timer = setTimeout(() => setTrackerToast(null), 3800);
      return () => clearTimeout(timer);
    }
  }, [trackerToast]);

  // New application form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualStage, setManualStage] = useState<ApplicationStage>('Applied');

  // Real Application tracker stages
  const STAGES: ApplicationStage[] = ['Saved', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer'];
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Post Job form
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLevel, setNewLevel] = useState<JobListing['level']>('Product Manager');
  const [newDomain, setNewDomain] = useState<JobListing['domain']>('B2B SaaS');
  const [newLocation, setNewLocation] = useState('Remote / India');
  const [newType, setNewType] = useState<JobListing['type']>('Hybrid');
  const [newSalary, setNewSalary] = useState('₹28L–₹45L PA');
  const [newDescription, setNewDescription] = useState('');
  const [newSkills, setNewSkills] = useState('Product Strategy, Roadmapping, Analytics');
  const [newApplyUrl, setNewApplyUrl] = useState('');

  // User calibration metrics for match calculation
  const userYears = resolveUserExperienceYears(profile);
  const userTestScore = profile?.pmFitScore ?? null;
  const hasTakenAssessment = Boolean(userTestScore && userTestScore > 0);

  // Handle live job aggregation
  const handleSyncLiveJobs = async () => {
    setIsSyncing(true);
    setSyncMessage('Aggregating live PM jobs from LinkedIn, Naukri, IIMJobs & YC (India Tech focus)...');
    try {
      const res = await fetch('/api/jobs/sync', { method: 'POST' });
      const data = await res.json();
      if (data?.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pmverse_synced_jobs', JSON.stringify(data.jobs));
        }
        setSyncMessage(`✓ Synced ${data.jobs.length} live Indian & YC product manager roles!`);
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to sync live jobs:', err);
      setSyncMessage('Sync finished.');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load real jobs & applications from database & local cache
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      let loadedJobs: JobListing[] = [];
      if (isConfigured) {
        const dbJobs = await getJobListingsFromDb();
        if (dbJobs && dbJobs.length > 0) {
          loadedJobs = dbJobs;
        }
      }

      if (loadedJobs.length === 0 && typeof window !== 'undefined') {
        const cached = localStorage.getItem('pmverse_synced_jobs');
        if (cached) {
          try {
            loadedJobs = JSON.parse(cached);
          } catch {}
        }
      }

      // If still empty, automatically pull from /api/jobs/sync
      if (loadedJobs.length === 0) {
        try {
          const res = await fetch('/api/jobs/sync');
          const data = await res.json();
          if (data?.jobs && data.jobs.length > 0) {
            loadedJobs = data.jobs;
            if (typeof window !== 'undefined') {
              localStorage.setItem('pmverse_synced_jobs', JSON.stringify(data.jobs));
            }
          }
        } catch {}
      }

      if (mounted && loadedJobs.length > 0) {
        setJobs(loadedJobs);
      }

      // Load saved jobs & applications for current user or guest fallback
      const effectiveUid = user?.id || 'guest';
      const [ids, loadedApps] = await Promise.all([
        getSavedJobIdsFromDb(effectiveUid),
        getJobApplicationsFromDb(effectiveUid),
      ]);

      // Ensure savedJobIds includes all roles currently in 'Saved' stage in tracker
      const savedIdsFromApps = loadedApps
        .filter((a) => a.stage === 'Saved' && a.jobId)
        .map((a) => a.jobId!);

      const mergedSavedIds = new Set([...ids, ...savedIdsFromApps]);

      // Backfill any saved job ids that don't have a tracker application yet
      const appJobIds = new Set(loadedApps.map((a) => a.jobId).filter(Boolean));
      for (const sId of mergedSavedIds) {
        if (!appJobIds.has(sId)) {
          const matchingJob = loadedJobs.find((j) => j.id === sId);
          if (matchingJob) {
            const backfilledApp: JobApplication = {
              id: `app-saved-${sId}-${Date.now()}`,
              userId: effectiveUid,
              jobId: sId,
              jobTitle: matchingJob.title,
              company: matchingJob.company,
              stage: 'Saved',
              location: matchingJob.location,
              salaryRange: matchingJob.salaryRange,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            loadedApps.unshift(backfilledApp);
            appJobIds.add(sId);
            upsertJobApplicationInDb(backfilledApp).catch(() => {});
          }
        }
      }

      if (mounted) {
        setSavedJobIds(mergedSavedIds);
        setApplications(loadedApps);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [user, isConfigured]);

  const toggleSave = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isCurrentlySaved = savedJobIds.has(jobId);
    const nextSaved = new Set(savedJobIds);
    const uid = user?.id || 'guest';
    const job = jobs.find((j) => j.id === jobId) || (selectedJob?.id === jobId ? selectedJob : null);

    if (isCurrentlySaved) {
      // 1. Remove from saved jobs
      nextSaved.delete(jobId);
      setSavedJobIds(nextSaved);

      // Remove from tracker only if it is in 'Saved' stage
      const savedApp = applications.find(
        (a) =>
          (a.jobId === jobId || (job && a.jobTitle === job.title && a.company === job.company)) &&
          a.stage === 'Saved'
      );
      if (savedApp) {
        setApplications((prev) => prev.filter((a) => a.id !== savedApp.id));
        await deleteJobApplicationInDb(savedApp.id, uid);
      }
      await toggleSavedJobInDb(uid, jobId, true);

      setTrackerToast({
        message: `Removed ${job?.title || 'role'} from Saved tracker.`,
        type: 'info',
      });
    } else {
      // 2. Save role -> immediately add to tracker under 'Saved'
      nextSaved.add(jobId);
      setSavedJobIds(nextSaved);

      await toggleSavedJobInDb(uid, jobId, false);

      // Check if this role is already in applications
      const existingApp = applications.find(
        (a) => a.jobId === jobId || (job && a.jobTitle === job.title && a.company === job.company)
      );

      if (!existingApp) {
        const newApp: JobApplication = {
          id: `app-saved-${jobId}-${Date.now()}`,
          userId: uid,
          jobId: jobId,
          jobTitle: job?.title || 'Product Role',
          company: job?.company || 'Company',
          stage: 'Saved',
          location: job?.location || 'Remote',
          salaryRange: job?.salaryRange || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setApplications((prev) => [newApp, ...prev]);
        await upsertJobApplicationInDb(newApp);
      }

      setTrackerToast({
        message: `"${job?.title || 'Role'}" saved to your Tracker under Saved!`,
        type: 'success',
      });
    }
  };

  const handleApply = async (job: JobListing) => {
    // 1. Always open official company posting URL directly in new tab
    if (job.applyUrl && job.applyUrl !== '#') {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }

    // 2. Simultaneously record or advance application in user's PMVerse tracker
    const uid = user?.id || 'guest';
    const existing = applications.find(
      (a) => a.jobId === job.id || (a.jobTitle === job.title && a.company === job.company)
    );
    if (!existing) {
      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        userId: uid,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        stage: 'Applied',
        location: job.location,
        salaryRange: job.salaryRange,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setApplications((prev) => [newApp, ...prev]);
      await upsertJobApplicationInDb(newApp);
    } else if (existing.stage === 'Saved') {
      const updated: JobApplication = {
        ...existing,
        stage: 'Applied',
        updatedAt: new Date().toISOString(),
      };
      setApplications((prev) => prev.map((a) => (a.id === existing.id ? updated : a)));
      await upsertJobApplicationInDb(updated);
    }

    setTrackerToast({
      message: `Application for "${job.title}" logged in Tracker!`,
      type: 'success',
    });
  };

  const moveApplication = async (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    const currentIdx = STAGES.indexOf(target.stage);
    if (currentIdx >= 0 && currentIdx < STAGES.length - 1) {
      const nextStage = STAGES[currentIdx + 1];
      const updated: JobApplication = {
        ...target,
        stage: nextStage,
        updatedAt: new Date().toISOString(),
      };
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      await upsertJobApplicationInDb(updated);
    }
  };

  const handleAddManualApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    if (!manualTitle.trim() || !manualCompany.trim()) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      userId: user.id,
      jobTitle: manualTitle.trim(),
      company: manualCompany.trim(),
      stage: manualStage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);
    await upsertJobApplicationInDb(newApp);
    setManualTitle('');
    setManualCompany('');
    setIsAddAppModalOpen(false);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }

    setIsPublishing(true);
    const createdJob: JobListing = {
      id: `job-${Date.now()}`,
      userId: user.id,
      title: newTitle.trim(),
      company: newCompany.trim(),
      logo: '💼',
      level: newLevel,
      domain: newDomain,
      location: newLocation.trim(),
      type: newType,
      salaryRange: newSalary.trim(),
      description: newDescription.trim(),
      skills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      applyUrl: newApplyUrl.trim() || '#',
      postedDate: 'Just now',
      featured: true,
      matchScore: 88,
    };

    if (isConfigured) {
      await insertJobListingToDb(createdJob);
    }
    setJobs((prev) => [createdJob, ...prev]);
    setIsPublishing(false);
    setIsPostModalOpen(false);
  };

  const chips = [
    'All',
    'LinkedIn',
    'Naukri',
    'IIMJobs',
    'YC',
    'Bengaluru',
    'Remote',
    'Senior',
    'Entry level',
  ];

  const renderSourceBadge = (source?: string) => {
    const s = source || 'LinkedIn';
    let style = 'bg-[#eef3f8] text-[#0a66c2] border-[#0a66c2]';
    if (s === 'Naukri') style = 'bg-[#ecfdf5] text-[#047857] border-[#047857]';
    if (s === 'IIMJobs') style = 'bg-[#fffbeb] text-[#b45309] border-[#b45309]';
    if (s === 'YC') style = 'bg-[#fff7ed] text-[#c2410c] border-[#c2410c]';

    return (
      <span
        className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 border ${style}`}
      >
        {s}
      </span>
    );
  };

  const jobsWithMatch = useMemo(() => {
    return jobs.map((j) => {
      const matchCalc = calculateJobMatch(j, profile, userTestScore);
      return {
        job: { ...j, matchScore: matchCalc.overallScore },
        matchCalc,
        matchScore: matchCalc.overallScore,
      };
    });
  }, [jobs, profile, userTestScore]);

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobsWithMatch
      .filter(({ job: j }) => {
        const matchesSearch =
          !q ||
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.domain.toLowerCase().includes(q) ||
          (j.source && j.source.toLowerCase().includes(q));

        let matchesChip = true;
        if (filterChip === 'LinkedIn') matchesChip = j.source === 'LinkedIn';
        else if (filterChip === 'Naukri') matchesChip = j.source === 'Naukri';
        else if (filterChip === 'IIMJobs') matchesChip = j.source === 'IIMJobs';
        else if (filterChip === 'YC') matchesChip = j.source === 'YC';
        else if (filterChip === 'Bengaluru')
          matchesChip =
            j.location.toLowerCase().includes('bengaluru') ||
            j.location.toLowerCase().includes('bangalore');
        else if (filterChip === 'Remote')
          matchesChip = j.type === 'Remote' || j.location.toLowerCase().includes('remote');
        else if (filterChip === 'Senior')
          matchesChip =
            j.level.includes('Senior') ||
            j.level.includes('Lead') ||
            j.level.includes('Director');
        else if (filterChip === 'Entry level')
          matchesChip = j.level.includes('Associate') || j.level.includes('Intern');

        return matchesSearch && matchesChip;
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((item) => item.job);
  }, [jobsWithMatch, search, filterChip]);

  const selectedMatch = useMemo(() => {
    if (!selectedJob) return null;
    return calculateJobMatch(selectedJob, profile, userTestScore);
  }, [selectedJob, profile, userTestScore]);

  return (
    <div className="space-y-6 text-left">
      {/* ========================================================
          1. JOB DETAIL VIEW
         ======================================================== */}
      {selectedJob ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedJob(null)}
            className="btn btn-ghost text-xs font-bold pl-0"
          >
            ← All jobs
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-[#ae1800] font-bold">
                  {selectedJob.company}
                </span>
                {renderSourceBadge(selectedJob.source)}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight my-2 text-[#201e1d]">
                {selectedJob.title}
              </h1>

              {/* 3-Column Stats Bar */}
              <div className="grid grid-cols-3 border-y-2 border-[rgba(32,30,29,0.15)] my-4">
                <div className="p-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#605d5d] font-bold">
                    Location
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-[#201e1d]">
                    {selectedJob.location}
                  </div>
                </div>
                <div className="p-3 border-l border-[rgba(32,30,29,0.15)]">
                  <div className="text-[10px] uppercase tracking-wider text-[#605d5d] font-bold">
                    Salary
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-[#201e1d]">
                    {selectedJob.salaryRange}
                  </div>
                </div>
                <div className="p-3 border-l border-[rgba(32,30,29,0.15)]">
                  <div className="text-[10px] uppercase tracking-wider text-[#605d5d] font-bold">
                    Level
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-[#201e1d]">
                    {selectedJob.level}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 my-6">
                <button
                  onClick={() => handleApply(selectedJob)}
                  className="btn btn-primary text-xs font-bold px-6"
                >
                  <span>Apply on company site</span>
                  <span>↗</span>
                </button>
                <button
                  onClick={(e) => toggleSave(selectedJob.id, e)}
                  className="btn btn-secondary text-xs font-bold"
                >
                  <span>{savedJobIds.has(selectedJob.id) ? 'Saved' : 'Save job'}</span>
                </button>
                {mentorEnabled && (
                  <button
                    onClick={() => {
                      if (onNavigateToMentor) {
                        onNavigateToMentor(
                          `Start a mock interview for the ${selectedJob.title} role at ${selectedJob.company}.`
                        );
                      }
                    }}
                    className="btn btn-secondary text-xs font-bold"
                  >
                    <span>Prepare for interview</span>
                  </button>
                )}
                {onAnalyzeJobResume && (
                  <button
                    onClick={() => {
                      onAnalyzeJobResume({
                        title: selectedJob.title,
                        company: selectedJob.company,
                        description: selectedJob.description || '',
                      });
                    }}
                    className="btn btn-primary text-xs font-black flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Match My Resume</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-[rgba(32,30,29,0.15)]">
                <h4 className="text-base font-extrabold text-[#201e1d] m-0">About the Role</h4>
                <p className="text-sm text-[#201e1d] leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description ||
                    'Own the end-to-end product lifecycle for critical customer touchpoints. You will partner with engineering, design, and GTM leaders to drive measurable metrics outcomes.'}
                </p>

                <h4 className="text-base font-extrabold text-[#201e1d] pt-4 m-0">Skills & Tooling</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map((sk, i) => (
                    <span key={i} className="tag tag-neutral font-semibold text-xs">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Dynamic Match Analysis Breakdown */}
            <aside className="border-2 border-[#201e1d] p-6 bg-[#f3f2f2] space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-[#ec3013] leading-none tracking-tighter">
                  {selectedMatch?.overallScore || selectedJob.matchScore || 85}%
                </span>
                <span className="font-extrabold text-xs uppercase tracking-wider text-[#201e1d]">
                  Match
                </span>
              </div>
              <div className="text-xs text-[#605d5d]">
                Calibrated for your {selectedMatch?.userYears ?? userYears} yrs experience &{' '}
                {selectedMatch?.hasTakenAssessment ? (
                  <strong className="text-emerald-800 font-semibold">
                    {selectedMatch.testScoreUser}% verified diagnostic score
                  </strong>
                ) : (
                  <span>diagnostic baseline score (~65%)</span>
                )}
                .
              </div>

              <div className="divide-y divide-[rgba(32,30,29,0.15)] pt-2">
                {selectedMatch?.factors.map((f, i) => (
                  <div key={i} className="py-2.5 space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>
                        {f.name} <span className="text-slate-400">· {f.weight}% weight</span>
                      </span>
                      <span className="font-bold">
                        {f.score} / {f.weight}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#d7d3d3]">
                      <div
                        className="h-full bg-[#201e1d]"
                        style={{ width: `${(f.score / f.weight) * 100}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#605d5d] leading-tight">
                      {f.detail}
                    </div>
                  </div>
                ))}
              </div>

              {selectedMatch?.highlights && selectedMatch.highlights.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-2">
                    Why It Fits
                  </div>
                  <div className="text-xs space-y-1 font-semibold text-[#201e1d]">
                    {selectedMatch.highlights.map((h, i) => (
                      <div key={i}>{h}</div>
                    ))}
                    <div>✓ Target domain fit: {selectedJob.domain}</div>
                  </div>
                </div>
              )}

              {selectedMatch?.improvementAdvice && (
                <div className="p-3 bg-[#eae9e9] border border-[rgba(32,30,29,0.15)] text-xs text-[#201e1d] space-y-1">
                  <div className="font-extrabold uppercase text-[10px] text-[#ae1800]">
                    Match Guidance
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    {selectedMatch.improvementAdvice}
                  </div>
                </div>
              )}

              {!selectedMatch?.hasTakenAssessment && onNavigateToAssessment && (
                <button
                  onClick={onNavigateToAssessment}
                  className="btn btn-primary w-full justify-between text-xs font-bold"
                >
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Take PM Diagnostic Test</span>
                  </span>
                  <span>+15% Precision →</span>
                </button>
              )}

              {mentorEnabled && (
                <button
                  onClick={() => {
                    if (onNavigateToMentor) {
                      onNavigateToMentor(
                        `Help me build a 4-week plan to prepare for ${selectedJob.title} at ${selectedJob.company}.`
                      );
                    }
                  }}
                  className="btn btn-secondary w-full justify-between text-xs font-bold mt-2"
                >
                  <span>Close gaps with AI Mentor</span>
                  <span>→</span>
                </button>
              )}
            </aside>
          </div>
        </div>
      ) : activeSubTab === 'tracker' ? (
        /* ========================================================
            2. APPLICATION TRACKER (KANBAN BOARD)
           ======================================================== */
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight m-0 text-[#201e1d]">
              Applications Tracker
            </h1>
            <div className="flex border-2 border-[rgba(32,30,29,0.15)] text-xs font-bold">
              <button
                onClick={() => setActiveSubTab('browse')}
                className="py-2 px-4 hover:bg-[rgba(32,30,29,0.06)]"
              >
                Browse Roles
              </button>
              <button className="py-2 px-4 bg-[#201e1d] text-[#f3f2f2]">
                My Applications · {applications.length}
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-auto-flow grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-[2px] bg-[rgba(32,30,29,0.15)] border-2 border-[rgba(32,30,29,0.15)] overflow-x-auto">
            {STAGES.map((stgName, stgIdx) => {
              const stageItems = applications.filter((a) => a.stage === stgName);
              const isFinal = stgIdx === 5;

              return (
                <div
                  key={stgName}
                  className="bg-[#f3f2f2] p-3.5 min-h-[380px] flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`flex justify-between items-baseline pb-2 mb-3 border-b-2 ${
                        isFinal ? 'border-[#ec3013]' : 'border-[#201e1d]'
                      }`}
                    >
                      <span className="font-extrabold text-xs text-[#201e1d]">{stgName}</span>
                      <span className="font-black text-lg text-[#201e1d]">
                        {stageItems.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {stageItems.map((item) => {
                        const matchingJob = jobs.find((j) => j.id === item.jobId);

                        return (
                          <div
                            key={item.id}
                            className="bg-[#eae9e9] border border-[rgba(32,30,29,0.15)] p-3 text-left space-y-1.5 relative group hover:border-[#201e1d] transition-colors"
                          >
                            <div className="font-extrabold text-xs text-[#201e1d] line-clamp-2">
                              {item.jobTitle}
                            </div>
                            <div className="text-[11px] text-[#605d5d]">
                              {item.company} {item.location ? `· ${item.location}` : ''}
                            </div>
                            {item.salaryRange && (
                              <div className="text-[10px] font-bold text-[#ae1800]">
                                {item.salaryRange}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-[rgba(32,30,29,0.08)]">
                              <div className="flex items-center gap-2">
                                {stgIdx < 5 && (
                                  <button
                                    onClick={() => moveApplication(item.id)}
                                    className="btn btn-ghost text-[10px] font-bold p-0 text-[#ae1800] hover:underline"
                                  >
                                    Move to {STAGES[stgIdx + 1]} →
                                  </button>
                                )}
                                {item.stage === 'Saved' && matchingJob && (
                                  <button
                                    onClick={() => handleApply(matchingJob)}
                                    className="text-[10px] font-extrabold text-[#201e1d] hover:text-[#ec3013] underline"
                                  >
                                    Apply ↗
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={async () => {
                                  const uid = user?.id || 'guest';
                                  setApplications((prev) => prev.filter((a) => a.id !== item.id));
                                  await deleteJobApplicationInDb(item.id, uid);
                                  if (item.jobId && item.stage === 'Saved') {
                                    setSavedJobIds((prev) => {
                                      const next = new Set(prev);
                                      next.delete(item.jobId!);
                                      return next;
                                    });
                                    await toggleSavedJobInDb(uid, item.jobId, true);
                                  }
                                }}
                                className="text-[10px] text-stone-400 hover:text-rose-600 transition-colors ml-auto font-medium"
                                title="Remove from tracker"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {stageItems.length === 0 && (
                        <div className="py-8 text-center text-stone-400 text-[11px]">
                          {stgName === 'Saved' ? (
                            <div className="space-y-1.5">
                              <div>No saved roles yet.</div>
                              <button
                                onClick={() => setActiveSubTab('browse')}
                                className="text-[#ec3013] hover:underline font-bold text-[11px] block mx-auto"
                              >
                                Browse & save roles →
                              </button>
                            </div>
                          ) : (
                            <span>No roles in {stgName}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================
            3. BROWSE JOBS (MODERNIST LIST VIEW)
           ======================================================== */
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight m-0 text-[#201e1d]">
              Product Jobs
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSyncLiveJobs}
                disabled={isSyncing}
                className="btn btn-secondary text-xs font-bold flex items-center gap-1.5"
                title="Aggregate live Indian PM jobs from LinkedIn, Naukri, IIMJobs & YC"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#ec3013]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Live PM Jobs (India & YC)'}</span>
              </button>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="btn btn-secondary text-xs font-bold"
              >
                + Post a Role
              </button>
              <div className="flex border-2 border-[rgba(32,30,29,0.15)] text-xs font-bold">
                <button className="py-2 px-4 bg-[#201e1d] text-[#f3f2f2]">Browse</button>
                <button
                  onClick={() => setActiveSubTab('tracker')}
                  className="py-2 px-4 hover:bg-[rgba(32,30,29,0.06)]"
                >
                  Tracker · {applications.length}
                </button>
              </div>
            </div>
          </div>

          {syncMessage && (
            <div className="p-3 bg-[#eae9e9] border border-[rgba(32,30,29,0.15)] text-xs font-bold text-[#ae1800] flex items-center justify-between animate-in fade-in duration-150">
              <span>{syncMessage}</span>
              <button onClick={() => setSyncMessage(null)} className="text-[#605d5d] hover:text-[#201e1d]">✕</button>
            </div>
          )}

          {/* Search Box with 2px Modernist Border */}
          <div className="flex border-2 border-[#201e1d] bg-[#f3f2f2]">
            <span className="grid place-items-center px-3.5">
              <Search className="w-4 h-4 text-[#201e1d]" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, companies or industries — try “Fintech” or “Remote”"
              className="input border-0 bg-transparent text-sm sm:text-base min-h-[48px] pl-0 font-medium"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            {chips.map((chip) => {
              const isActive = filterChip === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setFilterChip(chip)}
                  className={`text-xs font-bold py-1.5 px-3 border transition-colors ${
                    isActive
                      ? 'bg-[#201e1d] text-[#f3f2f2] border-[#201e1d]'
                      : 'bg-transparent text-[#201e1d] border-[rgba(32,30,29,0.15)] hover:border-[#201e1d]'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
            <div className="flex-1" />
            <span className="text-xs text-[#605d5d]">
              {filteredJobs.length} roles · sorted by match
            </span>
          </div>

          {/* Dynamic Match Calibration Bar */}
          <div className="bg-[#eae9e9] border border-[rgba(32,30,29,0.15)] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-[#ae1800] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Match Calibration:</span>
              </span>
              <span className="font-semibold text-[#201e1d]">
                Experience: <strong>{userYears} Years</strong> (
                {profile?.pmStage === 'fresher'
                  ? 'Fresher'
                  : profile?.pmStage === 'switching_roles'
                  ? 'Career Switcher'
                  : 'Practicing PM'}
                )
              </span>
              <span className="text-[#605d5d]">·</span>
              <span className="font-semibold text-[#201e1d]">
                PM Diagnostic: {hasTakenAssessment ? (
                  <strong className="text-emerald-700 inline-flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600 inline" /> {userTestScore}% Verified
                  </strong>
                ) : (
                  <span className="text-amber-800 font-medium">Baseline (~65% unverified)</span>
                )}
              </span>
            </div>
            {!hasTakenAssessment && onNavigateToAssessment && (
              <button
                onClick={onNavigateToAssessment}
                className="btn btn-secondary text-[11px] font-bold py-1 px-2.5"
              >
                Verify PM Diagnostic Score →
              </button>
            )}
          </div>

          {/* Job Rows */}
          <div className="border-t-2 border-[rgba(32,30,29,0.15)] divide-y divide-[rgba(32,30,29,0.15)]">
            {filteredJobs.map((j) => {
              const jMatch = calculateJobMatch(j, profile, userTestScore);
              return (
                <div
                  key={j.id}
                  onClick={() => setSelectedJob(j)}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[rgba(32,30,29,0.03)] px-1 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-lg sm:text-xl text-[#201e1d] leading-snug hover:text-[#ae1800] transition-colors">
                        {j.title}
                      </span>
                      {renderSourceBadge(j.source)}
                    </div>
                    <div className="text-xs text-slate-600 my-1">
                      {j.company} · {j.location}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mt-2">
                      <span className="tag tag-neutral font-semibold">{j.salaryRange}</span>
                      <span className="tag tag-neutral">{j.level}</span>
                      <span className="tag tag-neutral">{j.domain}</span>
                      <span className="text-[#605d5d] self-center ml-1">
                        Posted {j.postedDate || 'recently'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#ec3013] leading-none">
                        {jMatch.overallScore}%
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#605d5d]">
                        Match
                      </div>
                      <div className="text-[10px] text-[#605d5d] font-medium hidden sm:block">
                        Exp: {jMatch.experienceScore}%
                      </div>
                    </div>
                    <button
                      onClick={(e) => toggleSave(j.id, e)}
                      className="btn btn-icon btn-secondary"
                      aria-label="Save Job"
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={savedJobIds.has(j.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <div className="font-extrabold text-base text-[#201e1d]">
                  No roles match that search criteria.
                </div>
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterChip('All');
                  }}
                  className="btn btn-ghost text-xs font-bold"
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          POST A PM ROLE MODAL
         ======================================================== */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto">
          <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-lg w-full p-6 text-left space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[rgba(32,30,29,0.15)]">
              <div>
                <h3 className="font-extrabold text-lg text-[#201e1d]">Post a Verified PM Role</h3>
                <p className="text-xs text-[#605d5d]">Reach high-caliber product managers on PMVerse</p>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="btn btn-icon btn-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#201e1d] mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior PM, Monetization"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Figma"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">Domain</label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as any)}
                    className="input bg-white"
                  >
                    <option value="Fintech">Fintech</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="B2B SaaS">B2B SaaS</option>
                    <option value="Healthtech">Healthtech</option>
                    <option value="Developer Tools">Developer Tools</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">Salary Range</label>
                  <input
                    type="text"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201e1d] mb-1">Role Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of responsibilities and scope..."
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201e1d] mb-1">
                  External Application Link
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/pm-role"
                  value={newApplyUrl}
                  onChange={(e) => setNewApplyUrl(e.target.value)}
                  className="input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[rgba(32,30,29,0.15)]">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="btn btn-secondary text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="btn btn-primary text-xs font-bold px-5"
                >
                  {isPublishing ? 'Publishing...' : 'Publish to PMVerse Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Tracker Feedback Notification */}
      {trackerToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#201e1d] text-[#f3f2f2] px-4 py-3 border-2 border-[#201e1d] shadow-[4px_4px_0px_#ec3013] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#ec3013] shrink-0" />
          <span className="text-xs font-bold">{trackerToast.message}</span>
          {activeSubTab !== 'tracker' && (
            <button
              onClick={() => {
                setActiveSubTab('tracker');
                setTrackerToast(null);
              }}
              className="text-xs font-extrabold text-[#ec3013] hover:underline ml-2"
            >
              Open Tracker →
            </button>
          )}
          <button
            onClick={() => setTrackerToast(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs font-bold"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
