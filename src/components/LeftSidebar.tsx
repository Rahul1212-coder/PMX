'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Award, Users, TrendingUp, Compass, Hash, Sparkles, Camera, Plus, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
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

  const emailPrefix = user?.email ? user.email.split('@')[0] : '';
  const candidateName =
    (profile?.fullName && !profile.fullName.includes('@') ? profile.fullName.trim() : '') ||
    (user?.user_metadata?.full_name ? String(user.user_metadata.full_name).trim() : '') ||
    (user?.user_metadata?.name ? String(user.user_metadata.name).trim() : '') ||
    (profile?.fullName ? profile.fullName.trim() : '') ||
    emailPrefix;

  const displayName = candidateName || (user ? 'Member' : 'Product Manager');
  const displayRole = profile?.role
    ? `${profile.role}${profile.company ? ` @ ${profile.company}` : ''}`
    : (user ? 'Select your PM title' : 'Product Management Platform');

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

      {/* Join Discord Banner Card */}
      <div className="bg-[#5865F2] text-white rounded-lg p-3.5 shadow-sm text-left relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="font-extrabold text-sm tracking-tight">Join PMVerse Discord</span>
          </div>
          <p className="text-[11px] text-white/90 leading-relaxed">
            Connect with 1,200+ PMs for real-time portfolio teardowns, live mock interviews & career guidance.
          </p>
          <a
            href="https://discord.gg/S29SKDcWe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-white text-[#5865F2] hover:bg-slate-100 rounded text-xs font-bold transition shadow-sm"
          >
            <span>Join Discord Server</span>
            <ExternalLink className="w-3 h-3" />
          </a>
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
