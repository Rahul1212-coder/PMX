'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Users, Sparkles, Briefcase, Compass, Award, LogIn, LogOut, User, CheckCircle2, Database, ChevronDown } from 'lucide-react';
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
    { id: 'community' as const, label: 'Community Feed', icon: Users, badge: 'Active' },
    { id: 'ai-tutor' as const, label: 'AI Term Tutor', icon: Sparkles, badge: 'GPT-4o' },
    { id: 'jobs' as const, label: 'PM Job Board', icon: Briefcase, badge: 'New' },
    { id: 'assessment' as const, label: 'PM Fit Diagnostic', icon: Compass, badge: 'Quiz' },
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('community')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ProdCraft
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                PM Hub & Copilot
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
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
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
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <span>PM Fit Test</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>

            {user && profile ? (
              /* Authenticated User Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  <img
                    src={
                      profile.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                    }
                    alt={profile.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                  />
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-slate-800 line-clamp-1">{profile.fullName}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{profile.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{profile.fullName}</p>
                      <p className="text-xs text-indigo-600 font-medium">
                        {profile.role} {profile.company ? `@ ${profile.company}` : ''}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{profile.email}</p>

                      {/* Connection pill */}
                      <div className="mt-2.5 flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-600">
                        <Database className="w-3 h-3 text-indigo-500" />
                        <span>{isConfigured ? 'Live Supabase DB' : 'Demo Profile'}</span>
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
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>Saved PM Jobs</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('assessment');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <Compass className="w-3.5 h-3.5 text-slate-400" />
                        <span>PM Diagnostic Results</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          signOut();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2"
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
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition"
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
