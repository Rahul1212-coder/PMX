'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Users,
  Briefcase,
  Sparkles,
  Award,
  Bell,
  Search,
  ChevronDown,
  LogIn,
  LogOut,
  Bookmark,
  Camera,
  Compass,
  CheckCircle2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  activeTab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment';
  setActiveTab: (tab: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment') => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { user, profile, signOut, openAuthModal, openProfileModal, isConfigured } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = user
    ? [
        {
          id: 'n-welcome',
          text: `Welcome to PMVerse, ${profile?.fullName || 'Product Manager'}! Your profile is active. Share teardowns, connect with PMs, and explore open roles.`,
          time: 'Just now',
          unread: true,
        },
      ]
    : [];

  const navItems: Array<{
    id: 'community' | 'connect' | 'jobs' | 'ai-tutor' | 'assessment';
    label: string;
    icon: any;
    badge?: string;
  }> = [
    { id: 'community', label: 'Home', icon: Home },
    { id: 'connect', label: 'My Network', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'ai-tutor', label: 'Learning', icon: Sparkles },
    { id: 'assessment', label: 'Skill Test', icon: Award },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.fullName || user?.user_metadata?.full_name || (user ? (user.email ? user.email.split('@')[0] : 'Product Manager') : 'Guest PM');
  const displayRole = profile?.role
    ? `${profile.role}${profile.company ? ` @ ${profile.company}` : ''}`
    : (user ? 'Associate PM' : 'Sign in to personalize');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e0dfdc] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[53px]">
          {/* Left: Brand & LinkedIn-style Search Input */}
          <div className="flex items-center space-x-2.5 flex-1 max-w-sm sm:max-w-md">
            {/* Square PM logo badge (LinkedIn iconic aesthetic) */}
            <div
              className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
              onClick={() => setActiveTab('community')}
            >
              <div className="w-[34px] h-[34px] rounded-md bg-[#0a66c2] text-white font-black text-xl flex items-center justify-center shadow-sm select-none">
                <span>pm</span>
              </div>
              <span className="hidden xl:inline-block font-extrabold text-[#191919] text-base tracking-tight">
                PM<span className="text-[#0a66c2]">Verse</span>
              </span>
            </div>

            {/* LinkedIn-style Search Input */}
            <div className="relative w-full max-w-[280px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="Search PMs, frameworks, jobs..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#edf3f8] hover:bg-[#e4ecf4] focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 border border-transparent rounded-md transition outline-none text-[#191919] placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Right: Vertical Navigation Icons */}
          <nav className="flex items-center space-x-1 sm:space-x-1 md:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[52px] relative group cursor-pointer transition ${
                    isActive ? 'text-[#191919]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition ${isActive ? 'text-[#0a66c2]' : 'text-slate-600 group-hover:text-slate-900'}`} />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium hidden md:inline mt-0.5 ${isActive ? 'text-[#191919] font-bold' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#191919]" />
                  )}
                </button>
              );
            })}

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[52px] relative text-slate-500 hover:text-slate-900 transition ${
                  isNotificationsOpen ? 'text-[#191919]' : ''
                }`}
              >
                <div className="relative">
                  <Bell className="w-5 h-5 text-slate-600 hover:text-slate-900" />
                  <span className="absolute -top-1.5 -right-2 bg-[#0a66c2] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </div>
                <span className="text-[11px] font-medium hidden md:inline mt-0.5 text-slate-600">
                  Notifications
                </span>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-[#e0dfdc] py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <span className="text-[11px] text-[#0a66c2] font-semibold cursor-pointer hover:underline">
                      Mark all as read
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start space-x-2 ${
                          n.unread ? 'bg-sky-50/50' : ''
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-[#0a66c2]' : 'bg-transparent'}`} />
                        <div>
                          <p className="text-slate-700 leading-snug">{n.text}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile ("Me") Menu (LinkedIn style) */}
            <div className="relative pl-1 border-l border-slate-200" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[56px] h-[52px] text-slate-600 hover:text-slate-900 transition"
              >
                <UserAvatar
                  src={profile?.avatarUrl}
                  name={displayName}
                  email={profile?.email || user?.email}
                  size="xs"
                  className="border border-slate-300 shadow-xs"
                />
                <div className="hidden md:flex items-center space-x-0.5 mt-0.5">
                  <span className="text-[11px] font-medium text-slate-700">
                    {profile?.fullName ? profile.fullName.split(' ')[0] : (user ? (user.email ? user.email.split('@')[0] : 'PM') : 'Me')}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </button>

              {/* LinkedIn-style Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-[#e0dfdc] py-2 z-50 text-left animate-in fade-in zoom-in-95">
                  {/* User Profile Header Card */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-start space-x-3">
                      <UserAvatar
                        src={profile?.avatarUrl}
                        name={displayName}
                        email={profile?.email || user?.email}
                        size="lg"
                        className="border border-slate-300 shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                          {displayRole}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (user) openProfileModal();
                        else openAuthModal('signin');
                      }}
                      className="mt-3 w-full py-1 text-xs font-semibold text-[#0a66c2] border border-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2 rounded-full transition text-center"
                    >
                      {user ? 'View / Edit PM Profile' : 'Sign In to Profile'}
                    </button>
                  </div>

                  {/* Section: Manage */}
                  <div className="py-1.5 border-b border-slate-100 text-xs">
                    <span className="px-4 py-1 text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                      Manage
                    </span>

                    {user && (
                      <button
                        onClick={() => {
                          openProfileModal();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>Change Profile Picture</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('connect');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>PM Network (480+)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('jobs');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>Saved PM Jobs</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('assessment');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>PM Skill Certification</span>
                    </button>
                  </div>

                  {/* Section: Account & Auth */}
                  <div className="pt-1.5 text-xs">
                    {user ? (
                      <button
                        onClick={() => {
                          signOut();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          openAuthModal('signin');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 font-semibold text-[#0a66c2] hover:bg-[#ebf4fd] flex items-center space-x-2"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Guest Actions or PM Certified Link */}
            {!user ? (
              <div className="hidden sm:flex items-center space-x-1.5 pl-2 border-l border-slate-200">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1 text-xs font-semibold text-[#0a66c2] hover:bg-[#ebf4fd] rounded-full transition whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3.5 py-1 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full transition shadow-xs whitespace-nowrap"
                >
                  Join PMVerse
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center pl-3 border-l border-slate-200">
                <button
                  onClick={() => setActiveTab('assessment')}
                  className="text-[11px] text-[#915907] hover:underline leading-tight text-center max-w-[80px]"
                >
                  PM Certified Badge
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
