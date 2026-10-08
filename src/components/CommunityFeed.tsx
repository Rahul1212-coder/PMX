'use client';

import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { ThumbsUp, MessageSquare, Tag, PlusCircle, Search, Pin, Share2, Database, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getCommunityPostsFromDb,
  insertCommunityPostToDb,
  togglePostUpvoteInDb,
} from '@/lib/supabase/database';

interface CommunityFeedProps {
  initialPosts: CommunityPost[];
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ initialPosts }) => {
  const { user, profile, openAuthModal, isConfigured } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New post state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityPost['category']>('Strategy');
  const [newTags, setNewTags] = useState('Product, Strategy');
  const [isPublishing, setIsPublishing] = useState(false);

  const categories = ['All', 'Strategy', 'Execution', 'AI & Tech', 'Career & Transition', 'Case Study'];

  // Load posts from Supabase on mount
  useEffect(() => {
    let mounted = true;
    async function loadDbPosts() {
      if (isConfigured) {
        const dbPosts = await getCommunityPostsFromDb();
        if (mounted && dbPosts && dbPosts.length > 0) {
          setPosts(dbPosts);
          setIsDbLoaded(true);
        }
      }
    }
    loadDbPosts();
    return () => {
      mounted = false;
    };
  }, [isConfigured]);

  const handleUpvote = async (id: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const currentPost = posts.find((p) => p.id === id);
    if (!currentPost) return;

    const willUpvote = !currentPost.hasUpvoted;

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            upvotes: willUpvote ? p.upvotes + 1 : Math.max(0, p.upvotes - 1),
            hasUpvoted: willUpvote,
          };
        }
        return p;
      })
    );

    // Sync to Supabase
    if (isConfigured && user) {
      await togglePostUpvoteInDb(id, user.id, !willUpvote);
    }
  };

  const handleStartPost = () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPublishing(true);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: user?.id,
      author: {
        name: profile?.fullName || 'Product Manager',
        role: profile?.role || 'Associate PM',
        company: profile?.company || 'Tech Company',
        avatar:
          profile?.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      },
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      upvotes: 1,
      hasUpvoted: true,
      commentsCount: 0,
      createdAt: 'Just now',
    };

    // Optimistic UI update
    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setIsModalOpen(false);

    // Sync to Supabase Database
    if (isConfigured) {
      await insertCommunityPostToDb(newPost);
    }

    setIsPublishing(false);
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-[#1e0538] via-[#2d0b59] to-[#4c1d95] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 opacity-15 pointer-events-none">
          <img src="/pmverse-icon.png" alt="Planet" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center space-x-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-purple-200 backdrop-blur-md">
              <Database className="w-3.5 h-3.5 text-purple-300" />
              <span>{isDbLoaded ? 'Live Supabase Sync' : isConfigured ? 'Supabase Ready' : 'In-Memory / Demo Feed'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isDbLoaded || isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            PMVerse Community & Brain Trust
          </h1>
          <p className="mt-2 text-purple-100/90 text-sm sm:text-base leading-relaxed">
            Collaborate with product leaders worldwide. Debate tradeoffs, tear down roadmaps, share frameworks, and get actionable feedback across the PM universe.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleStartPost}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Start Discussion</span>
            </button>

            {!user && (
              <button
                onClick={() => openAuthModal('signin')}
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition text-sm backdrop-blur-md"
              >
                <LogIn className="w-4 h-4 text-purple-300" />
                <span>Sign in to post</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-600'
                  : 'bg-white text-slate-700 border border-purple-100 hover:bg-purple-50/60 hover:text-purple-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions & tags..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl p-6 border border-purple-100/80 shadow-sm hover:border-purple-200 hover:shadow-md transition-all space-y-4"
          >
            {/* Header: Author & Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{post.author.name}</span>
                    <span className="text-xs text-purple-400">• {post.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {post.author.role} @ <span className="text-purple-900 font-semibold">{post.author.company}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {post.pinned && (
                  <span className="flex items-center space-x-1 text-xs text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                    <Pin className="w-3 h-3 text-purple-600" />
                    <span>Pinned</span>
                  </span>
                )}
                <span className="text-xs bg-purple-50/80 text-purple-700 px-3 py-0.5 rounded-full font-semibold border border-purple-100">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Title & Content */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 hover:text-purple-700 transition cursor-pointer">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              <Tag className="w-3.5 h-3.5 text-purple-400 mr-1" />
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-lg font-medium border border-purple-100/60"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-purple-50">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUpvote(post.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    post.hasUpvoted
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-sm shadow-purple-500/20'
                      : 'bg-purple-50/80 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.upvotes}</span>
                </button>

                <button className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>{post.commentsCount} Comments</span>
                </button>
              </div>

              <button className="text-slate-400 hover:text-purple-600 p-1.5 rounded-xl hover:bg-purple-50 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-purple-100/80 shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-violet-50 rounded-2xl flex items-center justify-center p-2 border border-purple-200/60 shadow-sm">
              <img src="/pmverse-icon.png" alt="PMVerse Icon" className="w-full h-full object-contain" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {search || selectedCategory !== 'All' ? 'No matching discussions found' : 'Welcome to the PMVerse Brain Trust'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {search || selectedCategory !== 'All'
                  ? 'Try adjusting your search terms or category filter to discover other product insights.'
                  : 'No posts published yet. Start by signing up, creating your PM profile, and sharing the very first framework teardown or roadmap dilemma!'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleStartPost}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{user ? 'Publish First Discussion' : 'Sign Up to Share First Insight'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Creating New Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between border-b border-purple-50 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Start a PM Discussion</h3>
                <p className="text-xs text-purple-700">
                  Posting as <span className="font-bold">{profile?.fullName}</span> ({profile?.role})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do you handle conflicting OKRs between Growth and Core squads?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-sm px-3.5 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                >
                  <option value="Strategy">Strategy</option>
                  <option value="Execution">Execution</option>
                  <option value="AI & Tech">AI & Tech</option>
                  <option value="Career & Transition">Career & Transition</option>
                  <option value="Case Study">Case Study</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content / Question</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share context, metrics, your thoughts, and specific areas where you'd like community advice..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. OKRs, SquadAlignment, Roadmaps"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl shadow-md shadow-purple-500/20 transition flex items-center space-x-1.5"
                >
                  {isPublishing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Publish to PMVerse</span>
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
