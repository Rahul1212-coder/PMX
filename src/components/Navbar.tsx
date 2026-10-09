'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';

export type NavTabType =
  | 'home'
  | 'mentor'
  | 'assess'
  | 'jobs'
  | 'tracker'
  | 'community'
  | 'connect'
  | 'learn';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { user, profile, signOut, openAuthModal, openProfileModal } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = user
    ? [
        {
          id: 'n-welcome',
          text: `Welcome to PMX, ${profile?.fullName || 'Product Manager'}! Your profile is connected. Explore the PM Fit assessment, AI Mentor, and job matches.`,
          time: 'Just now',
          unread: true,
        },
      ]
    : [];

  const navItems: Array<{ id: NavTabType; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'mentor', label: 'AI Mentor' },
    { id: 'assess', label: 'Assessment' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'community', label: 'Community' },
    { id: 'connect', label: 'Network' },
    { id: 'learn', label: 'Learn' },
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

  const displayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    (user ? (user.email ? user.email.split('@')[0] : 'Product Manager') : 'Guest PM');
  const displayRole = profile?.role
    ? `${profile.role}${profile.company ? ` @ ${profile.company}` : ''}`
    : (user ? 'Associate PM' : 'Sign in to personalize');

  return (
    <header className="sticky top-0 z-50 bg-[#f3f2f2] border-b-2 border-[rgba(32,30,29,0.15)] flex-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-6">
        {/* Left: Modernist PMX Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-baseline gap-2 cursor-pointer flex-shrink-0 select-none group"
        >
          <span className="font-extrabold text-2xl tracking-tighter text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
            PMX
          </span>
          <span className="w-2 h-2 bg-[#ec3013] inline-block mb-0.5"></span>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === 'assess' && activeTab === ('assessment' as any)) ||
              (item.id === 'mentor' && activeTab === ('ai-tutor' as any)) ||
              (item.id === 'jobs' && activeTab === 'tracker');

            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 cursor-pointer text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'text-[#ae1800] border-[#ec3013]'
                    : 'text-[#201e1d] border-transparent hover:text-[#ec3013]'
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </nav>

        {/* Right Actions: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="btn btn-icon btn-secondary relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#201e1d]" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#ec3013]"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#eae9e9] border border-[rgba(32,30,29,0.2)] shadow-lg z-50 text-left p-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(32,30,29,0.15)] mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#201e1d]">
                    Notifications
                  </span>
                  <span className="text-[11px] text-[#ae1800] font-semibold">1 Unread</span>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 bg-[#f3f2f2] border border-[rgba(32,30,29,0.15)] text-xs mb-1.5 space-y-1"
                    >
                      <p className="text-[#201e1d] leading-snug">{n.text}</p>
                      <span className="text-[10px] text-slate-500 font-semibold">{n.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Swatch & Menu */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer border border-[#201e1d] hover:border-[#ec3013] transition"
              >
                <UserAvatar name={displayName} src={profile?.avatarUrl} size="md" />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#eae9e9] border border-[rgba(32,30,29,0.2)] shadow-lg z-50 text-left p-3 animate-in fade-in zoom-in-95 duration-100">
                  <div className="pb-3 border-b border-[rgba(32,30,29,0.15)] mb-2">
                    <p className="font-extrabold text-sm text-[#201e1d] truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-600 truncate">{displayRole}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openProfileModal();
                      }}
                      className="w-full text-left py-2 px-2 hover:bg-[#f3f2f2] font-semibold text-[#201e1d] flex items-center justify-between"
                    >
                      <span>Edit Profile</span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setActiveTab('connect');
                      }}
                      className="w-full text-left py-2 px-2 hover:bg-[#f3f2f2] font-semibold text-[#201e1d] flex items-center justify-between"
                    >
                      <span>Manage Network</span>
                      <span className="font-bold text-[#ec3013]">
                        {profile?.connectionsCount || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setActiveTab('assess');
                      }}
                      className="w-full text-left py-2 px-2 hover:bg-[#f3f2f2] font-semibold text-[#201e1d] flex items-center justify-between"
                    >
                      <span>PM Fit Score</span>
                      <span className="font-bold text-[#ec3013]">
                        {profile?.pmFitScore ? `${profile.pmFitScore}/100` : 'Take test'}
                      </span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[rgba(32,30,29,0.15)] mt-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left py-1.5 px-2 text-xs font-bold text-[#ae1800] hover:bg-[#fff2ef] flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="btn btn-primary text-xs py-1.5 px-3.5"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
