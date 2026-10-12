'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Users,
  Lock,
  Clock,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Check,
  X,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Circle, CircleInvitation } from '@/types';
import {
  getUserCirclesFromDb,
  getUserCircleInvitationsFromDb,
  respondToCircleInvitationInDb,
} from '@/lib/supabase/circles';
import { CreateCircleModal } from './CreateCircleModal';
import { CircleWorkspace } from './CircleWorkspace';
import { UserAvatar } from '../UserAvatar';

type CircleFilter = 'all' | 'created_by_me' | 'joined' | 'unread';

export const CirclesLanding: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();

  const [circles, setCircles] = useState<Circle[]>([]);
  const [invitations, setInvitations] = useState<CircleInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CircleFilter>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeWorkspaceCircle, setActiveWorkspaceCircle] = useState<Circle | null>(null);

  // Load circles & invitations
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [fetchedCircles, fetchedInvites] = await Promise.all([
          getUserCirclesFromDb(user?.id),
          user?.id ? getUserCircleInvitationsFromDb(user.id) : Promise.resolve([]),
        ]);

        if (!mounted) return;
        setCircles(fetchedCircles);
        setInvitations(fetchedInvites);
      } catch (err) {
        console.error('Failed to load Circles data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleCircleCreated = (newCircle: Circle) => {
    setCircles((prev) => [newCircle, ...prev]);
    setActiveWorkspaceCircle(newCircle);
  };

  const handleRespondInvitation = async (invitation: CircleInvitation, status: 'accepted' | 'declined') => {
    if (!user || !profile) {
      openAuthModal('signin');
      return;
    }

    await respondToCircleInvitationInDb(invitation.id, invitation.circleId, status, profile);

    setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));

    if (status === 'accepted') {
      // Reload circles to reflect newly joined circle
      const updatedCircles = await getUserCirclesFromDb(user.id);
      setCircles(updatedCircles);
      const joined = updatedCircles.find((c) => c.id === invitation.circleId);
      if (joined) {
        setActiveWorkspaceCircle(joined);
      }
    }
  };

  // If a circle workspace is currently open, display workspace view
  if (activeWorkspaceCircle) {
    return (
      <CircleWorkspace
        circle={activeWorkspaceCircle}
        onBack={() => {
          setActiveWorkspaceCircle(null);
          // Refresh list on return
          getUserCirclesFromDb(user?.id).then(setCircles);
        }}
        onCircleUpdated={(updated) => {
          setActiveWorkspaceCircle(updated);
          setCircles((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }}
        onCircleDeleted={(deletedId) => {
          setActiveWorkspaceCircle(null);
          setCircles((prev) => prev.filter((c) => c.id !== deletedId));
        }}
      />
    );
  }

  // Filter circles
  const filteredCircles = circles.filter((c) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.purpose && c.purpose.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    // Category / Status Filter
    if (activeFilter === 'created_by_me') {
      return c.creatorId === user?.id;
    }
    if (activeFilter === 'joined') {
      return c.members.some((m) => m.userId === user?.id) && c.creatorId !== user?.id;
    }
    if (activeFilter === 'unread') {
      return (c.unreadCount || 0) > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#201e1d]">
      {/* 1. Header Banner */}
      <div className="bg-white border-2 border-[#201e1d] p-6 sm:p-8 shadow-[6px_6px_0px_#201e1d] rounded text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">⭕</span>
              <span className="text-xs font-black uppercase tracking-wider text-[#ec3013]">
                Private Collaboration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#201e1d] tracking-tight">
              Your Circles
            </h1>
            <p className="text-sm text-[#605d5d] mt-1 font-medium">
              Small groups. Better products. Shared growth.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('signin');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="btn btn-primary text-xs sm:text-sm font-bold py-2.5 px-5 flex items-center gap-2 shrink-0 self-start md:self-center shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create a Circle</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-5 border-t-2 border-[rgba(32,30,29,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by circle name, category, or goal..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-[#ec3013] outline-none rounded"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {[
              { id: 'all', label: 'All Circles' },
              { id: 'created_by_me', label: 'Created by Me' },
              { id: 'joined', label: 'Joined' },
              { id: 'unread', label: 'Unread' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as CircleFilter)}
                className={`px-3 py-1.5 rounded font-bold transition whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-[#201e1d] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Pending Invitations Section (Dedicated Area) */}
      {invitations.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 rounded text-left shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-amber-700" />
            <h3 className="font-black text-sm text-amber-900">
              Pending Circle Invitations ({invitations.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white p-3.5 border border-amber-200 rounded flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{inv.circleIcon || '⭕'}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      {inv.circleCategory}
                    </span>
                    <h4 className="font-bold text-xs text-[#201e1d] truncate">
                      {inv.circleName}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Invited by {inv.inviterName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRespondInvitation(inv, 'declined')}
                    className="p-1.5 hover:bg-slate-100 text-slate-500 rounded border border-slate-200"
                    title="Decline"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(inv, 'accepted')}
                    className="btn btn-primary text-xs font-bold py-1 px-3 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border-2 border-slate-200 p-5 rounded h-60 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* 4. Circles Responsive Card Layout */}
      {!loading && filteredCircles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCircles.map((circle) => {
            const isCreator = circle.creatorId === user?.id;
            return (
              <div
                key={circle.id}
                onClick={() => setActiveWorkspaceCircle(circle)}
                className="bg-white border-2 border-[#201e1d] p-5 shadow-[4px_4px_0px_#201e1d] hover:shadow-[6px_6px_0px_#ec3013] hover:border-[#ec3013] transition-all rounded text-left flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Category, Icon & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{circle.coverIcon || '⭕'}</span>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ec3013] block">
                          {circle.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Private</span>
                        </span>
                      </div>
                    </div>

                    {circle.unreadCount && circle.unreadCount > 0 ? (
                      <span className="px-2 py-0.5 bg-[#ec3013] text-white text-[10px] font-black rounded-full animate-pulse">
                        {circle.unreadCount} new
                      </span>
                    ) : isCreator ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        Owner
                      </span>
                    ) : null}
                  </div>

                  {/* Name & Description */}
                  <h3 className="font-black text-base text-[#201e1d] group-hover:text-[#ec3013] transition-colors line-clamp-1 mb-1.5">
                    {circle.name}
                  </h3>

                  <p className="text-xs text-[#605d5d] line-clamp-3 leading-relaxed mb-3">
                    {circle.description}
                  </p>

                  {/* Upcoming Session Widget */}
                  {circle.nextActivity && (
                    <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase text-[#ec3013] block">
                        Next: {circle.nextActivity.type}
                      </span>
                      <p className="font-bold text-[#201e1d] truncate">
                        {circle.nextActivity.title}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{circle.nextActivity.date}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: Members & Open Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Member Avatars */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {circle.members.slice(0, 3).map((m) => (
                        <UserAvatar
                          key={m.id}
                          name={m.name}
                          src={m.avatar}
                          size="xs"
                          className="border border-white ring-1 ring-slate-200"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 pl-1">
                      {circle.membersCount} {circle.membersCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#ec3013] flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Empty State */}
      {!loading && filteredCircles.length === 0 && (
        <div className="bg-white border-2 border-[#201e1d] p-10 sm:p-14 rounded shadow-[4px_4px_0px_#201e1d] text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#ec3013] mx-auto flex items-center justify-center text-3xl">
            ⭕
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#201e1d]">
              You haven’t joined a Circle yet.
            </h3>
            <p className="text-xs sm:text-sm text-[#605d5d] mt-1 max-w-md mx-auto leading-relaxed">
              Create a space for your next product teardown, mock interview, or build session.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('signin');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="btn btn-primary text-xs sm:text-sm font-bold py-2.5 px-6 shadow-sm mx-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Your First Circle</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      <CreateCircleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCircleCreated={handleCircleCreated}
      />
    </div>
  );
};
