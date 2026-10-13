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
  | 'resume'
  | 'mentor'
  | 'assess'
  | 'jobs'
  | 'tracker'
  | 'community'
  | 'circles'
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
          text: `Welcome to PMVerse, ${profile?.fullName || 'Product Manager'}! Your profile is connected. Explore the PM Fit assessment, AI Mentor, and job matches.`,
          time: 'Just now',
          unread: true,
        },
      ]
    : [];

  const navItems: Array<{ id: NavTabType; label: string; badge?: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'resume', label: 'Resume AI', badge: 'AI' },
    { id: 'mentor', label: 'AI Mentor' },
    { id: 'assess', label: 'Assessment' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'community', label: 'Community' },
    { id: 'circles', label: 'Circles' },
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
        {/* Left: Modernist PMVerse Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer flex-shrink-0 select-none group"
        >
          <img
            src="/pmverse-mark.png"
            alt="PMVerse"
            className="w-6 h-6 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-black text-2xl tracking-tight text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
            PMVerse
          </span>
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
                className={`px-3 py-1.5 cursor-pointer text-sm font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#ae1800] border-[#ec3013]'
                    : 'text-[#201e1d] border-transparent hover:text-[#ec3013]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#ef2b18]/10 text-[#ef2b18] border border-[#ef2b18]/20">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Join Discord Community Button */}
          <a
            href="https://discord.gg/S29SKDcWe"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-xs font-bold py-1.5 px-2.5 flex items-center gap-1.5 hover:text-[#5865F2] hover:border-[#5865F2]/40 transition"
            title="Join the PMVerse Discord Community"
          >
            <svg className="w-4 h-4 fill-current text-[#5865F2]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="hidden sm:inline">Join Discord</span>
          </a>

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
                        setActiveTab('circles');
                      }}
                      className="w-full text-left py-2 px-2 hover:bg-[#f3f2f2] font-semibold text-[#201e1d] flex items-center justify-between"
                    >
                      <span>Your Circles</span>
                      <span className="text-xs">⭕</span>
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
                    <a
                      href="https://discord.gg/S29SKDcWe"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left py-2 px-2 hover:bg-[#f3f2f2] font-semibold text-[#5865F2] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        <span>Join Discord Community</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#5865F2]" />
                    </a>
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
