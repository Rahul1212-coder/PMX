'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Home, Users, Briefcase, Sparkles, Compass, Bell, Search, ChevronDown, LogIn, LogOut, Database, Bookmark, Award, Check, Camera, User } from 'lucide-react';
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

  const notifications = [
    {
      id: 'n-1',
      text: 'Elena Rostova (Staff PM @ Stripe) published a new breakdown on 6-week problem bets.',
      time: '15m ago',
      unread: true,
    },
    {
      id: 'n-2',
      text: 'Maya Lin (Director of Product @ Figma) accepted your connection invitation.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 'n-3',
      text: 'Linear just posted a new Senior Product Manager role matching your skills.',
      time: '3h ago',
      unread: false,
    },
  ];

  const navItems = [
    { id: 'community' as const, label: 'Home', icon: Home },
    { id: 'connect' as const, label: 'My Network', icon: Users, badge: '2' },
    { id: 'jobs' as const, label: 'Jobs', icon: Briefcase },
    { id: 'ai-tutor' as const, label: 'AI Tutor', icon: Sparkles },
    { id: 'assessment' as const, label: 'Fit Test', icon: Compass },
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-purple-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand Logo & Search Bar */}
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            {/* PMVerse brand icon & logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0"
              onClick={() => setActiveTab('community')}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-900/10 border border-purple-200/60 flex items-center justify-center p-1 shadow-sm">
                <img src="/pmverse-icon.png" alt="PMVerse Icon" className="w-full h-full object-contain" />
              </div>
              <span className="hidden xl:inline-block font-black text-slate-900 text-lg tracking-tight">
                PM<span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">Verse</span>
              </span>
            </div>

            {/* PM Search Input */}
            <div className="relative w-full max-w-xs hidden sm:block">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="Search PMs, frameworks, teardowns..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-purple-50/50 hover:bg-purple-50 border border-purple-100 focus:border-purple-300 focus:bg-white rounded-xl transition outline-none"
              />
            </div>
          </div>

          {/* Center/Right: Vertical Navigation Icons */}
          <nav className="flex items-center space-x-1 sm:space-x-3 md:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center px-2 sm:px-3 py-1 relative group cursor-pointer transition ${
                    isActive ? 'text-purple-700' : 'text-slate-500 hover:text-purple-900'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium hidden md:inline mt-0.5">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-purple-700 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`flex flex-col items-center justify-center px-2 sm:px-3 py-1 relative text-slate-500 hover:text-purple-900 transition ${
                  isNotificationsOpen ? 'text-purple-700' : ''
                }`}
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-2 bg-purple-700 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </div>
                <span className="text-[11px] font-medium hidden md:inline mt-0.5">
                  Notifications
                </span>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-purple-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <span className="text-[11px] text-purple-700 font-semibold cursor-pointer hover:underline">
                      Mark all as read
                    </span>
                  </div>
                  <div className="divide-y divide-purple-50 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-purple-50/50 cursor-pointer transition flex items-start space-x-2 ${
                          n.unread ? 'bg-purple-50/30' : ''
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-purple-600' : 'bg-transparent'}`} />
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

            {/* Profile ("Me") Menu with User Avatar / Initials */}
            <div className="relative pl-1 border-l border-slate-200" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex flex-col items-center justify-center px-1.5 py-0.5 text-slate-600 hover:text-purple-900 transition"
              >
                <UserAvatar
                  src={profile?.avatarUrl}
                  name={profile?.fullName || user?.user_metadata?.full_name}
                  email={profile?.email || user?.email}
                  size="xs"
                  className="border border-purple-200 shadow-xs"
                />
                <div className="hidden md:flex items-center space-x-0.5 mt-0.5">
                  <span className="text-[11px] font-medium text-slate-700">
                    {profile?.fullName ? profile.fullName.split(' ')[0] : (user ? (user.email ? user.email.split('@')[0] : 'PM') : 'Me')}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 text-left animate-in fade-in zoom-in-95">
                  {/* User Card Top */}
                  <div className="px-4 py-3 border-b border-purple-100 flex items-start space-x-3 bg-purple-50/30">
                    <div
                      className="relative group cursor-pointer flex-shrink-0"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (user) {
                          openProfileModal();
                        } else {
                          openAuthModal('signin');
                        }
                      }}
                      title="Click to change profile picture"
                    >
                      <UserAvatar
                        src={profile?.avatarUrl}
                        name={profile?.fullName || user?.user_metadata?.full_name}
                        email={profile?.email || user?.email}
                        size="lg"
                        className="border-2 border-white shadow-sm ring-2 ring-purple-200/70"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profile?.fullName || user?.user_metadata?.full_name || (user ? (user.email ? user.email.split('@')[0] : 'Product Manager') : 'Guest PM')}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {profile?.role || 'Associate PM'}{profile?.company ? ` @ ${profile.company}` : ''}
                      </p>
                      {user?.email && (
                        <p className="text-[10px] text-purple-700 truncate font-medium mt-0.5">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1 text-xs">
                    {user && (
                      <button
                        onClick={() => {
                          openProfileModal();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-purple-800 hover:bg-purple-50 flex items-center space-x-2 font-semibold"
                      >
                        <Camera className="w-3.5 h-3.5 text-purple-600" />
                        <span>Edit Profile & Photo</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('connect');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-purple-50 flex items-center space-x-2"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Manage PM Network (480+)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('jobs');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-purple-50 flex items-center space-x-2"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                      <span>Saved PM Jobs</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('assessment');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-purple-50 flex items-center space-x-2"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>PM Fit Score: 88% (Certified)</span>
                    </button>
                  </div>

                  {/* Sign In / Sign Out */}
                  <div className="border-t border-purple-100 pt-1">
                    {user ? (
                      <button
                        onClick={() => {
                          signOut();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
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
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center space-x-2"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to PM Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
