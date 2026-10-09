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
  Bell,
  FileCheck,
  Award,
  ChevronRight,
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

  // Load real jobs and saved jobs from Supabase or localStorage
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (isConfigured) {
        const dbJobs = await getJobListingsFromDb();
        if (mounted && dbJobs) {
          setJobs(dbJobs);
        }
      } else if (typeof window !== 'undefined') {
        const local = localStorage.getItem('pmverse_jobs');
        if (local && mounted) {
          try {
            setJobs(JSON.parse(local));
          } catch {
            // ignore
          }
        }
      }

      if (user && isConfigured) {
        const ids = await getSavedJobIdsFromDb(user.id);
        if (mounted) {
          setSavedJobIds(new Set(ids));
        }
      } else if (typeof window !== 'undefined') {
        const local = localStorage.getItem('pmverse_saved_jobs') || localStorage.getItem('prodin_saved_jobs');
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
      localStorage.setItem('pmverse_saved_jobs', JSON.stringify(Array.from(updated)));
    }

    if (isConfigured) {
      await toggleSavedJobInDb(user.id, jobId, currentlySaved);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    setIsPublishing(true);

    const created: JobListing = {
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
      skills: newSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      applyUrl: newApplyUrl.trim() || '#',
      featured: true,
      postedDate: 'Just now',
      applicantsCount: 1,
    };

    const updatedJobs = [created, ...jobs];
    setJobs(updatedJobs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmverse_jobs', JSON.stringify(updatedJobs));
    }

    if (isConfigured) {
      await insertJobListingToDb(created);
    }

    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    setIsPublishing(false);
    setIsPostModalOpen(false);
  };

  const handleEasyApplySubmit = () => {
    if (easyApplyJob) {
      setAppliedJobIds((prev) => new Set(prev).add(easyApplyJob.id));
      alert(`Application for ${easyApplyJob.title} at ${easyApplyJob.company} submitted with your verified PM profile!`);
      setEasyApplyJob(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchLevel = selectedLevel === 'All' || job.level === selectedLevel;
    const matchDomain = selectedDomain === 'All' || job.domain === selectedDomain;
    const matchType = selectedType === 'All' || job.type === selectedType;
    const matchSaved = !showSavedOnly || savedJobIds.has(job.id);
    const matchLocation =
      !locationSearch ||
      job.location.toLowerCase().includes(locationSearch.toLowerCase()) ||
      job.type.toLowerCase().includes(locationSearch.toLowerCase());
    const matchSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    return matchLevel && matchDomain && matchType && matchSaved && matchLocation && matchSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start text-left">
      {/* Left Column: Job seeker shortcuts (LinkedIn Jobs layout) */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
        <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3.5">
          <div className="divide-y divide-slate-100 text-xs font-semibold">
            <button
              onClick={() => setShowSavedOnly(false)}
              className="w-full py-2.5 flex items-center justify-between text-slate-800 hover:text-[#0a66c2] text-left"
            >
              <span className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>Explore PM Jobs</span>
              </span>
            </button>

            <button
              onClick={() => setShowSavedOnly(true)}
              className="w-full py-2.5 flex items-center justify-between text-slate-800 hover:text-[#0a66c2] text-left"
            >
              <span className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-slate-500" />
                <span>My Saved Jobs</span>
              </span>
              <span className="text-[#0a66c2] font-bold">{savedJobIds.size}</span>
            </button>

            <div className="py-2.5 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <span>PM Job Alerts</span>
              </span>
              <span className="text-slate-400">3</span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-slate-500" />
                <span>Applied Jobs</span>
              </span>
              <span className="text-slate-400">{appliedJobIds.size}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Interview Prep</span>
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                if (!user) openAuthModal('signin');
                else setIsPostModalOpen(true);
              }}
              className="w-full py-1.5 px-3 rounded-full text-xs font-semibold text-[#0a66c2] border border-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2 transition flex items-center justify-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post a PM Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Search + Filters + Job Cards Stream */}
      <div className="flex-1 min-w-0 w-full space-y-3">
        {/* Search & Filter Header Box */}
        <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Product Management Opportunities
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted roles across Associate PM, Senior PM, and VP of Product squads.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition flex items-center space-x-1.5 ${
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

          {/* Dual Search Input Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, skills, or company (e.g. Stripe, Linear)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#edf3f8] hover:bg-[#e4ecf4] focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 border border-transparent rounded-md outline-none text-[#191919]"
              />
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="City, state, or Remote..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#edf3f8] hover:bg-[#e4ecf4] focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 border border-transparent rounded-md outline-none text-[#191919]"
              />
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#e0dfdc] bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'All' ? 'Seniority Level: All' : lvl}
                </option>
              ))}
            </select>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#e0dfdc] bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
            >
              {domains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom === 'All' ? 'Domain: All' : dom}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#e0dfdc] bg-white text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
            >
              {types.map((tp) => (
                <option key={tp} value={tp}>
                  {tp === 'All' ? 'Workplace: All' : tp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            Recommended PM Roles based on your profile
          </h2>
          <span className="text-xs text-slate-500">
            {filteredJobs.length} roles available
          </span>
        </div>

        {/* Job Cards Stream (LinkedIn Jobs style) */}
        <div className="space-y-2.5">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0a66c2] mx-auto flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {showSavedOnly ? 'No saved PM roles yet' : 'No product management roles posted yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {showSavedOnly
                  ? 'Click the bookmark icon on any job listing to save opportunities for quick access.'
                  : 'Are you hiring for your product squad? Post an opening across APM, Senior PM, and Leadership squads to reach verified PMs.'}
              </p>
              {!showSavedOnly && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!user) openAuthModal('signin');
                      else setIsPostModalOpen(true);
                    }}
                    className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] transition shadow-xs"
                  >
                    Post the First PM Role
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            const hasApplied = appliedJobIds.has(job.id);

            return (
              <div
                key={job.id}
                className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5 min-w-0">
                    {/* Logo square */}
                    <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 flex-shrink-0">
                      {job.logo}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 hover:text-[#0a66c2] hover:underline cursor-pointer transition">
                          {job.title}
                        </h3>
                        {job.featured && (
                          <span className="bg-sky-50 text-[#0a66c2] text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                            Promoted
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 font-semibold mt-0.5">
                        {job.company}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location} ({job.type})</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">
                          {job.salaryRange}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Actively recruiting • 2 days ago • Over 100 applicants</span>
                      </p>

                      {/* Skills match badge */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Matches your PM profile</span>
                        </span>
                        {job.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bookmark Save Button */}
                  <button
                    onClick={() => handleToggleSaveJob(job.id)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#0a66c2] transition"
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-[#0a66c2] fill-[#0a66c2]" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Job Action Footer */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500 line-clamp-1 flex-1 mr-4">
                    {job.description}
                  </p>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {hasApplied ? (
                      <span className="px-4 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#0a66c2] text-white hover:bg-[#004182] transition shadow-xs flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Easy Apply</span>
                      </button>
                    )}

                    {job.applyUrl && job.applyUrl !== '#' && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100"
                        title="Company application page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Easy Apply Modal (LinkedIn style) */}
      {easyApplyJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl border border-[#e0dfdc] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-lg border border-slate-200">
                  {easyApplyJob.logo}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Apply to {easyApplyJob.company}
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

            <div className="space-y-3 text-xs">
              <div className="bg-sky-50/60 p-3 rounded-md border border-sky-100">
                <p className="font-semibold text-slate-800">
                  Verified Candidate Profile
                </p>
                <p className="text-slate-600 mt-0.5">
                  Your PM identity (<strong>{profile?.fullName || user?.email}</strong>) and verified assessment fit score (88%) will be submitted directly to {easyApplyJob.company}.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ''}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Brief Note to Hiring Squad (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a sentence about a relevant product outcome you delivered or why you're excited about this squad..."
                  className="w-full p-2.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#0a66c2]"
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
                className="px-5 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full transition shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post a Job Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl border border-[#e0dfdc] text-left">
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
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-[#0a66c2] outline-none"
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
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-[#0a66c2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seniority Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md outline-none"
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
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="$160,000 - $210,000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md outline-none"
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
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md outline-none"
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
                  className="px-5 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full transition shadow-xs"
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
