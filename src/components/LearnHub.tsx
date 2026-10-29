'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LearningItem,
  LearningItemType,
  LearningCategory,
  LearningDifficulty,
} from '@/types/learning';
import { INITIAL_LEARNING_ITEMS } from '@/lib/learning/initialData';
import { ConceptReader } from '@/components/learning/ConceptReader';
import { CaseStudyReader } from '@/components/learning/CaseStudyReader';
import { TeardownReader } from '@/components/learning/TeardownReader';
import { VerseAiGenerateModal } from '@/components/learning/GeminiGenerateModal';
import { isAiMentorEnabled } from '@/lib/features';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  Clock,
  Filter,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface LearnHubProps {
  initialTerm?: string;
  onAskMentor?: (query: string) => void;
}

const CATEGORIES: LearningCategory[] = [
  'Product Thinking',
  'Metrics & Data',
  'Prioritization & Strategy',
  'User Discovery',
  'Execution & Tech',
  'Growth & Monetization',
];

export const LearnHub: React.FC<LearnHubProps> = ({
  initialTerm = 'pmf',
  onAskMentor,
}) => {
  const { user, openAuthModal } = useAuth();
  const mentorEnabled = isAiMentorEnabled();

  // Materials state initialized with initial curriculum for instant zero-latency render
  const [items, setItems] = useState<LearningItem[]>(INITIAL_LEARNING_ITEMS);
  const [selectedSlug, setSelectedSlug] = useState<string>('concept-pmf');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justPublishedTitle, setJustPublishedTitle] = useState<string | null>(null);

  // Filters
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | LearningItemType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch updated / published materials on mount
  useEffect(() => {
    let isMounted = true;
    async function loadMaterials() {
      try {
        const res = await fetch('/api/learn');
        if (res.ok) {
          const data = await res.json();
          if (data.materials && Array.isArray(data.materials) && isMounted) {
            setItems(data.materials);
          }
        }
      } catch (err) {
        console.error('Failed to load published learning materials:', err);
      }
    }
    loadMaterials();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle initialTerm passed from home dashboard or URL
  useEffect(() => {
    if (!initialTerm) return;
    const clean = initialTerm.toLowerCase();
    const matched = items.find(
      (it) =>
        it.slug.toLowerCase() === clean ||
        it.slug.toLowerCase() === `concept-${clean}` ||
        it.slug.toLowerCase().includes(clean) ||
        it.id.toLowerCase() === clean
    );
    if (matched) {
      setSelectedSlug(matched.slug);
    }
  }, [initialTerm, items]);

  // Filtered materials
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (activeTypeTab !== 'all' && item.type !== activeTypeTab) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && item.difficulty !== selectedDifficulty) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCompany =
          item.caseStudyDetail?.company.toLowerCase().includes(q) ||
          item.teardownDetail?.company.toLowerCase().includes(q);

        if (!matchesTitle && !matchesSummary && !matchesTags && !matchesCompany) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTypeTab, selectedCategory, selectedDifficulty, searchQuery]);

  // Active item
  const activeItem = useMemo(() => {
    const found = items.find((it) => it.slug === selectedSlug);
    if (found) return found;
    return filteredItems[0] || items[0];
  }, [items, selectedSlug, filteredItems]);

  const handleSelectRelated = (relatedKey: string) => {
    const cleanKey = relatedKey.toLowerCase();
    const found = items.find(
      (it) =>
        it.slug.toLowerCase() === cleanKey ||
        it.slug.toLowerCase() === `concept-${cleanKey}` ||
        it.slug.toLowerCase().includes(cleanKey)
    );
    if (found) {
      setSelectedSlug(found.slug);
    }
  };

  const handleMaterialPublished = (newItem: LearningItem) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.slug === newItem.slug);
      if (exists) {
        return prev.map((it) => (it.slug === newItem.slug ? newItem : it));
      }
      return [newItem, ...prev];
    });
    setSelectedSlug(newItem.slug);
    setJustPublishedTitle(newItem.title);
    setTimeout(() => {
      setJustPublishedTitle(null);
    }, 5000);
  };

  // Type counts for tabs
  const typeCounts = useMemo(() => {
    return {
      all: items.length,
      concept: items.filter((it) => it.type === 'concept').length,
      case_study: items.filter((it) => it.type === 'case_study').length,
      teardown: items.filter((it) => it.type === 'teardown').length,
    };
  }, [items]);

  return (
    <div className="text-left space-y-6 pb-12">
      {/* 1. Header Banner & Gemini Generator Trigger */}
      <div className="bg-[#201e1d] text-[#f3f2f2] p-6 sm:p-8 border-2 border-[#201e1d] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest bg-[#ec3013] text-white px-2.5 py-0.5">
                Curriculum Hub
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {items.length} Production PM Modules
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white m-0">
              PM Knowledge & Case Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Foundational frameworks, real-world telemetry case studies with practice Q&A, and in-depth product teardowns designed to train aspiring Product Managers.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal?.('login');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="btn btn-primary text-xs sm:text-sm font-black py-3 px-5 flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>⚡ Generate with VerseAI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Just Published Success Toast */}
      {justPublishedTitle && (
        <div className="bg-emerald-50 border-2 border-emerald-500 p-4 flex items-center justify-between text-xs text-emerald-950 font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Successfully published &ldquo;{justPublishedTitle}&rdquo; to the Knowledge Hub!</span>
          </div>
          <button
            onClick={() => setJustPublishedTitle(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs uppercase tracking-wider font-extrabold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Type Tabs & Filter Bar */}
      <div className="space-y-3">
        {/* Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-[rgba(32,30,29,0.15)] pb-2">
          <button
            onClick={() => setActiveTypeTab('all')}
            className={`px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 -mb-[10px] ${
              activeTypeTab === 'all'
                ? 'border-[#ec3013] text-[#ec3013] bg-white'
                : 'border-transparent text-[#605d5d] hover:text-[#201e1d]'
            }`}
          >
            <span>All Materials</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold">
              {typeCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTypeTab('concept')}
            className={`px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 -mb-[10px] ${
              activeTypeTab === 'concept'
                ? 'border-[#ec3013] text-[#ec3013] bg-white'
                : 'border-transparent text-[#605d5d] hover:text-[#201e1d]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Concepts & Frameworks</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold">
              {typeCounts.concept}
            </span>
          </button>

          <button
            onClick={() => setActiveTypeTab('case_study')}
            className={`px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 -mb-[10px] ${
              activeTypeTab === 'case_study'
                ? 'border-[#ec3013] text-[#ec3013] bg-white'
                : 'border-transparent text-[#605d5d] hover:text-[#201e1d]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span>Case Studies (Q&A)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold">
              {typeCounts.case_study}
            </span>
          </button>

          <button
            onClick={() => setActiveTypeTab('teardown')}
            className={`px-3.5 py-2 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 -mb-[10px] ${
              activeTypeTab === 'teardown'
                ? 'border-[#ec3013] text-[#ec3013] bg-white'
                : 'border-transparent text-[#605d5d] hover:text-[#201e1d]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Product Teardowns</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold">
              {typeCounts.teardown}
            </span>
          </button>
        </div>

        {/* Sub-Filters (Search, Category, Difficulty) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white p-3 border border-[rgba(32,30,29,0.15)] shadow-sm">
          <div className="sm:col-span-5 flex items-center bg-[#f3f2f2] px-3 py-1.5 border border-[rgba(32,30,29,0.2)]">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, companies, metrics..."
              className="w-full text-xs bg-transparent outline-none font-medium text-[#201e1d]"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-bold p-1.5 bg-[#f3f2f2] border border-[rgba(32,30,29,0.2)] text-[#201e1d] outline-none"
            >
              <option value="all">All Categories ({items.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-xs font-bold p-1.5 bg-[#f3f2f2] border border-[rgba(32,30,29,0.2)] text-[#201e1d] outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Master / Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-8 items-start">
        {/* Left Column: Material Selector List */}
        <aside className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-600 px-1">
            <span>Library ({filteredItems.length})</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-[#ec3013] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-6 bg-white border border-[rgba(32,30,29,0.15)] text-center space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                No materials match your filter criteria.
              </p>
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal?.('login');
                    return;
                  }
                  setIsModalOpen(true);
                }}
                className="btn btn-primary text-xs font-bold py-2 px-3 mx-auto flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate &ldquo;{searchQuery}&rdquo; with VerseAI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isSelected = activeItem && activeItem.slug === item.slug;
                const isTeardown = item.type === 'teardown';
                const isCaseStudy = item.type === 'case_study';

                return (
                  <div
                    key={item.id || item.slug}
                    onClick={() => setSelectedSlug(item.slug)}
                    className={`p-3.5 cursor-pointer border-2 transition-all text-left relative ${
                      isSelected
                        ? 'bg-white border-[#ec3013] shadow-md border-l-4 border-l-[#ec3013]'
                        : 'bg-white border-[rgba(32,30,29,0.15)] hover:border-[#201e1d]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 ${
                            isTeardown
                              ? 'bg-emerald-100 text-emerald-900'
                              : isCaseStudy
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {isTeardown
                            ? 'Teardown'
                            : isCaseStudy
                            ? 'Case Study'
                            : 'Concept'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{item.readTimeMinutes}m</span>
                      </div>
                    </div>

                    <div className="font-extrabold text-xs sm:text-[13px] text-[#201e1d] leading-snug line-clamp-2">
                      {item.title}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 font-medium leading-snug">
                      {item.summary}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{item.category}</span>
                      {isSelected && (
                        <span className="text-[#ec3013] flex items-center gap-0.5 font-extrabold">
                          Viewing <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prompt to generate more */}
          <div className="p-4 bg-[#f3f2f2] border-2 border-dashed border-[rgba(32,30,29,0.2)] text-center space-y-2">
            <div className="text-xs font-black text-[#201e1d]">
              Need a specific topic or case?
            </div>
            <p className="text-[11px] text-slate-600">
              VerseAI can create a custom case study, concept guide, or product teardown in seconds.
            </p>
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal?.('login');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="btn btn-secondary text-xs font-bold py-1.5 px-3 mx-auto flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ec3013]" />
              <span>Generate Topic with VerseAI</span>
            </button>
          </div>
        </aside>

        {/* Right Column: Full Detail Article Reader */}
        <main className="min-w-0 bg-white border border-[rgba(32,30,29,0.15)] p-5 sm:p-8 shadow-sm">
          {activeItem ? (
            <div className="space-y-6">
              {/* Article Top Meta */}
              <div className="border-b-2 border-[rgba(32,30,29,0.15)] pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-black text-[#ec3013]">
                      {activeItem.category}
                    </span>
                    <span className="text-slate-300 font-bold">·</span>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-600">
                      {activeItem.difficulty} level
                    </span>
                    <span className="text-slate-300 font-bold">·</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ⏱ {activeItem.readTimeMinutes} min read
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {activeItem.author?.isAi ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Curated by VerseAI</span>
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        PMVerse Staff Verified
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#201e1d] m-0 leading-tight">
                  {activeItem.title}
                </h1>

                {/* Tags */}
                {activeItem.tags && activeItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeItem.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="text-[11px] font-semibold bg-[#f3f2f2] text-slate-700 px-2 py-0.5 hover:bg-slate-200"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specific Reader Component Depending on Type */}
              {activeItem.type === 'concept' && (
                <ConceptReader
                  item={activeItem}
                  onSelectRelated={handleSelectRelated}
                  onAskMentor={
                    mentorEnabled && onAskMentor
                      ? (termName) => onAskMentor(termName)
                      : undefined
                  }
                />
              )}

              {activeItem.type === 'case_study' && (
                <CaseStudyReader
                  item={activeItem}
                  onAskMentor={
                    mentorEnabled && onAskMentor
                      ? (query) => onAskMentor(query)
                      : undefined
                  }
                />
              )}

              {activeItem.type === 'teardown' && (
                <TeardownReader
                  item={activeItem}
                  onAskMentor={
                    mentorEnabled && onAskMentor
                      ? (query) => onAskMentor(query)
                      : undefined
                  }
                />
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select an item from the library to view details.
            </div>
          )}
        </main>
      </div>

      {/* 4. VerseAI Generator Modal */}
      <VerseAiGenerateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMaterialPublished={handleMaterialPublished}
      />
    </div>
  );
};
