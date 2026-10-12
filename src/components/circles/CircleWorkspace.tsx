'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  Share2,
  Lock,
  Plus,
  Search,
  Check,
  CheckCircle2,
  Clock,
  Pin,
  Smile,
  Trash2,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  Shield,
  UserPlus,
  Send,
  MoreVertical,
  Edit2,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Circle,
  CircleMember,
  CirclePost,
  CircleReply,
  CircleResource,
  CircleActivity,
  CircleRole,
} from '@/types';
import {
  getCirclePostsFromDb,
  createCirclePostInDb,
  createCircleReplyInDb,
  toggleCirclePostReactionInDb,
  getCircleResourcesFromDb,
  createCircleResourceInDb,
  getCircleActivitiesFromDb,
  createCircleActivityInDb,
  updateCircleActivityStatusInDb,
  toggleCircleActivityChecklistInDb,
  deleteCircleInDb,
  leaveCircleInDb,
} from '@/lib/supabase/circles';
import { getOtherProfilesFromDb } from '@/lib/supabase/database';
import { UserAvatar } from '../UserAvatar';

interface CircleWorkspaceProps {
  circle: Circle;
  onBack: () => void;
  onCircleUpdated?: (updated: Circle) => void;
  onCircleDeleted?: (circleId: string) => void;
}

type WorkspaceTab = 'discussions' | 'members' | 'resources' | 'activities' | 'settings';

