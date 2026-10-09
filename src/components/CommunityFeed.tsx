'use client';

import React, { useState, useEffect } from 'react';
import { CommunityPost, Comment } from '../types';
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Image as ImageIcon,
  BarChart2,
  FileText,
  MoreHorizontal,
  Plus,
  Check,
  Globe,
  Share2,
  Sparkles,
  Tag,
  X,
  Calendar,
  Smile,
  Video,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';
import {
  getCommunityPostsFromDb,
  insertCommunityPostToDb,
  togglePostUpvoteInDb,
} from '@/lib/supabase/database';

interface CommunityFeedProps {
  initialPosts: CommunityPost[];
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ initialPosts }) => {
  const { user, profile, openAuthModal, openProfileModal, isConfigured } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [followedAuthorNames, setFollowedAuthorNames] = useState<Set<string>>(new Set());

  // New post modal state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityPost['category']>('Strategy');
  const [newTags, setNewTags] = useState('ProductStrategy, PLG, Metrics');
  const [isPublishing, setIsPublishing] = useState(false);

  const categories = ['All', 'Strategy', 'Execution', 'AI & Tech', 'Career & Transition', 'Case Study'];

  // Load posts from Supabase on mount
  useEffect(() => {
    let mounted = true;
    async function loadDbPosts() {
      if (isConfigured) {
        const dbPosts = await getCommunityPostsFromDb();
        if (mounted && dbPosts && dbPosts.length > 0) {
          setPosts((prev) => {
            const existingIds = new Set(dbPosts.map((p) => p.id));
            const uniqueInitial = prev.filter((p) => !existingIds.has(p.id));
            return [...dbPosts, ...uniqueInitial];
          });
        }
      }
    }
    loadDbPosts();
    return () => {
      mounted = false;
    };
  }, [isConfigured]);

  const handleReactionToggle = async (postId: string, reactionType: 'like' | 'celebrate' | 'insightful' | 'love' = 'like') => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCurrentlyReacted = p.userReaction !== null && p.userReaction !== undefined;
          const newReaction = isCurrentlyReacted ? null : reactionType;
          const upvoteDelta = isCurrentlyReacted ? -1 : 1;

          return {
            ...p,
            userReaction: newReaction,
            upvotes: Math.max(0, p.upvotes + upvoteDelta),
            hasUpvoted: !isCurrentlyReacted,
          };
        }
        return p;
      })
    );

    // Sync to database if available
    if (isConfigured && user) {
      const targetPost = posts.find((p) => p.id === postId);
      if (targetPost) {
        await togglePostUpvoteInDb(postId, user.id, targetPost.hasUpvoted || false);
      }
    }
  };

  const handleAddComment = (postId: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const text = commentInput[postId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      author: {
        name: profile?.fullName || user?.user_metadata?.full_name || 'You (Product Manager)',
        role: profile?.role ? `${profile.role} @ ${profile.company || 'Independent PM'}` : 'Product Manager',
        avatar: profile?.avatarUrl || '',
      },
      content: text.trim(),
      createdAt: 'Just now',
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newComment, ...(p.comments || [])],
          };
        }
        return p;
      })
    );

    setCommentInput((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPublishing(true);

    const postToCreate: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: user?.id,
      author: {
        name: profile?.fullName || user?.user_metadata?.full_name || 'Product Manager',
        role: profile?.role || 'Senior Product Manager',
        company: profile?.company || 'High Growth SaaS',
        headline: `${profile?.role || 'Senior PM'} @ ${profile?.company || 'High Growth SaaS'} | Product Craft`,
        avatar: profile?.avatarUrl || '',
      },
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      upvotes: 1,
      hasUpvoted: true,
      userReaction: 'like',
      commentsCount: 0,
      createdAt: 'Just now',
    };

    // Optimistically update feed
    setPosts((prev) => [postToCreate, ...prev]);

    // Save to Supabase
    if (isConfigured) {
      await insertCommunityPostToDb(postToCreate);
    }

    setNewTitle('');
    setNewContent('');
    setIsPublishing(false);
    setIsModalOpen(false);
  };

  const toggleFollow = (authorName: string) => {
    setFollowedAuthorNames((prev) => {
      const next = new Set(prev);
      if (next.has(authorName)) next.delete(authorName);
      else next.add(authorName);
      return next;
    });
  };

  const filteredPosts = posts.filter((p) => {
    return selectedCategory === 'All' || p.category === selectedCategory;
  });

  return (
    <div className="space-y-3">
      {/* LinkedIn "Start a Post" Card */}
      <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3 sm:p-4">
        <div className="flex items-center space-x-2.5">
          <UserAvatar
            src={profile?.avatarUrl}
            name={profile?.fullName || user?.user_metadata?.full_name}
            email={profile?.email || user?.email}
            size="lg"
            className="border border-slate-300 flex-shrink-0 cursor-pointer"
            onClick={() => (user ? openProfileModal() : openAuthModal('signin'))}
          />
          <button
            onClick={() => {
              if (!user) {
                openAuthModal('signin');
                return;
              }
              setIsModalOpen(true);
            }}
            className="flex-1 text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-500 font-medium transition"
          >
            Start a post about frameworks, roadmaps, or case studies...
          </button>
        </div>

        {/* Action icons bar below prompt (LinkedIn exact icons) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600 font-semibold">
          <button
            onClick={() => {
              if (!user) openAuthModal('signin');
              else setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition"
          >
            <ImageIcon className="w-4 h-4 text-[#378fe9]" />
            <span className="hidden sm:inline">Media</span>
          </button>

          <button
            onClick={() => {
              if (!user) openAuthModal('signin');
              else {
                setNewCategory('Case Study');
                setIsModalOpen(true);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition"
          >
            <Video className="w-4 h-4 text-[#5f9b41]" />
            <span className="hidden sm:inline">PM Teardown</span>
          </button>

          <button
            onClick={() => {
              if (!user) openAuthModal('signin');
              else {
                setNewCategory('Strategy');
                setIsModalOpen(true);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition"
          >
            <BarChart2 className="w-4 h-4 text-[#c37d16]" />
            <span className="hidden sm:inline">Framework / Poll</span>
          </button>

          <button
            onClick={() => {
              if (!user) openAuthModal('signin');
              else {
                setNewCategory('Execution');
                setIsModalOpen(true);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition"
          >
            <FileText className="w-4 h-4 text-[#e06847]" />
            <span className="hidden sm:inline">Write PRD</span>
          </button>
        </div>
      </div>

      {/* Filter and Feed Sort Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-[#e0dfdc] hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 whitespace-nowrap pl-2">
          <span>Sort by:</span>
          <span className="font-bold text-slate-900">Top Discussions</span>
        </div>
      </div>

      {/* LinkedIn Post Stream */}
      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const isCommentsOpen = activeCommentsPostId === post.id;
          const hasUserReacted = post.userReaction !== null && post.userReaction !== undefined;
          const isAuthorFollowed = followedAuthorNames.has(post.author.name);

          return (
            <article
              key={post.id}
              className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm overflow-hidden text-left"
            >
              {/* Header: Author + Headline + Time + Follow */}
              <div className="p-3.5 pb-2 flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <UserAvatar
                    src={post.author.avatar}
                    name={post.author.name}
                    size="lg"
                    className="border border-slate-200 flex-shrink-0 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-bold text-slate-900 hover:text-[#0a66c2] hover:underline cursor-pointer transition">
                        {post.author.name}
                      </h3>
                      {post.author.isConnection ? (
                        <span className="text-[11px] text-slate-500 font-normal">• 1st</span>
                      ) : (
                        <button
                          onClick={() => toggleFollow(post.author.name)}
                          className="text-[11px] text-[#0a66c2] hover:underline font-semibold ml-1"
                        >
                          {isAuthorFollowed ? '• Following' : '• + Follow'}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-tight">
                      {post.author.headline || `${post.author.role} @ ${post.author.company}`}
                    </p>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                      <span>{post.createdAt}</span>
                      <span>•</span>
                      <Globe className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Post Body */}
              <div className="px-3.5 pb-2 text-xs sm:text-sm text-slate-800 space-y-2">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {post.title}
                </h2>
                <p className="whitespace-pre-line leading-relaxed text-slate-700">
                  {post.content}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold text-[#0a66c2] hover:underline cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Reactions Count Bar (LinkedIn overlapping reaction icons) */}
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[10px] ring-1 ring-white">
                      👍
                    </span>
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ring-1 ring-white">
                      💡
                    </span>
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] ring-1 ring-white">
                      ❤️
                    </span>
                  </div>
                  <span className="hover:text-[#0a66c2] hover:underline cursor-pointer font-medium">
                    {post.upvotes} reactions
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  <button
                    onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                    className="hover:text-[#0a66c2] hover:underline"
                  >
                    {post.commentsCount} comments
                  </button>
                  <span>•</span>
                  <span>4 reposts</span>
                </div>
              </div>

              {/* Action Bar: Like, Comment, Repost, Send */}
              <div className="px-2 py-0.5 flex items-center justify-around text-xs text-slate-600 font-semibold border-b border-slate-100">
                <button
                  onClick={() => handleReactionToggle(post.id, 'like')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition ${
                    hasUserReacted ? 'text-[#0a66c2]' : ''
                  }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${hasUserReacted ? 'fill-[#0a66c2] text-[#0a66c2]' : ''}`}
                  />
                  <span>Like</span>
                </button>

                <button
                  onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Comment</span>
                </button>

                <button
                  onClick={() => alert('Post reposted to your PM profile feed!')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  <Repeat2 className="w-4 h-4" />
                  <span>Repost</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Post link copied to clipboard!');
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>

              {/* Comments Section (Expandable) */}
              {isCommentsOpen && (
                <div className="p-3.5 bg-slate-50/70 space-y-3">
                  {/* Add comment input */}
                  <div className="flex items-start space-x-2">
                    <UserAvatar
                      src={profile?.avatarUrl}
                      name={profile?.fullName || user?.user_metadata?.full_name}
                      email={profile?.email || user?.email}
                      size="sm"
                      className="border border-slate-300 flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Add a comment or perspective..."
                        value={commentInput[post.id] || ''}
                        onChange={(e) =>
                          setCommentInput({
                            ...commentInput,
                            [post.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                        className="w-full text-xs px-3.5 py-2 bg-white border border-[#e0dfdc] rounded-full focus:outline-none focus:ring-1 focus:ring-[#0a66c2] text-slate-800"
                      />
                      {commentInput[post.id]?.trim() && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-3.5 py-1 bg-[#0a66c2] text-white text-xs font-semibold rounded-full hover:bg-[#004182] transition shadow-xs"
                          >
                            Comment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments list */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      {post.comments.map((comm) => (
                        <div key={comm.id} className="flex items-start space-x-2">
                          <UserAvatar
                            src={comm.author.avatar}
                            name={comm.author.name}
                            size="sm"
                            className="border border-slate-300 flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1 bg-white p-2.5 rounded-xl border border-[#e0dfdc] text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                {comm.author.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {comm.createdAt}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {comm.author.role}
                            </p>
                            <p className="text-slate-800 mt-1 leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* LinkedIn-style Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-lg max-w-xl w-full p-5 space-y-4 shadow-2xl border border-[#e0dfdc] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <UserAvatar
                  src={profile?.avatarUrl}
                  name={profile?.fullName || user?.user_metadata?.full_name}
                  email={profile?.email || user?.email}
                  size="lg"
                  className="border border-slate-300 flex-shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {profile?.fullName || 'Product Manager'}
                  </h3>
                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-700 mt-0.5">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>Post to Anyone 🌐</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Insight headline or problem title (e.g., Why 6-week bets beat Agile sprints)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm font-bold placeholder:font-normal placeholder:text-slate-400 border-none focus:outline-none py-1"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={6}
                  placeholder="What product framework, trade-off decision, teardown, or question do you want to talk about?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border-none focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Category Pills Selector */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Select PM Focus
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Strategy', 'Execution', 'AI & Tech', 'Career & Transition', 'Case Study'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`px-3 py-1 text-xs rounded-full font-semibold border transition ${
                          newCategory === cat
                            ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                            : 'bg-white text-slate-600 border-[#e0dfdc] hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Tags Input */}
              <div className="flex items-center space-x-2 pt-1 text-xs">
                <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tags separated by commas (e.g. Discovery, PLG, Metrics)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#0a66c2]"
                />
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-slate-500">
                  <button type="button" className="p-1.5 hover:bg-slate-100 rounded-full">
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-100 rounded-full">
                    <Video className="w-4 h-4 text-slate-600" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-100 rounded-full">
                    <Calendar className="w-4 h-4 text-slate-600" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-100 rounded-full">
                    <Smile className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing || !newTitle.trim() || !newContent.trim()}
                    className="px-5 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-50 rounded-full transition shadow-xs"
                  >
                    {isPublishing ? 'Publishing...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
