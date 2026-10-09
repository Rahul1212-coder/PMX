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

  const displayName = profile?.fullName || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Product Manager');
  const displayRole = profile?.role
    ? `${profile.role}${profile.company ? ` @ ${profile.company}` : ''}`
    : (user ? 'Product Manager' : 'Product Management Platform');

  return (
    <aside className="w-full space-y-2">
      {/* LinkedIn Profile Card */}
      <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm overflow-hidden text-center">
        {/* Cover photo banner */}
        <div className="h-16 bg-gradient-to-r from-slate-700 via-indigo-900 to-slate-800 relative">
          <div className="absolute inset-0 bg-slate-900/10" />
        </div>

        {/* User Info / Guest Card */}
        {user ? (
          <>
            {/* Avatar with Initials Fallback & Edit Overlay */}
            <div className="-mt-9 flex justify-center">
              <div
                onClick={openProfileModal}
                className="relative group cursor-pointer"
                title="Click to edit profile or change photo"
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

            <div className="p-3 pb-3 border-b border-[#e0dfdc]">
              <h2
                onClick={openProfileModal}
                className="text-base font-bold text-slate-900 hover:underline cursor-pointer transition line-clamp-1"
              >
                {displayName}
              </h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 px-2 leading-relaxed">
                {displayRole}
              </p>

              <button
                onClick={openProfileModal}
                className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#0a66c2] hover:bg-[#ebf4fd] border border-[#0a66c2] transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Real Stats */}
            <div className="py-2 text-left text-xs divide-y divide-slate-100">
              <div
                onClick={() => setActiveTab('connect')}
                className="px-3 py-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition"
              >
                <div>
                  <p className="text-slate-500 font-medium">PM Network</p>
                  <p className="text-slate-400 text-[11px]">Connections</p>
                </div>
                <span className="font-bold text-[#0a66c2]">{profile?.connectionsCount || 0}</span>
              </div>

              <div className="px-3 py-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition">
                <span className="text-slate-500 font-medium">Profile viewers</span>
                <span className="font-bold text-slate-700">{profile?.profileViews || 0}</span>
              </div>

              <div className="px-3 py-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition">
                <span className="text-slate-500 font-medium">Post impressions</span>
                <span className="font-bold text-slate-700">{profile?.postImpressions || 0}</span>
              </div>
            </div>

            {/* Assessment Status / Badge */}
            <div
              onClick={() => setActiveTab('assessment')}
              className={`p-3 border-t text-left cursor-pointer transition ${
                profile?.pmFitScore
                  ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/70'
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                <Award className={`w-3.5 h-3.5 ${profile?.pmFitScore ? 'text-amber-600' : 'text-[#0a66c2]'}`} />
                <span>{profile?.pmFitScore ? 'Verified PM Assessment' : 'PM Skill Assessment'}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {profile?.pmFitScore
                  ? `Badge: Score ${profile.pmFitScore}% Verified`
                  : 'Take the 5-question test to earn a certified profile badge.'}
              </p>
            </div>

            {/* Saved Items */}
            <div
              onClick={() => setActiveTab('jobs')}
              className="px-3 py-2 text-left border-t border-[#e0dfdc] hover:bg-slate-50 cursor-pointer transition flex items-center space-x-2 text-xs text-slate-600 font-medium"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Saved PM Jobs & Items</span>
            </div>
          </>
        ) : (
          /* Guest Welcome Card */
          <div className="p-4 space-y-3">
            <div className="-mt-8 flex justify-center">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-[#0a66c2] text-xl font-black">
                pm
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Welcome to PMVerse
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                The professional community platform for Product Managers, Leaders & APMs.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full py-1.5 px-3 rounded-full text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] transition shadow-xs"
              >
                Join PMVerse
              </button>
              <button
                onClick={() => openAuthModal('signin')}
                className="w-full py-1.5 px-3 rounded-full text-xs font-semibold text-[#0a66c2] border border-[#0a66c2] hover:bg-[#ebf4fd] transition"
              >
                Sign In
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-left text-[11px] text-slate-600 space-y-1.5">
              <p className="flex items-center space-x-1.5">
                <span className="text-[#0a66c2] font-bold">✓</span>
                <span>Share frameworks & roadmaps</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span className="text-[#0a66c2] font-bold">✓</span>
                <span>Connect with fellow PMs</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span className="text-[#0a66c2] font-bold">✓</span>
                <span>Discover open PM opportunities</span>
              </p>
            </div>
          </div>
        )}
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

        {/* Groups & Topics */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
          <span className="text-[11px] font-bold text-[#0a66c2] block">Product Groups</span>
          <button
            onClick={() => setActiveTab('connect')}
            className="w-full text-left text-xs text-slate-600 hover:text-[#0a66c2] truncate block"
          >
            AI Native Product Managers
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className="w-full text-left text-xs text-slate-600 hover:text-[#0a66c2] truncate block"
          >
            Product-Led Growth (PLG)
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className="w-full text-left text-xs text-slate-600 hover:text-[#0a66c2] truncate block"
          >
            Continuous Discovery & Roadmaps
          </button>

          <div
            onClick={() => setActiveTab('connect')}
            className="pt-1 flex items-center justify-between text-xs text-[#0a66c2] font-semibold cursor-pointer hover:underline"
          >
            <span>Explore PM Network</span>
            <Compass className="w-3.5 h-3.5" />
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