export const CircleWorkspace: React.FC<CircleWorkspaceProps> = ({
  circle,
  onBack,
  onCircleUpdated,
  onCircleDeleted,
}) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('discussions');

  // Member role of current user
  const currentMember = circle.members.find((m) => m.userId === user?.id);
  const userRole: CircleRole = currentMember?.membershipRole || (circle.creatorId === user?.id ? 'owner' : 'member');
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';

  // 1. Discussions State
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postSearch, setPostSearch] = useState('');
  const [postSort, setPostSort] = useState<'latest' | 'active'>('latest');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeTemplateType, setActiveTemplateType] = useState<'teardown' | 'interview' | 'vibecoding' | null>(null);
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({});
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // 2. Resources State
  const [resources, setResources] = useState<CircleResource[]>([]);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>('All');
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceDesc, setNewResourceDesc] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceCategory, setNewResourceCategory] = useState<CircleResource['category']>('Links');

  // 3. Activities State
  const [activities, setActivities] = useState<CircleActivity[]>([]);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [newActType, setNewActType] = useState<CircleActivity['activityType']>('Teardown Session');
  const [newActDate, setNewActDate] = useState('');
  const [newActAssignee, setNewActAssignee] = useState('');
  const [newActChecklistRaw, setNewActChecklistRaw] = useState('');

  // 4. Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [inviteSearch, setInviteSearch] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // 5. Settings Form State
  const [editName, setEditName] = useState(circle.name);
  const [editDesc, setEditDesc] = useState(circle.description);
  const [editPurpose, setEditPurpose] = useState(circle.purpose || '');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load Discussions, Resources, Activities
  useEffect(() => {
    let mounted = true;

    async function loadWorkspaceData() {
      setPostsLoading(true);
      const [fetchedPosts, fetchedResources, fetchedActivities] = await Promise.all([
        getCirclePostsFromDb(circle.id),
        getCircleResourcesFromDb(circle.id),
        getCircleActivitiesFromDb(circle.id),
      ]);

      if (!mounted) return;
      setPosts(fetchedPosts);
      setResources(fetchedResources);
      setActivities(fetchedActivities);
      setPostsLoading(false);
    }

    loadWorkspaceData();
    return () => {
      mounted = false;
    };
  }, [circle.id]);

  // Load profiles for in-workspace invitations
  useEffect(() => {
    if (!isInviteModalOpen) return;
    async function loadMembers() {
      const dbProfiles = await getOtherProfilesFromDb(user?.id);
      if (dbProfiles) {
        setAvailableProfiles(dbProfiles);
      }
    }
    loadMembers();
  }, [isInviteModalOpen, user?.id]);

  // Handle Create Post
  const handleCreatePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPostContent.trim()) return;

    const authorName = profile?.fullName || user?.email?.split('@')[0] || 'Product Manager';
    const authorRole = profile?.role || 'Product Manager';
    const authorAvatar = profile?.avatarUrl || '';

    const created = await createCirclePostInDb({
      circleId: circle.id,
      authorId: user?.id || 'guest-user',
      authorName,
      authorRole,
      authorCompany: profile?.company || '',
      authorAvatar,
      title: newPostTitle.trim() || undefined,
      content: newPostContent.trim(),
    });

    setPosts((prev) => [created, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
  };

  // Handle Structured Post Template Submit
  const handleCreateStructuredPost = async () => {
    const authorName = profile?.fullName || user?.email?.split('@')[0] || 'Product Manager';
    let title = '';
    let content = '';

    if (activeTemplateType === 'teardown') {
      title = `Teardown: ${templateInputs.product || 'Product Breakdown'}`;
      content = `🎯 Target Users: ${templateInputs.targetUser || 'General'}\n\n🚨 Core Problem: ${templateInputs.coreProblem || 'N/A'}\n\n✨ What Works Well: ${templateInputs.whatWorks || 'N/A'}\n\n🔧 Areas for Improvement: ${templateInputs.whatImproves || 'N/A'}\n\n📈 Success Metrics: ${templateInputs.metrics || 'N/A'}`;
    } else if (activeTemplateType === 'interview') {
      title = `Mock Interview Practice: ${templateInputs.interviewType || 'Product Sense'}`;
      content = `🗣️ Interviewer: ${templateInputs.interviewer || authorName}\n👤 Candidate: ${templateInputs.candidate || 'Partner'}\n📅 Date/Time: ${templateInputs.datetime || 'TBD'}\n\n📝 Case Prompt: ${templateInputs.prompt || 'N/A'}\n\n💡 Prep Guidelines: Review standard user segmentation and trade-off defense.`;
    } else if (activeTemplateType === 'vibecoding') {
      title = `Project Build: ${templateInputs.projectName || 'AI Prototype'}`;
      content = `💡 Idea: ${templateInputs.idea || 'N/A'}\n\n🛠️ Tech Stack: ${templateInputs.stack || 'Next.js + Supabase'}\n\n🚀 MVP Scope: ${templateInputs.scope || 'N/A'}\n\n🔗 Live Preview: ${templateInputs.liveUrl || 'Coming soon'}`;
    }

    const created = await createCirclePostInDb({
      circleId: circle.id,
      authorId: user?.id || 'guest-user',
      authorName,
      authorRole: profile?.role || 'Product Manager',
      authorCompany: profile?.company || '',
      authorAvatar: profile?.avatarUrl || '',
      title,
      content,
      templateType: activeTemplateType || undefined,
      templateData: templateInputs,
    });

    setPosts((prev) => [created, ...prev]);
    setIsTemplateModalOpen(false);
    setActiveTemplateType(null);
    setTemplateInputs({});
  };

  // Handle Reply
  const handleSendReply = async (postId: string) => {
    const text = replyInputMap[postId]?.trim();
    if (!text) return;

    const authorName = profile?.fullName || user?.email?.split('@')[0] || 'Product Manager';
    const reply = await createCircleReplyInDb({
      postId,
      circleId: circle.id,
      authorId: user?.id || 'guest-user',
      authorName,
      authorRole: profile?.role || 'Product Manager',
      authorAvatar: profile?.avatarUrl || '',
      content: text,
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              repliesCount: p.repliesCount + 1,
              replies: [...(p.replies || []), reply],
            }
          : p
      )
    );

    setReplyInputMap((prev) => ({ ...prev, [postId]: '' }));
    setExpandedReplies((prev) => ({ ...prev, [postId]: true }));
  };

  // Handle Reaction
  const handleToggleReaction = async (postId: string, emoji: string) => {
    const uId = user?.id || 'guest-user';
    await toggleCirclePostReactionInDb(postId, circle.id, uId, emoji);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const current = p.reactions[emoji] || { count: 0, users: [] };
        const hasReacted = current.users.includes(uId);
        const updatedUsers = hasReacted
          ? current.users.filter((id) => id !== uId)
          : [...current.users, uId];

        const updated = { ...p.reactions };
        if (updatedUsers.length === 0) {
          delete updated[emoji];
        } else {
          updated[emoji] = { count: updatedUsers.length, users: updatedUsers };
        }
        return { ...p, reactions: updated };
      })
    );
  };

  // Handle Add Resource
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim()) return;

    const created = await createCircleResourceInDb({
      circleId: circle.id,
      authorId: user?.id || 'guest-user',
      authorName: profile?.fullName || 'Product Manager',
      title: newResourceTitle.trim(),
      description: newResourceDesc.trim() || undefined,
      url: newResourceUrl.trim() || undefined,
      category: newResourceCategory,
    });

    setResources((prev) => [created, ...prev]);
    setNewResourceTitle('');
    setNewResourceDesc('');
    setNewResourceUrl('');
    setIsAddResourceOpen(false);
  };

  // Handle Add Activity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitle.trim()) return;

    const checklistItems = newActChecklistRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, idx) => ({ id: `chk-${Date.now()}-${idx}`, text, completed: false }));

    const created = await createCircleActivityInDb({
      circleId: circle.id,
      title: newActTitle.trim(),
      description: newActDesc.trim() || undefined,
      activityType: newActType,
      scheduledDate: newActDate ? new Date(newActDate).toISOString() : undefined,
      dueDate: newActDate ? new Date(newActDate).toISOString() : undefined,
      assigneeName: newActAssignee.trim() || undefined,
      status: 'not_started',
      checklist: checklistItems,
    });

    setActivities((prev) => [created, ...prev]);
    setNewActTitle('');
    setNewActDesc('');
    setNewActDate('');
    setNewActAssignee('');
    setNewActChecklistRaw('');
    setIsAddActivityOpen(false);
  };

  // Handle Toggle Activity Status
  const handleToggleActivityStatus = async (activityId: string, currentStatus: CircleActivity['status']) => {
    const nextStatus: CircleActivity['status'] =
      currentStatus === 'completed'
        ? 'not_started'
        : currentStatus === 'not_started'
        ? 'in_progress'
        : 'completed';

    await updateCircleActivityStatusInDb(activityId, circle.id, nextStatus);
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, status: nextStatus } : a))
    );
  };

  // Handle Checklist Check
  const handleToggleChecklist = async (activityId: string, checkId: string) => {
    await toggleCircleActivityChecklistInDb(activityId, circle.id, checkId);
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a;
        return {
          ...a,
          checklist: a.checklist.map((item) =>
            item.id === checkId ? { ...item, completed: !item.completed } : item
          ),
        };
      })
    );
  };

  // Handle Leave Circle
  const handleLeaveCircle = async () => {
    if (!user) return;
    if (userRole === 'owner' && circle.membersCount > 1) {
      alert('As the Owner, please transfer ownership to an Admin or Member before leaving the Circle.');
      return;
    }
    if (confirm('Are you sure you want to leave this Circle?')) {
      await leaveCircleInDb(circle.id, user.id);
      onBack();
    }
  };

  // Handle Delete Circle
  const handleDeleteCircle = async () => {
    if (deleteConfirmText.trim() !== circle.name.trim()) {
      alert(`Please type "${circle.name}" exactly to confirm deletion.`);
      return;
    }
    if (user && userRole === 'owner') {
      await deleteCircleInDb(circle.id, user.id);
      if (onCircleDeleted) onCircleDeleted(circle.id);
      onBack();
    }
  };

  // Filtered discussions
  const filteredPosts = posts
    .filter((p) => {
      if (!postSearch.trim()) return true;
      const q = postSearch.toLowerCase();
      return (
        p.content.toLowerCase().includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        p.authorName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (postSort === 'active') {
        return (b.repliesCount || 0) - (a.repliesCount || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-5 animate-fade-in text-[#201e1d]">
      {/* 1. Header Banner */}
      <div className="bg-white border-2 border-[#201e1d] p-4 sm:p-6 shadow-[4px_4px_0px_#201e1d] rounded">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={onBack}
              className="mt-1 p-1.5 hover:bg-slate-100 border border-slate-300 rounded text-slate-700 transition shrink-0"
              title="Back to all Circles"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-2xl">{circle.coverIcon || '⭕'}</span>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-[#ec3013]/10 text-[#ec3013] rounded">
                  {circle.category}
                </span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Private Circle</span>
                </span>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  Role: {userRole.toUpperCase()}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#201e1d] tracking-tight">
                {circle.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#605d5d] mt-1 max-w-3xl leading-relaxed">
                {circle.description}
              </p>

              {circle.purpose && (
                <div className="mt-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="text-[#ec3013]">🎯 Goal:</span>
                  <span>{circle.purpose}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="btn btn-primary text-xs font-bold py-1.5 px-3.5 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>

            {userRole !== 'owner' && (
              <button
                onClick={handleLeaveCircle}
                className="btn btn-secondary text-xs font-bold py-1.5 px-3 text-red-600 hover:bg-red-50"
              >
                Leave
              </button>
            )}
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-1 border-t-2 border-[rgba(32,30,29,0.15)] mt-5 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-3.5 py-1.5 text-xs font-black rounded transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'discussions'
                ? 'bg-[#201e1d] text-white'
                : 'text-slate-600 hover:text-[#201e1d] hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussions ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-3.5 py-1.5 text-xs font-black rounded transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-[#201e1d] text-white'
                : 'text-slate-600 hover:text-[#201e1d] hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members ({circle.members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3.5 py-1.5 text-xs font-black rounded transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-[#201e1d] text-white'
                : 'text-slate-600 hover:text-[#201e1d] hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resources ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3.5 py-1.5 text-xs font-black rounded transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'activities'
                ? 'bg-[#201e1d] text-white'
                : 'text-slate-600 hover:text-[#201e1d] hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Activities ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 text-xs font-black rounded transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#201e1d] text-white'
                : 'text-slate-600 hover:text-[#201e1d] hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>About & Settings</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: DISCUSSIONS */}
      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Rich Composer */}
            <div className="bg-white border-2 border-[#201e1d] p-4 shadow-[3px_3px_0px_#201e1d] rounded text-left">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Start a Discussion</span>
                {/* Template Starter Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTemplateType('teardown');
                      setIsTemplateModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#ec3013] hover:underline flex items-center gap-1"
                  >
                    <span>+ Teardown Post</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => {
                      setActiveTemplateType('interview');
                      setIsTemplateModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#ec3013] hover:underline flex items-center gap-1"
                  >
                    <span>+ Mock Session</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Topic or Title (Optional)..."
                className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 focus:border-[#ec3013] outline-none rounded mb-2"
              />

              <textarea
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreatePost();
                  }
                }}
                placeholder="Share an idea, ask a question, or start a discussion... (Press Enter to post, Shift+Enter for new line)"
                className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 focus:border-[#ec3013] outline-none rounded"
              />

              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  Markdown formatting supported • @mentions available
                </span>

                <button
                  onClick={() => handleCreatePost()}
                  disabled={!newPostContent.trim()}
                  className="btn btn-primary text-xs font-bold py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center justify-between gap-3 bg-white p-2.5 border border-slate-200 rounded">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Search discussion threads..."
                  className="w-full pl-8 pr-2 py-1 text-xs font-semibold bg-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0 text-xs">
                <button
                  onClick={() => setPostSort('latest')}
                  className={`px-2.5 py-1 rounded font-bold ${
                    postSort === 'latest' ? 'bg-slate-100 text-[#ec3013]' : 'text-slate-500'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setPostSort('active')}
                  className={`px-2.5 py-1 rounded font-bold ${
                    postSort === 'active' ? 'bg-slate-100 text-[#ec3013]' : 'text-slate-500'
                  }`}
                >
                  Most Active
                </button>
              </div>
            </div>

            {/* Posts List */}
            {filteredPosts.length > 0 ? (
              filteredPosts.map((p) => {
                const areRepliesExpanded = expandedReplies[p.id] || false;
                return (
                  <div
                    key={p.id}
                    className="bg-white border-2 border-[rgba(32,30,29,0.15)] p-4 rounded shadow-sm text-left space-y-3"
                  >
                    {/* Author & Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar name={p.authorName} src={p.authorAvatar} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#201e1d]">
                              {p.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">{p.authorRole}</p>
                        </div>
                      </div>

                      {p.isPinned && (
                        <span className="text-[10px] font-extrabold text-[#ec3013] flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    {/* Post Title & Content */}
                    <div>
                      {p.title && (
                        <h4 className="font-black text-sm text-[#201e1d] mb-1 leading-snug">
                          {p.title}
                        </h4>
                      )}
                      <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                        {p.content}
                      </p>
                    </div>

                    {/* Reactions & Reply Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['👍', '💡', '🔥', '🎯'].map((emoji) => {
                          const reactObj = p.reactions[emoji];
                          const hasUserReacted = reactObj?.users?.includes(user?.id || '');
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(p.id, emoji)}
                              className={`px-2 py-0.5 text-xs rounded border transition flex items-center gap-1 ${
                                hasUserReacted
                                  ? 'bg-red-50 border-red-300 text-[#ec3013] font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span>{emoji}</span>
                              {reactObj && reactObj.count > 0 && (
                                <span className="text-[10px]">{reactObj.count}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setExpandedReplies((prev) => ({ ...prev, [p.id]: !areRepliesExpanded }))
                        }
                        className="text-xs font-bold text-slate-600 hover:text-[#ec3013] flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {p.repliesCount > 0 ? `${p.repliesCount} Replies` : 'Reply'}
                        </span>
                      </button>
                    </div>

                    {/* Threaded Replies Section */}
                    {areRepliesExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 bg-slate-50/70 p-3 rounded">
                        {p.replies && p.replies.length > 0 && (
                          <div className="space-y-2">
                            {p.replies.map((rep) => (
                              <div key={rep.id} className="flex items-start gap-2 text-xs">
                                <UserAvatar name={rep.authorName} src={rep.authorAvatar} size="xs" />
                                <div className="bg-white p-2 border border-slate-200 rounded flex-1">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-bold text-[11px] text-[#201e1d]">
                                      {rep.authorName}
                                    </span>
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(rep.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
                                    {rep.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input Box */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={replyInputMap[p.id] || ''}
                            onChange={(e) =>
                              setReplyInputMap((prev) => ({ ...prev, [p.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendReply(p.id);
                            }}
                            placeholder="Write a reply... (Press Enter to send)"
                            className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded outline-none focus:border-[#ec3013]"
                          />
                          <button
                            onClick={() => handleSendReply(p.id)}
                            className="btn btn-primary text-xs font-bold py-1.5 px-3 shrink-0"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-8 border border-slate-200 rounded text-center">
                <p className="text-xs text-slate-500 font-medium">
                  No discussions found. Be the first to start a conversation in this Circle!
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar Column: Next Activity & Quick Resources */}
          <div className="space-y-4 text-left">
            {/* Upcoming Activity Widget */}
            <div className="bg-white border-2 border-[#201e1d] p-4 shadow-[3px_3px_0px_#201e1d] rounded">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-black text-[#201e1d]">Next Session</span>
                <Calendar className="w-3.5 h-3.5 text-[#ec3013]" />
              </div>

              {circle.nextActivity ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#ec3013] block">
                    {circle.nextActivity.type}
                  </span>
                  <h4 className="text-xs font-black text-[#201e1d]">
                    {circle.nextActivity.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{circle.nextActivity.date}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No upcoming sessions scheduled yet. Check the Activities tab to schedule one.
                </p>
              )}
            </div>

            {/* Quick Guidelines Card */}
            <div className="bg-[#201e1d] text-white p-4 rounded shadow-sm text-left">
              <h4 className="font-black text-xs uppercase tracking-wider text-[#ec3013] mb-1.5">
                Circle Collaboration Norms
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li>• Share raw teardown notes & mock interview prompts freely.</li>
                <li>• Provide candid, constructive rubric feedback.</li>
                <li>• Keep all proprietary or interview materials confidential.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white border-2 border-[#201e1d] p-5 shadow-[4px_4px_0px_#201e1d] rounded text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#201e1d]">
                Circle Members ({circle.members.length}/{circle.maxMembers})
              </h3>
              <p className="text-xs text-slate-500">
                Collaborators who have joined this private space.
              </p>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="btn btn-primary text-xs font-bold py-1.5 px-3.5 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Invite Connections</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {circle.members.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar name={m.name} src={m.avatar} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-[#201e1d] truncate">
                        {m.name}
                      </h4>
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                          m.membershipRole === 'owner'
                            ? 'bg-amber-100 text-amber-800'
                            : m.membershipRole === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.membershipRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {m.role} {m.company ? `• ${m.company}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {m.pmFitScore && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                      Fit: {m.pmFitScore}/100
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    Joined {new Date(m.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border-2 border-[#201e1d] rounded shadow-[3px_3px_0px_#201e1d]">
            <div className="flex items-center gap-2 flex-wrap">
              {['All', 'Links', 'Notes', 'Case Studies', 'Interview Prep', 'Tools'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setResourceCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs font-bold rounded transition ${
                    resourceCategoryFilter === cat
                      ? 'bg-[#201e1d] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddResourceOpen(true)}
              className="btn btn-primary text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources
              .filter(
                (r) =>
                  resourceCategoryFilter === 'All' || r.category === resourceCategoryFilter
              )
              .map((res) => (
                <div
                  key={res.id}
                  className="bg-white border-2 border-[rgba(32,30,29,0.15)] p-4 rounded shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {res.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        By {res.authorName}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#201e1d] mb-1">{res.title}</h4>
                    {res.description && (
                      <p className="text-xs text-[#605d5d] mb-2 leading-relaxed">
                        {res.description}
                      </p>
                    )}
                    {res.content && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700 whitespace-pre-wrap mb-2">
                        {res.content}
                      </div>
                    )}
                  </div>

                  {res.url && (
                    <div className="pt-2 border-t border-slate-100">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#ec3013] hover:underline flex items-center gap-1"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {resources.length === 0 && (
            <div className="bg-white p-8 border border-slate-200 rounded text-center">
              <p className="text-xs text-slate-500">
                No resources shared yet. Share a teardown doc, interview rubric, or PRD link!
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between bg-white p-4 border-2 border-[#201e1d] rounded shadow-[3px_3px_0px_#201e1d]">
            <div>
              <h3 className="text-sm font-black text-[#201e1d]">
                Circle Activities & Sprints
              </h3>
              <p className="text-xs text-slate-500">
                Lightweight tasks, upcoming mock interviews, and teardown milestones.
              </p>
            </div>

            <button
              onClick={() => setIsAddActivityOpen(true)}
              className="btn btn-primary text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Activity</span>
            </button>
          </div>

          <div className="space-y-3">
            {activities.map((act) => {
              const isCompleted = act.status === 'completed';
              return (
                <div
                  key={act.id}
                  className={`bg-white border-2 p-4 rounded transition ${
                    isCompleted
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-[rgba(32,30,29,0.15)] shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleActivityStatus(act.id, act.status)}
                        className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : act.status === 'in_progress'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : act.status === 'in_progress' ? (
                          <Clock className="w-3 h-3" />
                        ) : null}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`font-black text-sm text-[#201e1d] ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {act.title}
                          </h4>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {act.activityType}
                          </span>
                        </div>

                        {act.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {act.description}
                          </p>
                        )}

                        {act.scheduledDate && (
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Scheduled: {new Date(act.scheduledDate).toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        act.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {act.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Checklist Items */}
                  {act.checklist && act.checklist.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 pl-7">
                      {act.checklist.map((chk) => (
                        <label
                          key={chk.id}
                          className="flex items-center gap-2 text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={chk.completed}
                            onChange={() => handleToggleChecklist(act.id, chk.id)}
                            className="w-3.5 h-3.5 accent-[#ec3013]"
                          />
                          <span
                            className={chk.completed ? 'line-through text-slate-400' : 'text-slate-700'}
                          >
                            {chk.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {activities.length === 0 && (
              <div className="bg-white p-8 border border-slate-200 rounded text-center">
                <p className="text-xs text-slate-500">
                  No activities created yet. Click "+ Create Activity" to schedule a teardown or mock interview!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: ABOUT & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-5 text-left">
          {/* Metadata Overview */}
          <div className="bg-white border-2 border-[#201e1d] p-5 shadow-[4px_4px_0px_#201e1d] rounded space-y-3">
            <h3 className="text-base font-black text-[#201e1d]">About this Circle</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Created By</span>
                <span className="font-bold text-[#201e1d]">{circle.creatorName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Created On</span>
                <span className="font-bold text-[#201e1d]">
                  {new Date(circle.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold text-[#201e1d]">{circle.category}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Privacy</span>
                <span className="font-bold text-[#ec3013]">Private • Invite Only</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {userRole === 'owner' && (
            <div className="bg-red-50 border-2 border-red-300 p-5 rounded space-y-3">
              <h4 className="text-sm font-black text-red-900">Danger Zone</h4>
              <p className="text-xs text-red-700">
                Deleting this Circle will permanently remove all discussions, member lists, resources, and activities. This action cannot be undone.
              </p>

              <div className="pt-2">
                <label className="block text-xs font-bold text-red-900 mb-1">
                  Type “{circle.name}” to confirm:
                </label>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={circle.name}
                    className="flex-1 text-xs p-2 bg-white border border-red-300 rounded outline-none"
                  />
                  <button
                    onClick={handleDeleteCircle}
                    disabled={deleteConfirmText.trim() !== circle.name.trim()}
                    className="btn btn-primary bg-red-600 hover:bg-red-700 text-xs font-bold py-2 px-4 disabled:opacity-40"
                  >
                    Delete Circle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD RESOURCE */}
      {isAddResourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#201e1d] w-full max-w-md p-5 shadow-[6px_6px_0px_#201e1d] rounded text-left space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#201e1d]">Add Circle Resource</h3>
              <button onClick={() => setIsAddResourceOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  placeholder="e.g., Linear Product Method PRD"
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Category</label>
                <select
                  value={newResourceCategory}
                  onChange={(e) => setNewResourceCategory(e.target.value as any)}
                  className="w-full text-xs font-bold p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                >
                  <option value="Links">Links</option>
                  <option value="Notes">Notes</option>
                  <option value="Case Studies">Case Studies</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="Documents">Documents</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">URL (Optional)</label>
                <input
                  type="url"
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={newResourceDesc}
                  onChange={(e) => setNewResourceDesc(e.target.value)}
                  placeholder="Key takeaways or summary..."
                  className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddResourceOpen(false)}
                  className="btn btn-secondary text-xs font-bold py-1.5 px-3"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs font-bold py-1.5 px-4">
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACTIVITY */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#201e1d] w-full max-w-md p-5 shadow-[6px_6px_0px_#201e1d] rounded text-left space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#201e1d]">Schedule Activity</h3>
              <button onClick={() => setIsAddActivityOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  placeholder="e.g., Stripe Checkout Teardown Call"
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1">Type</label>
                  <select
                    value={newActType}
                    onChange={(e) => setNewActType(e.target.value as any)}
                    className="w-full text-xs font-bold p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  >
                    <option value="Teardown Session">Teardown Session</option>
                    <option value="Mock Interview">Mock Interview</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Build Milestone">Build Milestone</option>
                    <option value="Strategy Review">Strategy Review</option>
                    <option value="Accountability Check-in">Check-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    value={newActDate}
                    onChange={(e) => setNewActDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Assignee / Lead</label>
                <input
                  type="text"
                  value={newActAssignee}
                  onChange={(e) => setNewActAssignee(e.target.value)}
                  placeholder="e.g., Priya Sharma"
                  className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Checklist Items (1 item per line)
                </label>
                <textarea
                  rows={3}
                  value={newActChecklistRaw}
                  onChange={(e) => setNewActChecklistRaw(e.target.value)}
                  placeholder="Clarifying questions&#10;Identify bottlenecks&#10;Draft PRD outline"
                  className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="btn btn-secondary text-xs font-bold py-1.5 px-3"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs font-bold py-1.5 px-4">
                  Create Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STRUCTURED POST TEMPLATE */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#201e1d] w-full max-w-lg p-5 shadow-[6px_6px_0px_#201e1d] rounded text-left space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#201e1d]">
                {activeTemplateType === 'teardown' && 'Product Teardown Template'}
                {activeTemplateType === 'interview' && 'Mock Interview Session Template'}
                {activeTemplateType === 'vibecoding' && 'Vibe Coding Project Template'}
              </h3>
              <button onClick={() => setIsTemplateModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {activeTemplateType === 'teardown' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Product Being Analysed *</label>
                  <input
                    type="text"
                    value={templateInputs.product || ''}
                    onChange={(e) => setTemplateInputs({ ...templateInputs, product: e.target.value })}
                    placeholder="e.g., Notion AI or Linear"
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Target Users</label>
                  <input
                    type="text"
                    value={templateInputs.targetUser || ''}
                    onChange={(e) => setTemplateInputs({ ...templateInputs, targetUser: e.target.value })}
                    placeholder="e.g., Remote engineering squads"
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Core User Problem</label>
                  <input
                    type="text"
                    value={templateInputs.coreProblem || ''}
                    onChange={(e) => setTemplateInputs({ ...templateInputs, coreProblem: e.target.value })}
                    placeholder="e.g., Bloated Jira backlogs slowing down sprint velocity"
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">What Works Well</label>
                  <textarea
                    rows={2}
                    value={templateInputs.whatWorks || ''}
                    onChange={(e) => setTemplateInputs({ ...templateInputs, whatWorks: e.target.value })}
                    placeholder="e.g., Fast keyboard shortcuts, sleek dark mode"
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Prioritized Recommendations</label>
                  <textarea
                    rows={2}
                    value={templateInputs.whatImproves || ''}
                    onChange={(e) => setTemplateInputs({ ...templateInputs, whatImproves: e.target.value })}
                    placeholder="e.g., Simplify permission scopes, improve mobile search"
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
              </div>
            )}

            {activeTemplateType === 'interview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">Interview Type</label>
                    <select
                      value={templateInputs.interviewType || 'Product Sense'}
                      onChange={(e) => setTemplateInputs({ ...templateInputs, interviewType: e.target.value })}
                      className="w-full text-xs font-bold p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                    >
                      <option value="Product Sense">Product Sense</option>
                      <option value="Execution & Metrics">Execution & Metrics</option>
                      <option value="Root Cause Analysis">Root Cause Analysis</option>
                      <option value="Product Strategy">Product Strategy</option>
                      <option value="Technical PM">Technical PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Scheduled Time</label>
                    <input
                      type="text"
                      value={templateInputs.datetime || ''}
                      onChange={(e) => setTemplateInputs({ ...templateInputs, datetime: e.target.value })}
                      placeholder="e.g., Tomorrow, 8:00 PM"
                      className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Candidate</label>
                  <input
                    type="text"
                    value={templateInputs.candidate || ''}
                    onChange={(e) => setTemplateInputs({ ...templateInputs, candidate: e.target.value })}
                    placeholder="Candidate name"
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Case Prompt *</label>
                  <textarea
                    rows={2}
                    value={templateInputs.prompt || ''}
                    onChange={(e) => setTemplateInputs({ ...templateInputs, prompt: e.target.value })}
                    placeholder="e.g., Design Google Maps for Visually Impaired Commuters"
                    className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-[#ec3013]"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="btn btn-secondary text-xs font-bold py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateStructuredPost}
                className="btn btn-primary text-xs font-bold py-1.5 px-4"
              >
                Create Structured Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVITE MEMBERS IN WORKSPACE */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#201e1d] w-full max-w-md p-5 shadow-[6px_6px_0px_#201e1d] rounded text-left space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#201e1d]">Invite to {circle.name}</h3>
              <button onClick={() => setIsInviteModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {inviteSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded">
                {inviteSuccessMsg}
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                placeholder="Search connections..."
                className="w-full pl-8 pr-2 py-1.5 text-xs font-semibold border border-slate-300 rounded outline-none focus:border-[#ec3013]"
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {availableProfiles
                .filter((p) => {
                  const alreadyMember = circle.members.some((m) => m.userId === p.id);
                  if (alreadyMember) return false;
                  if (!inviteSearch.trim()) return true;
                  return (
                    p.full_name?.toLowerCase().includes(inviteSearch.toLowerCase()) ||
                    p.role?.toLowerCase().includes(inviteSearch.toLowerCase())
                  );
                })
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-2 border border-slate-200 rounded flex items-center justify-between hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar name={p.full_name} src={p.avatar_url} size="xs" />
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#201e1d] truncate block">
                          {p.full_name}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {p.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setInviteSuccessMsg(`Invitation sent to ${p.full_name}!`);
                        setTimeout(() => setInviteSuccessMsg(''), 3000);
                      }}
                      className="btn btn-secondary text-xs font-bold py-1 px-2.5"
                    >
                      Invite
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="btn btn-secondary text-xs font-bold py-1.5 px-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
