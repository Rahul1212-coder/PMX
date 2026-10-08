'use client';

import React, { useState, useEffect } from 'react';
import { JobListing } from '../types';
import { Briefcase, MapPin, DollarSign, ExternalLink, Search, Bookmark, BookmarkCheck, Sparkles, Building2, PlusCircle, LogIn, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSavedJobIdsFromDb, toggleSavedJobInDb, getJobListingsFromDb, insertJobListingToDb } from '@/lib/supabase/database';

interface JobBoardProps {
  initialJobs: JobListing[];
}

export const JobBoard: React.FC<JobBoardProps> = ({ initialJobs }) => {
  const { user, profile, openAuthModal, isConfigured } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLevel, setNewLevel] = useState<JobListing['level']>('Product Manager');
  const [newDomain, setNewDomain] = useState<JobListing['domain']>('B2B SaaS');
  const [newLocation, setNewLocation] = useState('Remote / US');
  const [newType, setNewType] = useState<JobListing['type']>('Remote');
  const [newSalary, setNewSalary] = useState('$130,000 - $160,000');
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
        if (mounted && dbJobs) {
          setJobs(dbJobs);
        }
      }

      if (user && isConfigured) {
        const ids = await getSavedJobIdsFromDb(user.id);
        if (mounted) {
          setSavedJobIds(new Set(ids));
        }
      } else if (typeof window !== 'undefined') {
        const local = localStorage.getItem('pmverse_saved_jobs') || localStorage.getItem('prodcraft_saved_jobs');
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

  const filteredJobs = jobs.filter((job) => {
    const matchLevel = selectedLevel === 'All' || job.level === selectedLevel;
    const matchDomain = selectedDomain === 'All' || job.domain === selectedDomain;
    const matchType = selectedType === 'All' || job.type === selectedType;
    const matchSaved = !showSavedOnly || savedJobIds.has(job.id);
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    return matchLevel && matchDomain && matchType && matchSaved && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1c053a] via-[#2d0957] to-[#4c1d95] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute -right-6 -bottom-6 w-56 h-56 opacity-15 pointer-events-none">
          <img src="/pmverse-icon.png" alt="PMVerse Icon" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 text-purple-200 border border-white/20 px-3.5 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-md">
            <Briefcase className="w-3.5 h-3.5 text-purple-300" />
            <span>Product Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            PMVerse Verified Job Board
          </h1>
          <p className="mt-2 text-purple-100/90 text-sm sm:text-base leading-relaxed">
            Real opportunities posted by product leaders and squads. Transparent compensation, mission clarity, and direct applications.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('signin');
                  return;
                }
                setIsPostModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a PM Role</span>
            </button>

            {!user && (
              <button
                onClick={() => openAuthModal('signin')}
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition text-xs sm:text-sm backdrop-blur-md"
              >
                <LogIn className="w-4 h-4 text-purple-300" />
                <span>Sign in to Bookmark</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company name, or core skills (e.g. AI, SQL, Linear, Stripe)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-purple-50/30 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full text-xs bg-purple-50/40 border border-purple-100 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full text-xs bg-purple-50/40 border border-purple-100 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Workplace Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs bg-purple-50/40 border border-purple-100 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bookmarks</label>
            <button
              type="button"
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`w-full text-xs rounded-xl p-2.5 font-bold transition border flex items-center justify-center space-x-1.5 ${
                showSavedOnly
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border-transparent shadow-md shadow-purple-500/20'
                  : 'bg-purple-50/50 text-purple-900 border-purple-100 hover:bg-purple-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-500" />
              <span>Saved Roles ({savedJobIds.size})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const isSaved = savedJobIds.has(job.id);
          return (
            <div
              key={job.id}
              className={`bg-white rounded-3xl p-6 border transition-all ${
                job.featured
                  ? 'border-purple-300 shadow-md ring-1 ring-purple-500/20'
                  : 'border-purple-100/80 shadow-sm hover:border-purple-200 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-xl flex items-center justify-center border border-purple-200 flex-shrink-0">
                    {job.logo || '💼'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h2 className="text-base font-bold text-slate-900">{job.title}</h2>
                      {job.featured && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 flex-wrap gap-y-1">
                      <span className="font-semibold text-purple-950 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-purple-500" />
                        <span>{job.company}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{job.location} ({job.type})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-bold text-emerald-600">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{job.salaryRange}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg">
                        {job.level}
                      </span>
                      <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-lg border border-purple-100">
                        {job.domain}
                      </span>
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-50">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Posted {job.postedDate}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleSaveJob(job.id)}
                      title={isSaved ? 'Remove from saved' : 'Save job'}
                      className={`p-2 rounded-xl transition border ${
                        isSaved
                          ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm'
                          : 'bg-white text-slate-400 border-purple-100 hover:text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-purple-700" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-purple-100/80 shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-violet-50 rounded-2xl flex items-center justify-center p-2 border border-purple-200/60 shadow-sm">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {search || showSavedOnly ? 'No matching job opportunities' : 'No PM Roles Posted Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {showSavedOnly
                  ? 'You haven’t bookmarked any jobs yet. Browse listings and click the bookmark icon to save roles.'
                  : 'Be the first to post a product opportunity in PMVerse! Whether hiring for APMs or Staff Product Managers, connect with talented builders.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal('signin');
                    return;
                  }
                  setIsPostModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{user ? 'Post First PM Role' : 'Sign In to Post a Role'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Posting a Job */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-purple-100 my-8">
            <div className="flex items-center justify-between border-b border-purple-50 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Post a PM Opportunity</h3>
                <p className="text-xs text-purple-700">Reach motivated Product Managers across PMVerse</p>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Product Manager - Growth"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme SaaS"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco / Remote"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full text-xs p-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {levels.filter((l) => l !== 'All').map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain</label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as any)}
                    className="w-full text-xs p-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {domains.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs p-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Compensation Range</label>
                <input
                  type="text"
                  placeholder="e.g. $140,000 - $180,000 + Equity"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Description & Mission</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe squad objectives, scope, and key deliverables..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. PLG, Experimentation, SQL, Roadmapping"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Application URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://company.com/careers/pm"
                  value={newApplyUrl}
                  onChange={(e) => setNewApplyUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-purple-50">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl shadow-md shadow-purple-500/20 transition flex items-center space-x-1.5"
                >
                  {isPublishing ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Publish Role</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
