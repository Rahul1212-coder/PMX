'use client';

import React, { useState, useEffect } from 'react';
import { JobListing } from '../types';
import { Briefcase, MapPin, DollarSign, ExternalLink, Search, Bookmark, BookmarkCheck, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSavedJobIdsFromDb, toggleSavedJobInDb } from '@/lib/supabase/database';

interface JobBoardProps {
  initialJobs: JobListing[];
}

export const JobBoard: React.FC<JobBoardProps> = ({ initialJobs }) => {
  const { user, openAuthModal, isConfigured } = useAuth();
  const [jobs] = useState<JobListing[]>(initialJobs);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const levels = ['All', 'Associate PM', 'Product Manager', 'Senior PM', 'Lead / Principal PM', 'VP of Product'];
  const domains = ['All', 'Fintech', 'AI & ML', 'B2B SaaS', 'Healthtech', 'Developer Tools'];
  const types = ['All', 'Remote', 'Hybrid', 'On-site'];

  // Load saved jobs from Supabase or localStorage
  useEffect(() => {
    let mounted = true;
    async function loadSaved() {
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
    loadSaved();
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
            <span>Curated Product Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            PMVerse Verified Job Board
          </h1>
          <p className="mt-2 text-purple-100/90 text-sm sm:text-base leading-relaxed">
            Hand-picked roles across APM cohorts, hypergrowth scaleups, and AI-native startups with transparent compensation and clear team missions.
          </p>
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
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-100 shadow-sm flex-shrink-0"
                  />
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
          <div className="text-center py-12 bg-white rounded-3xl border border-purple-100">
            <p className="text-slate-500 text-sm">No jobs match your selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
