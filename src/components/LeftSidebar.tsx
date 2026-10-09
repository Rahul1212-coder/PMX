'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Award, Users, TrendingUp, Compass, Hash, Sparkles, Camera } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface LeftSidebarProps {
  activeTab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment';
  setActiveTab: (tab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment') => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, profile, openAuthModal, openProfileModal } = useAuth();

  const hashtags = [
    'productstrategy',
    'plg-growth',
    'ai-pm-squads',
    'discovery-frameworks',
    'apm-interview-prep',
    'outcome-roadmaps',
  ];

  const displayName = profile?.fullName || user?.user_metadata?.full_name || (user ? (user.email ? user.email.split('@')[0] : 'Product Manager') : 'Guest PM');
  const displayRole = profile?.role
    ? `${profile.role}${profile.company ? ` @ ${profile.company}` : ''}`
    : (user ? 'Associate PM' : 'Sign in to build your PMVerse identity');

  return (
    <aside className="w-full space-y-2">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden text-center">
        {/* Cover photo */}
        <div className="h-16 bg-gradient-to-r from-[#1c053a] via-[#3b0764] to-[#6b21a8] relative" />

        {/* Avatar with Initials Fallback & Edit Overlay */}
        <div className="-mt-9 flex justify-center">
          <div
            onClick={() => {
              if (user) {
                openProfileModal();
              } else {
                openAuthModal('signin');
              }
            }}
            className="relative group cursor-pointer"
            title={user ? 'Click to change profile picture or edit profile' : 'Sign in to customize'}
          >
            <UserAvatar
              src={profile?.avatarUrl}
              name={displayName}
              email={profile?.email || user?.email}
              size="2xl"
              className="border-3 border-white shadow-md ring-2 ring-purple-100/80 bg-white"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white drop-shadow" />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 pb-4 border-b border-purple-50">
          <h2
            onClick={() => {
              if (user) openProfileModal();
              else openAuthModal('signin');
            }}
            className="text-sm font-bold text-slate-900 hover:text-purple-700 cursor-pointer transition line-clamp-1"
          >
            {displayName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 px-1">
            {displayRole}
          </p>

          {user ? (
            <button
              onClick={openProfileModal}
              className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
            >
              <Camera className="w-3 h-3 text-purple-600" />
              <span>Edit Profile & Photo</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="mt-2.5 w-full py-1 text-xs font-semibold text-purple-700 border border-purple-200 rounded-full hover:bg-purple-50 transition"
            >
              Sign In to customize
            </button>
          )}
        </div>

        {/* Analytics stats */}
        <div className="py-2 text-left text-xs divide-y divide-purple-50">
          <div
            onClick={() => setActiveTab('connect')}
            className="px-3 py-1.5 flex justify-between items-center hover:bg-purple-50/50 cursor-pointer transition"
          >
            <div>
              <p className="text-slate-500 font-medium">PM Network</p>
              <p className="font-bold text-slate-800 text-[11px]">Grow your squad</p>
            </div>
            <span className="font-bold text-purple-700">480+</span>
          </div>

          <div className="px-3 py-1.5 flex justify-between items-center hover:bg-purple-50/50 cursor-pointer transition">
            <span className="text-slate-500 font-medium">Profile viewers</span>
            <span className="font-bold text-purple-700">142</span>
          </div>

          <div className="px-3 py-1.5 flex justify-between items-center hover:bg-purple-50/50 cursor-pointer transition">
            <span className="text-slate-500 font-medium">Post impressions</span>
            <span className="font-bold text-purple-700">1,820</span>
          </div>
        </div>

        {/* PM Fit Badge Widget */}
        <div
          onClick={() => setActiveTab('assessment')}
          className="p-3 bg-purple-50/60 border-t border-purple-100 text-left cursor-pointer hover:bg-purple-100/60 transition"
        >
          <div className="flex items-center space-x-1.5 text-purple-950 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>PM Fit Assessment</span>
          </div>
          <p className="text-[11px] text-purple-900 mt-0.5">
            Certified Score: <strong className="font-bold text-purple-950">88%</strong> (High-Agency Leader)
          </p>
        </div>

        {/* Saved Items */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="px-3 py-2 text-left border-t border-purple-50 hover:bg-purple-50/50 cursor-pointer transition flex items-center space-x-2 text-xs text-slate-600 font-medium"
        >
          <Bookmark className="w-3.5 h-3.5 text-purple-400" />
          <span>Saved PM Jobs & Resources</span>
        </div>
      </div>

      {/* Community Groups & Followed Hashtags */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-3 text-left">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-50">
          <span className="text-xs font-bold text-slate-700">Followed PM Topics</span>
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
        </div>

        <div className="space-y-1.5">
          {hashtags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTab('community')}
              className="w-full flex items-center space-x-2 text-xs text-slate-600 hover:text-purple-700 hover:bg-purple-50/60 px-2 py-1 rounded-lg transition text-left"
            >
              <Hash className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="truncate">{tag}</span>
            </button>
          ))}
        </div>

        <div
          onClick={() => setActiveTab('ai-tutor')}
          className="mt-3 pt-2 border-t border-purple-50 text-center"
        >
          <button className="text-xs font-semibold text-purple-700 hover:underline">
            Explore All Frameworks →
          </button>
        </div>
      </div>
    </aside>
  );
};
