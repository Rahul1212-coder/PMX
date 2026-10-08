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
        const local = localStorage.getItem('prodcraft_saved_jobs');
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
      localStorage.setItem('prodcraft_saved_jobs', JSON.stringify(Array.from(updated)));
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Curated Product Roles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verified Product Management Jobs
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Hand-picked opportunities across APM cohorts, hypergrowth scaleups, and AI-native startups with transparent compensation.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company name, or core skills (e.g. AI, SQL, Linear, Stripe)..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className={`w-full text-xs rounded-lg p-2 font-semibold transition border flex items-center justify-center space-x-1.5 ${
                showSavedOnly
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
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
              className={`bg-white rounded-2xl p-6 border transition-all ${
                job.featured
                  ? 'border-indigo-200 shadow-md ring-1 ring-indigo-500/10'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h2 className="text-base font-bold text-slate-900">{job.title}</h2>
                      {job.featured && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 flex-wrap gap-y-1">
                      <span className="font-semibold text-slate-800 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.company}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location} ({job.type})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-medium text-emerald-600">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{job.salaryRange}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                        {job.level}
                      </span>
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {job.domain}
                      </span>
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Posted {job.postedDate}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleSaveJob(job.id)}
                      title={isSaved ? 'Remove from saved' : 'Save job'}
                      className={`p-2 rounded-xl transition border ${
                        isSaved
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-indigo-600" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm shadow-indigo-200 transition"
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
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No jobs match your selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
