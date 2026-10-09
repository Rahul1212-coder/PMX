'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Award, Users, TrendingUp, Compass, Hash, Sparkles, Camera, Plus, Calendar, ShieldCheck } from 'lucide-react';
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

  const displayName = profile?.fullName || user?.user_metadata?.full_name || (user ? (user.email ? user.email.split('@')[0] : 'Product Manager') : 'Product Leader');
  const displayRole = profile?.role
    ? `${profile.role}${profile.company ? ` @ ${profile.company}` : ''}`
    : (user ? 'Associate PM | Exploring Opportunities' : 'Staff PM @ Stripe | Ex-Google APM | FinTech & AI');

  return (
    <aside className="w-full space-y-2">
      {/* LinkedIn Profile Card */}
      <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm overflow-hidden text-center">
        {/* Cover photo banner */}
        <div className="h-16 bg-gradient-to-r from-slate-700 via-indigo-900 to-slate-800 relative">
          <div className="absolute inset-0 bg-slate-900/10" />
        </div>

        {/* Avatar with Initials Fallback & Edit Overlay */}
        <div className="-mt-9 flex justify-center">
          <div
            onClick={() => {
              if (user) openProfileModal();
              else openAuthModal('signin');
            }}
            className="relative group cursor-pointer"
            title={user ? 'Click to change profile picture or edit profile' : 'Sign in to customize'}
          >
            <UserAvatar
              src={profile?.avatarUrl}
              name={displayName}
              email={profile?.email || user?.email}
              size="2xl"
              className="border-2 border-white shadow-sm ring-1 ring-slate-200 bg-white"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white drop-shadow" />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 pb-4 border-b border-[#e0dfdc]">
          <h2
            onClick={() => {
              if (user) openProfileModal();
              else openAuthModal('signin');
            }}
            className="text-base font-bold text-slate-900 hover:underline cursor-pointer transition line-clamp-1"
          >
            {displayName}
          </h2>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 px-2 leading-relaxed">
            {displayRole}
          </p>

          {user ? (
            <button
              onClick={openProfileModal}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#0a66c2] hover:bg-[#ebf4fd] border border-[#0a66c2] transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Edit profile photo</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="mt-3 w-full py-1 text-xs font-semibold text-[#0a66c2] border border-[#0a66c2] rounded-full hover:bg-[#ebf4fd] transition"
            >
              Sign In to customize
            </button>
          )}
        </div>

        {/* Analytics stats (LinkedIn exact layout) */}
        <div className="py-2 text-left text-xs divide-y divide-slate-100">
          <div
            onClick={() => setActiveTab('connect')}
            className="px-3 py-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition"
          >
            <div>
              <p className="text-slate-500 font-medium">PM Network</p>
              <p className="font-bold text-slate-800 text-[11px]">Grow your connections</p>
            </div>
            <span className="font-bold text-[#0a66c2]">480+</span>
          </div>

          <div className="px-3 py-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition">
            <span className="text-slate-500 font-medium">Profile viewers</span>
            <span className="font-bold text-[#0a66c2]">142</span>
          </div>

          <div className="px-3 py-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition">
            <span className="text-slate-500 font-medium">Post impressions</span>
            <span className="font-bold text-[#0a66c2]">1,820</span>
          </div>
        </div>

        {/* LinkedIn Skill Assessment Badge Card */}
        <div
          onClick={() => setActiveTab('assessment')}
          className="p-3 bg-amber-50/70 border-t border-amber-200/80 text-left cursor-pointer hover:bg-amber-100/70 transition"
        >
          <div className="flex items-center space-x-1.5 text-amber-900 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Verified PM Assessment</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
            Badge: <strong className="font-bold text-amber-950">Certified PM (Top 12%)</strong>
          </p>
        </div>

        {/* Saved Items */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="px-3 py-2 text-left border-t border-[#e0dfdc] hover:bg-slate-50 cursor-pointer transition flex items-center space-x-2 text-xs text-slate-600 font-medium"
        >
          <Bookmark className="w-3.5 h-3.5 text-slate-500" />
          <span>My Items • Saved PM Jobs</span>
        </div>
      </div>

      {/* Community Groups & Followed Hashtags (LinkedIn Shortcuts) */}
      <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3 text-left">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Followed PM Topics</span>
          <Sparkles className="w-3.5 h-3.5 text-[#0a66c2]" />
        </div>

        <div className="space-y-1">
          {hashtags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTab('community')}
              className="w-full flex items-center space-x-2 text-xs text-slate-600 hover:text-[#0a66c2] hover:bg-slate-50 px-2 py-1 rounded transition text-left"
            >
              <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{tag}</span>
            </button>
          ))}
        </div>

        {/* Groups & Events */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
          <span className="text-[11px] font-bold text-[#0a66c2] block">Groups</span>
          <button
            onClick={() => setActiveTab('connect')}
            className="w-full text-left text-xs text-slate-600 hover:text-[#0a66c2] truncate block"
          >
            Ex-Google & Stripe PM Squad (3.2k)
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className="w-full text-left text-xs text-slate-600 hover:text-[#0a66c2] truncate block"
          >
            AI Native Product Managers
          </button>

          <div className="pt-1 flex items-center justify-between text-xs text-[#0a66c2] font-semibold cursor-pointer hover:underline">
            <span>Events (2)</span>
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('ai-tutor')}
          className="mt-3 pt-2 border-t border-slate-100 text-center"
        >
          <button className="text-xs font-semibold text-slate-500 hover:text-[#0a66c2] hover:underline">
            Discover more frameworks →
          </button>
        </div>
      </div>
    </aside>
  );
};
