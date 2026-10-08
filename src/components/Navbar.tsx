'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Users, Sparkles, Briefcase, Compass, LogIn, LogOut, Database, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  activeTab: 'community' | 'ai-tutor' | 'jobs' | 'assessment';
  setActiveTab: (tab: 'community' | 'ai-tutor' | 'jobs' | 'assessment') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, profile, signOut, openAuthModal, isConfigured } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'community' as const, label: 'Community', icon: Users, badge: 'Active' },
    { id: 'ai-tutor' as const, label: 'AI PM Tutor', icon: Sparkles, badge: 'GPT-4o' },
    { id: 'jobs' as const, label: 'Job Board', icon: Briefcase, badge: 'Curated' },
    { id: 'assessment' as const, label: 'Fit Diagnostic', icon: Compass, badge: 'Quiz' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Icon */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('community')}
          >
            <div className="relative w-10 h-10 rounded-xl p-1 bg-gradient-to-br from-purple-100 to-violet-50 border border-purple-200/60 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center">
              <img
                src="/pmverse-icon.png"
                alt="PMVerse Icon"
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex items-center">
              <img
                src="/pmverse-logo.png"
                alt="PMVerse"
                className="h-7 w-auto object-contain hidden sm:block"
              />
              <span className="sm:hidden text-xl font-black bg-gradient-to-r from-[#230554] to-[#9333ea] bg-clip-text text-transparent">
                PMVerse
              </span>
              <span className="hidden lg:inline-block ml-2.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                Universe
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-600/30'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.id === activeTab && (
                    <span className="inline md:hidden">{tab.label.split(' ')[0]}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Auth & Profile Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Diagnostic Callout */}
            <button
              onClick={() => setActiveTab('assessment')}
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-200/80 hover:bg-purple-100 transition-colors"
            >
              <span>Fit Diagnostic</span>
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            </button>

            {user && profile ? (
              /* Authenticated User Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-purple-50/70 transition border border-transparent hover:border-purple-200"
                >
                  <img
                    src={
                      profile.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                    }
                    alt={profile.fullName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 shadow-sm"
                  />
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-bold text-slate-800 line-clamp-1">{profile.fullName}</p>
                    <p className="text-[10px] text-purple-700 font-medium line-clamp-1">{profile.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-purple-50 bg-gradient-to-b from-purple-50/40 to-white">
                      <p className="text-sm font-bold text-slate-900">{profile.fullName}</p>
                      <p className="text-xs text-purple-700 font-semibold">
                        {profile.role} {profile.company ? `@ ${profile.company}` : ''}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{profile.email}</p>

                      {/* Connection pill */}
                      <div className="mt-2.5 flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 border border-purple-200 text-purple-800">
                        <Database className="w-3 h-3 text-purple-600" />
                        <span>{isConfigured ? 'Supabase Live Connected' : 'Demo Profile'}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setActiveTab('jobs');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-purple-50 flex items-center space-x-2"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                        <span>Saved PM Jobs</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('assessment');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-purple-50 flex items-center space-x-2"
                      >
                        <Compass className="w-3.5 h-3.5 text-purple-600" />
                        <span>PM Diagnostic History</span>
                      </button>
                    </div>

                    <div className="border-t border-purple-50 pt-1">
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
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out: Sign In Button */
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
