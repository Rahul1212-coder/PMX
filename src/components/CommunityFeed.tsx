'use client';

import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { ThumbsUp, MessageSquare, Tag, PlusCircle, Search, Pin, Share2, Database, Sparkles, LogIn } from 'lucide-react';
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
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center space-x-1 bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-indigo-100">
              <Database className="w-3 h-3" />
              <span>{isDbLoaded ? 'Live Supabase Sync' : isConfigured ? 'Supabase Ready' : 'In-Memory / Demo Feed'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Product Manager Community & Brain Trust
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base">
            Discuss real-world tradeoffs, tear down product roadmaps, share case studies, and get feedback from experienced APMs to CPOs.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleStartPost}
              className="inline-flex items-center space-x-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-4 py-2 rounded-xl shadow transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Share Insight or Ask Question</span>
            </button>

            {!user && (
              <button
                onClick={() => openAuthModal('signin')}
                className="inline-flex items-center space-x-2 bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold px-4 py-2 rounded-xl border border-white/20 transition text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in to participate</span>
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
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions & tags..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
          >
            {/* Header: Author & Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-sm">{post.author.name}</span>
                    <span className="text-xs text-slate-400">• {post.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {post.author.role} @ <span className="text-slate-700">{post.author.company}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {post.pinned && (
                  <span className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                    <Pin className="w-3 h-3" />
                    <span>Pinned</span>
                  </span>
                )}
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Title & Content */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUpvote(post.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    post.hasUpvoted
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.upvotes}</span>
                </button>

                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount} Comments</span>
                </button>
              </div>

              <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No discussions match your filter.</p>
          </div>
        )}
      </div>

      {/* Modal for Creating New Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Start a PM Discussion</h3>
                <p className="text-xs text-slate-500">
                  Posting as <span className="font-semibold text-slate-800">{profile?.fullName}</span> ({profile?.role})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do you handle conflicting OKRs between Growth and Core product squads?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Strategy">Strategy</option>
                  <option value="Execution">Execution</option>
                  <option value="AI & Tech">AI & Tech</option>
                  <option value="Career & Transition">Career & Transition</option>
                  <option value="Case Study">Case Study</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Question</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share context, metrics, your current thoughts, and specific areas where you'd like community advice..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. OKRs, SquadAlignment, Roadmaps"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow flex items-center space-x-1.5"
                >
                  {isPublishing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Publish Post</span>
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
