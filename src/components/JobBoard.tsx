'use client';

import React, { useState, useEffect } from 'react';
import { JobListing } from '../types';
import {
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  Search,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Building2,
  PlusCircle,
  LogIn,
  X,
  Check,
  Send,
  Users,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getSavedJobIdsFromDb,
  toggleSavedJobInDb,
  getJobListingsFromDb,
  insertJobListingToDb,
} from '@/lib/supabase/database';

interface JobBoardProps {
  initialJobs: JobListing[];
}

export const JobBoard: React.FC<JobBoardProps> = ({ initialJobs }) => {
  const { user, profile, openAuthModal, isConfigured } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [easyApplyJob, setEasyApplyJob] = useState<JobListing | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLevel, setNewLevel] = useState<JobListing['level']>('Product Manager');
  const [newDomain, setNewDomain] = useState<JobListing['domain']>('B2B SaaS');
  const [newLocation, setNewLocation] = useState('Remote / US');
  const [newType, setNewType] = useState<JobListing['type']>('Remote');
  const [newSalary, setNewSalary] = useState('$140,000 - $180,000 + Equity');
  const [newDescription, setNewDescription] = useState('');
  const [newSkills, setNewSkills] = useState('Roadmapping, Discovery, SQL');
  const [newApplyUrl, setNewApplyUrl] = useState('');

  const levels = ['All', 'Associate PM', 'Product Manager', 'Senior PM', 'Lead / Principal PM', 'VP of Product'];
  const domains = ['All', 'Fintech', 'AI & ML', 'B2B SaaS', 'Healthtech', 'Developer Tools'];
  const types = ['All', 'Remote', 'Hybrid', 'On-site'];

  // Load real jobs and saved jobs from Supabase
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (isConfigured) {
        const dbJobs = await getJobListingsFromDb();
        if (mounted && dbJobs && dbJobs.length > 0) {
          setJobs((prev) => {
            const existingIds = new Set(dbJobs.map((j) => j.id));
            const uniqueInitial = prev.filter((j) => !existingIds.has(j.id));
            return [...dbJobs, ...uniqueInitial];
          });
        }
      }

      if (user && isConfigured) {
        const ids = await getSavedJobIdsFromDb(user.id);
        if (mounted) {
          setSavedJobIds(new Set(ids));
        }
      } else if (typeof window !== 'undefined') {
        const local = localStorage.getItem('prodin_saved_jobs') || localStorage.getItem('pmverse_saved_jobs');
        if (local && mounted) {
          try {
            setSavedJobIds(new Set(JSON.parse(local)));
          } catch {
            // ignore
          }
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [user, isConfigured]);

  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const currentlySaved = savedJobIds.has(jobId);
    const updated = new Set(savedJobIds);
    if (currentlySaved) {
      updated.delete(jobId);
    } else {
      updated.add(jobId);
    }
    setSavedJobIds(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('prodin_saved_jobs', JSON.stringify(Array.from(updated)));
    }

    if (isConfigured && user) {
      await toggleSavedJobInDb(user.id, jobId, currentlySaved);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newDescription.trim()) return;

    setIsPublishing(true);

    const newJob: JobListing = {
      id: `job-${Date.now()}`,
      userId: user?.id,
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
      applicantsCount: 1,
      matchScore: 90,
    };

    setJobs([newJob, ...jobs]);
    setIsPostModalOpen(false);
    setNewTitle('');
    setNewCompany('');
    setNewDescription('');

    if (isConfigured) {
      await insertJobListingToDb(newJob);
    }

    setIsPublishing(false);
  };

  const handleEasyApplySubmit = () => {
    if (!easyApplyJob) return;
    setAppliedJobIds((prev) => new Set(prev).add(easyApplyJob.id));
    alert(`Success! Application submitted for ${easyApplyJob.title} at ${easyApplyJob.company}. The recruiting team has received your PM profile.`);
    setEasyApplyJob(null);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchLevel = selectedLevel === 'All' || job.level === selectedLevel;
    const matchDomain = selectedDomain === 'All' || job.domain === selectedDomain;
    const matchType = selectedType === 'All' || job.type === selectedType;
    const matchSaved = !showSavedOnly || savedJobIds.has(job.id);
    const matchLocation = !locationSearch || job.location.toLowerCase().includes(locationSearch.toLowerCase());
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    return matchLevel && matchDomain && matchType && matchSaved && matchLocation && matchSearch;
  });

  return (
    <div className="space-y-3 text-left">
      {/* LinkedIn Jobs Top Search & Action Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span>Product Management Jobs</span>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore opportunities across APM cohorts, hypergrowth scaleups, and AI platforms.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('signin');
                  return;
                }
                setIsPostModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0a66c2] border border-[#0a66c2] hover:bg-sky-50 rounded-full transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post a PM Role</span>
            </button>

            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition flex items-center space-x-1.5 ${
                showSavedOnly
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                  : 'text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedJobIds.size})</span>
            </button>
          </div>
        </div>

        {/* Dual Search Bar (Title + Location) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, skill, or company..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="City, state, or Remote..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1">
          {/* Level selector */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === 'All' ? 'Seniority Level: All' : lvl}
              </option>
            ))}
          </select>

          {/* Domain selector */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
          >
            {domains.map((dom) => (
              <option key={dom} value={dom}>
                {dom === 'All' ? 'Domain: All' : dom}
              </option>
            ))}
          </select>

          {/* Workplace Mode selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
          >
            {types.map((tp) => (
              <option key={tp} value={tp}>
                {tp === 'All' ? 'Workplace: All' : tp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Feed (LinkedIn Job Cards) */}
      <div className="space-y-3">
        {filteredJobs.map((job) => {
          const isSaved = savedJobIds.has(job.id);
          const hasApplied = appliedJobIds.has(job.id);

          return (
            <div
              key={job.id}
              className={`bg-white rounded-lg border transition-all p-4 sm:p-5 ${
                job.featured
                  ? 'border-sky-300 ring-1 ring-sky-200/60 shadow-sm'
                  : 'border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left: Info */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 flex-shrink-0">
                    {job.logo}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 hover:text-[#0a66c2] cursor-pointer transition">
                        {job.title}
                      </h2>
                      {job.featured && (
                        <span className="bg-sky-50 text-[#0a66c2] text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                      {job.company}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location} ({job.type})</span>
                      </span>

                      <span>•</span>

                      <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>{job.salaryRange}</span>
                      </span>

                      {job.applicantsCount && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">
                            {job.applicantsCount} applicants
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-start flex-shrink-0">
                  <button
                    onClick={() => handleToggleSaveJob(job.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                    title={isSaved ? 'Unsave Job' : 'Save Job'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-[#0a66c2]" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>

                  {hasApplied ? (
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) {
                          openAuthModal('signin');
                          return;
                        }
                        setEasyApplyJob(job);
                      }}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] transition shadow-sm flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Easy Apply</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Match Score Indicator (LinkedIn style) */}
              <div className="mt-3 py-1.5 px-3 bg-sky-50/70 rounded-md border border-sky-100 flex items-center justify-between text-xs text-sky-900">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#0a66c2] animate-pulse" />
                  <span>
                    <strong>94% Match</strong> with your PM Skill Profile & Experience
                  </span>
                </div>
                <span className="text-[11px] text-[#0a66c2] font-semibold">
                  1 Connection works here
                </span>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {job.description}
              </p>

              {/* Skills and Domain Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                    Skills:
                  </span>
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {job.domain}
                </span>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center">
            <p className="text-slate-500 text-sm">No product roles found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Easy Apply Modal (LinkedIn style 1-click apply) */}
      {easyApplyJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl border">
                  {easyApplyJob.logo}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Easy Apply to {easyApplyJob.company}
                  </h3>
                  <p className="text-xs text-slate-500">{easyApplyJob.title}</p>
                </div>
              </div>

              <button
                onClick={() => setEasyApplyJob(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900">Applicant Information</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">NAME</span>
                    <span className="font-semibold">{profile?.fullName || 'Alex Rivera'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURRENT ROLE</span>
                    <span className="font-semibold">{profile?.role || 'Staff PM @ Stripe'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">EMAIL</span>
                    <span className="font-semibold">{profile?.email || 'pm@tech.com'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CERTIFIED PM SCORE</span>
                    <span className="font-semibold text-emerald-600">88% (High-Agency Leader)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Brief Note to the Hiring Squad (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a sentence about a relevant product outcome you delivered..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEasyApplyJob(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleEasyApplySubmit}
                className="px-5 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full transition shadow-sm"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post a Job Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Post a Product Management Role</h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior PM - AI Workflows"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0a66c2] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linear"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0a66c2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seniority Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Associate PM">Associate PM</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Senior PM">Senior PM</option>
                    <option value="Lead / Principal PM">Lead / Principal PM</option>
                    <option value="VP of Product">VP of Product</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA / Remote"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="$160,000 - $210,000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe squad mission, key problems to solve, and requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full transition shadow-sm"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
