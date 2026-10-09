'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CommunityPost, Comment } from '../types';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';
import {
  getCommunityPostsFromDb,
  insertCommunityPostToDb,
  togglePostUpvoteInDb,
} from '@/lib/supabase/database';
import { MessageSquare, Bookmark, Share2, Send, Plus } from 'lucide-react';

interface CommunityFeedProps {
  initialPosts: CommunityPost[];
  onOpenChallenge?: () => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  initialPosts,
  onOpenChallenge,
}) => {
  const { user, profile, openAuthModal, isConfigured } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [composerText, setComposerText] = useState('');
  const [composerType, setComposerType] = useState('Question');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [pollVotes, setPollVotes] = useState<{ [postId: string]: number }>({});

  const postTypes = ['Question', 'Discussion', 'Case Study', 'Resource', 'Career Advice'];
  const categories = [
    'All',
    'Product Sense',
    'Strategy',
    'Analytics',
    'Growth',
    'AI',
    'Career',
    'Interview',
  ];

  // Derive real contributors from active community posts and engagement
  const activeContributors = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    const map = new Map<string, { id: string; name: string; initials: string; badge: string; pts: number }>();
    posts.forEach((p) => {
      const name = p.author?.name || 'Product Manager';
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'PM';
      const badge = p.author?.role || 'Community PM';
      const points = (p.upvotes || 0) * 10 + 25; // 25 pts per post + 10 pts per upvote
      const existing = map.get(name);
      if (existing) {
        existing.pts += points;
      } else {
        map.set(name, {
          id: p.id,
          name,
          initials,
          badge,
          pts: points,
        });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.pts - a.pts)
      .slice(0, 5);
  }, [posts]);

  // Load real posts from Supabase on mount
  useEffect(() => {
    let mounted = true;
    async function loadDbPosts() {
      if (isConfigured) {
        const dbPosts = await getCommunityPostsFromDb();
        if (mounted && dbPosts && dbPosts.length > 0) {
          setPosts(dbPosts);
        }
      }
    }
    loadDbPosts();
    return () => {
      mounted = false;
    };
  }, [isConfigured]);

  const handleUpvote = async (postId: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const currentlyUpvoted = Boolean(post.hasUpvoted);
    const newUpvotes = currentlyUpvoted ? Math.max(0, post.upvotes - 1) : post.upvotes + 1;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, upvotes: newUpvotes, hasUpvoted: !currentlyUpvoted } : p
      )
    );

    if (isConfigured) {
      await togglePostUpvoteInDb(postId, user.id, currentlyUpvoted);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }
    if (!composerText.trim()) return;

    const authorName =
      profile?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Product Manager';
    const authorRole = profile?.role || 'Associate PM';
    const authorCompany = profile?.company || 'Independent PM';

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: user.id,
      author: {
        name: authorName,
        role: authorRole,
        company: authorCompany,
        avatar: profile?.avatarUrl || '',
      },
      title: composerText.trim(),
      content: composerText.trim(),
      category: (selectedCat === 'All' ? 'Strategy' : selectedCat) as any,
      tags: [composerType, selectedCat === 'All' ? 'Strategy' : selectedCat],
      upvotes: 1,
      hasUpvoted: true,
      commentsCount: 0,
      createdAt: 'Just now',
      pinned: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    setComposerText('');

    if (isConfigured) {
      await insertCommunityPostToDb(newPost);
    }
  };

  const handleToggleComments = (postId: string) => {
    setActiveCommentsPostId((prev) => (prev === postId ? null : postId));
  };

  const handleAddComment = (postId: string) => {
    const text = (commentInput[postId] || '').trim();
    if (!text) return;
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      postId,
      author: {
        name: profile?.fullName || 'Product Manager',
        role: profile?.role || 'Associate PM',
        avatar: profile?.avatarUrl || '',
        company: profile?.company || '',
      },
      content: text,
      createdAt: 'Just now',
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: (p.commentsCount || 0) + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );

    setCommentInput((prev) => ({ ...prev, [postId]: '' }));
  };

  const toggleBookmark = (postId: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedCat === 'All') return true;
    return (
      p.category === selectedCat ||
      p.tags?.some((t) => t.toLowerCase() === selectedCat.toLowerCase())
    );
  });

  return (
    <div className="text-left">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        {/* Left Column: Feed & Composer */}
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight m-0 mb-4 text-[#201e1d]">
            Community
          </h1>

          {/* Modernist Composer Box with 2px Border */}
          <div className="border-2 border-[#201e1d] bg-[#f3f2f2] mb-5">
            <input
              type="text"
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreatePost();
                }
              }}
              placeholder="Ask a question or start a discussion…"
              className="input border-0 bg-transparent text-sm sm:text-base min-h-[52px] p-3 font-medium text-[#201e1d]"
            />
            <div className="flex flex-wrap gap-2 items-center p-2.5 border-t border-[rgba(32,30,29,0.15)]">
              {postTypes.map((pt) => {
                const isActive = composerType === pt;
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setComposerType(pt)}
                    className={`whitespace-nowrap px-2.5 py-1 text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#201e1d] text-[#f3f2f2]'
                        : 'bg-[#eae9e9] text-[#201e1d] hover:bg-[rgba(32,30,29,0.1)]'
                    }`}
                  >
                    {pt}
                  </button>
                );
              })}
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={!composerText.trim()}
                className="btn btn-primary text-xs font-bold px-4 py-1.5"
              >
                Post
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-4 border-b-2 border-[rgba(32,30,29,0.15)] overflow-x-auto no-scrollbar mb-2">
            {categories.map((cat) => {
              const isActive = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`whitespace-nowrap py-2 text-sm font-semibold transition-colors border-b-2 -mb-[2px] ${
                    isActive
                      ? 'text-[#ae1800] border-[#ec3013]'
                      : 'text-[#201e1d] border-transparent hover:text-[#ec3013]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Feed List Items */}
          <div className="divide-y divide-[rgba(32,30,29,0.15)]">
            {filteredPosts.map((post) => {
              const isUpvoted = Boolean(post.hasUpvoted);
              const isSaved = savedPosts.has(post.id);

              return (
                <article
                  key={post.id}
                  className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 py-4 text-left"
                >
                  {/* Left Column: Modernist Upvote Button */}
                  <button
                    onClick={() => handleUpvote(post.id)}
                    aria-label="Upvote post"
                    className={`flex flex-col items-center justify-center gap-0.5 p-2 border border-[rgba(32,30,29,0.15)] h-fit transition-colors ${
                      isUpvoted
                        ? 'bg-[#ec3013] text-[#f3f2f2] border-[#ec3013]'
                        : 'bg-transparent text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
                    }`}
                  >
                    <span className="text-xs leading-none">▲</span>
                    <span className="font-extrabold text-sm">{post.upvotes}</span>
                  </button>

                  {/* Right Column: Post Body */}
                  <div className="min-w-0">
                    <div className="flex gap-2 items-center flex-wrap text-xs mb-1">
                      <span className="tag tag-accent font-bold">
                        {post.tags?.[0] || post.category}
                      </span>
                      <span className="font-bold text-[#201e1d]">{post.author.name}</span>
                      <span className="text-[#605d5d]">
                        {post.author.role} · {post.createdAt}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg sm:text-xl text-[#201e1d] leading-snug my-1">
                      {post.title}
                    </h3>
                    {post.content && post.content !== post.title && (
                      <p className="text-sm text-[#201e1d] mt-1 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-4 items-center mt-2.5 text-xs text-[#605d5d] flex-wrap">
                      <span className="font-semibold text-slate-500">{post.category}</span>
                      <span
                        onClick={() => handleToggleComments(post.id)}
                        className="cursor-pointer hover:text-[#ae1800] font-semibold"
                      >
                        {post.commentsCount || 0} comments
                      </span>
                      <span
                        onClick={() => toggleBookmark(post.id)}
                        className={`cursor-pointer font-semibold ${
                          isSaved ? 'text-[#ae1800]' : 'hover:text-[#ae1800]'
                        }`}
                      >
                        {isSaved ? 'Bookmarked' : 'Bookmark'}
                      </span>
                      <span
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Post link copied to clipboard!');
                          }
                        }}
                        className="cursor-pointer hover:text-[#ae1800] font-semibold"
                      >
                        Share
                      </span>
                    </div>

                    {/* Comments Drawer */}
                    {activeCommentsPostId === post.id && (
                      <div className="mt-3 pt-3 border-t border-[rgba(32,30,29,0.15)] space-y-2">
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-2">
                            {post.comments.map((c) => (
                              <div
                                key={c.id}
                                className="bg-[#eae9e9] p-2.5 border border-[rgba(32,30,29,0.1)] text-xs space-y-1"
                              >
                                <div className="flex justify-between font-bold text-[#201e1d]">
                                  <span>{c.author.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {c.createdAt}
                                  </span>
                                </div>
                                <p className="text-[#201e1d]">{c.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 py-1">No comments yet.</div>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            value={commentInput[post.id] || ''}
                            onChange={(e) =>
                              setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            placeholder="Add a constructive PM perspective…"
                            className="input flex-1 text-xs py-1.5"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="btn btn-primary text-xs py-1 px-3"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Challenge Box & Top Contributors */}
        <aside className="space-y-6">
          {/* Vermilion Weekly Challenge Card */}
          <div className="bg-[#ec3013] text-[#f3f2f2] p-6 space-y-3">
            <div className="text-xs uppercase tracking-widest font-bold opacity-90">
              Weekly Challenge · Active
            </div>
            <div className="text-2xl font-black leading-snug">
              Improve onboarding for a music streaming app.
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              Submit your product teardown for AI Rubric evaluation and peer review.
            </p>
            <button
              onClick={() => {
                if (onOpenChallenge) {
                  onOpenChallenge();
                } else {
                  setComposerText('My solution for Challenge #23 (Music Onboarding): ');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="btn w-full justify-between mt-2 bg-[#f3f2f2] text-[#201e1d] hover:bg-[#eae9e9] text-xs font-bold"
            >
              <span>Solve Challenge</span>
              <span>→</span>
            </button>
          </div>

          {/* Top Contributors List */}
          <div className="border-t-2 border-[rgba(32,30,29,0.15)] pt-3 text-left">
            <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold pb-2">
              Top Contributors This Week
            </div>
            {activeContributors.length > 0 ? (
              <div className="divide-y divide-[rgba(32,30,29,0.15)]">
                {activeContributors.map((u, i) => (
                  <div key={u.id || i} className="flex gap-3 items-center py-2.5">
                    <span className="w-8 h-8 grid place-items-center bg-[#d7d3d3] text-[#201e1d] font-black text-xs shrink-0">
                      {u.initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-xs text-[#201e1d] truncate">{u.name}</div>
                      <div className="text-[11px] text-[#605d5d] truncate">{u.badge}</div>
                    </div>
                    <span className="font-black text-xs text-[#ec3013]">{u.pts} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-left">
                <p className="text-xs text-[#605d5d] leading-relaxed">
                  No ranked contributor activity yet this week. Share an insight or discussion above to get featured!
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
