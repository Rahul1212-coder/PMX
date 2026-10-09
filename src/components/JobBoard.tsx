'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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

interface JobBoardProps {
  initialJobs: JobListing[];
  initialActiveSubTab?: 'browse' | 'tracker';
  onNavigateToMentor?: (prompt: string) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({
  initialJobs,
  initialActiveSubTab = 'browse',
  onNavigateToMentor,
}) => {
  const { user, profile, openAuthModal, isConfigured } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filterChip, setFilterChip] = useState('All');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'tracker'>(initialActiveSubTab);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);

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
  const [newLocation, setNewLocation] = useState('Remote / US');
  const [newType, setNewType] = useState<JobListing['type']>('Remote');
  const [newSalary, setNewSalary] = useState('$140k–$180k');
  const [newDescription, setNewDescription] = useState('');
  const [newSkills, setNewSkills] = useState('Product Strategy, Roadmapping, Analytics');
  const [newApplyUrl, setNewApplyUrl] = useState('');

  // Load real jobs & applications from database
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (isConfigured) {
        const dbJobs = await getJobListingsFromDb();
        if (mounted && dbJobs && dbJobs.length > 0) {
          setJobs(dbJobs);
        }
      }
      if (user) {
        if (isConfigured) {
          const ids = await getSavedJobIdsFromDb(user.id);
          if (mounted) {
            setSavedJobIds(new Set(ids));
          }
        }
        const apps = await getJobApplicationsFromDb(user.id);
        if (mounted) {
          setApplications(apps);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [user, isConfigured]);

  const toggleSave = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const isCurrentlySaved = savedJobIds.has(jobId);
    const nextSaved = new Set(savedJobIds);
    if (isCurrentlySaved) {
      nextSaved.delete(jobId);
    } else {
      nextSaved.add(jobId);
    }
    setSavedJobIds(nextSaved);

    if (isConfigured) {
      await toggleSavedJobInDb(user.id, jobId, isCurrentlySaved);
    }
  };

  const handleApply = async (job: JobListing) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const existing = applications.find((a) => a.jobId === job.id || (a.jobTitle === job.title && a.company === job.company));
    if (!existing) {
      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        userId: user.id,
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
    }
    if (job.applyUrl && job.applyUrl !== '#') {
      window.open(job.applyUrl, '_blank');
    }
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

  const chips = ['All', 'Remote', 'Fintech', 'AI', 'Senior', 'Entry level'];

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.domain.toLowerCase().includes(q);

    let matchesChip = true;
    if (filterChip === 'Remote') matchesChip = j.type === 'Remote' || j.location.toLowerCase().includes('remote');
    else if (filterChip === 'Fintech') matchesChip = j.domain === 'Fintech';
    else if (filterChip === 'AI') matchesChip = j.domain.includes('AI') || j.title.includes('AI');
    else if (filterChip === 'Senior') matchesChip = j.level.includes('Senior') || j.level.includes('Lead');
    else if (filterChip === 'Entry level') matchesChip = j.level.includes('Associate') || j.level.includes('Intern');

    return matchesSearch && matchesChip;
  });

  const matchFactors = [
    { name: 'Experience', w: 20, s: 18 },
    { name: 'Skills & Frameworks', w: 30, s: 25 },
    { name: 'Industry Background', w: 15, s: 15 },
    { name: 'Location Preference', w: 10, s: 10 },
    { name: 'Role Alignment', w: 15, s: 14 },
    { name: 'Career Goals', w: 10, s: 9 },
  ];

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
              <div className="text-xs uppercase tracking-widest text-[#ae1800] font-bold">
                {selectedJob.company}
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

            {/* Right Sidebar: Match Analysis Breakdown */}
            <aside className="border-2 border-[#201e1d] p-6 bg-[#f3f2f2] space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-[#ec3013] leading-none tracking-tighter">
                  {selectedJob.matchScore || 88}%
                </span>
                <span className="font-extrabold text-xs uppercase tracking-wider text-[#201e1d]">
                  Match
                </span>
              </div>
              <div className="text-xs text-[#605d5d]">
                Calculated from your verified profile competency and assessment diagnostic.
              </div>

              <div className="divide-y divide-[rgba(32,30,29,0.15)] pt-2">
                {matchFactors.map((f, i) => (
                  <div key={i} className="py-2">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>
                        {f.name} <span className="text-slate-400">· {f.w}%</span>
                      </span>
                      <span className="font-bold">
                        {f.s} / {f.w}
                      </span>
                    </div>
                    <div className="h-1 bg-[#d7d3d3]">
                      <div
                        className="h-full bg-[#201e1d]"
                        style={{ width: `${(f.s / f.w) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-2">
                  Why It Fits
                </div>
                <div className="text-xs space-y-1 font-semibold text-[#201e1d]">
                  <div>✓ Verified background in product delivery</div>
                  <div>✓ Matches your target domain: {selectedJob.domain}</div>
                  <div>✓ Strong fit for role seniority level</div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onNavigateToMentor) {
                    onNavigateToMentor(
                      `Help me build a 4-week plan to prepare for ${selectedJob.title} at ${selectedJob.company}.`
                    );
                  }
                }}
                className="btn btn-secondary w-full justify-between text-xs font-bold mt-4"
              >
                <span>Close gaps with AI Mentor</span>
                <span>→</span>
              </button>
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
                      {stageItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#eae9e9] border border-[rgba(32,30,29,0.15)] p-3 text-left space-y-1 relative group"
                        >
                          <div className="font-extrabold text-xs text-[#201e1d] line-clamp-2">
                            {item.jobTitle}
                          </div>
                          <div className="text-[11px] text-[#605d5d]">
                            {item.company} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            {stgIdx < 5 && (
                              <button
                                onClick={() => moveApplication(item.id)}
                                className="btn btn-ghost text-[10px] font-bold p-0 text-[#ae1800] hover:underline"
                              >
                                Move to {STAGES[stgIdx + 1]} →
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (user) {
                                  setApplications((prev) => prev.filter((a) => a.id !== item.id));
                                  await deleteJobApplicationInDb(item.id, user.id);
                                }
                              }}
                              className="text-[10px] text-stone-400 hover:text-rose-600 transition-colors ml-auto"
                              title="Delete application"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
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

            <div className="flex items-center gap-2">
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

          {/* Job Rows */}
          <div className="border-t-2 border-[rgba(32,30,29,0.15)] divide-y divide-[rgba(32,30,29,0.15)]">
            {filteredJobs.map((j) => (
              <div
                key={j.id}
                onClick={() => setSelectedJob(j)}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[rgba(32,30,29,0.03)] px-1 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-extrabold text-lg sm:text-xl text-[#201e1d] leading-snug hover:text-[#ae1800] transition-colors">
                    {j.title}
                  </div>
                  <div className="text-xs text-slate-600 my-1">
                    {j.company} · {j.location}
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px] mt-2">
                    <span className="tag tag-neutral">{j.salaryRange}</span>
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
                      {j.matchScore || 88}%
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#605d5d]">
                      Match
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
            ))}

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
    </div>
  );
};
