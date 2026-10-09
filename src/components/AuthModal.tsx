'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  Database,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    signIn,
    signUp,
    loginAsDemo,
    isConfigured,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Product Manager');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (authModalTab === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        }
      } else {
        if (!fullName.trim()) {
          setError('Full Name is required');
          setIsLoading(false);
          return;
        }
        const res = await signUp(email, password, {
          fullName,
          role,
          company: company.trim() || 'Independent PM',
        });
        if (res.error) {
          setError(res.error);
        } else if (res.message) {
          setSuccessMessage(res.message);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const pmRoles = [
    'Associate PM',
    'Product Manager',
    'Senior Product Manager',
    'Staff / Principal PM',
    'Group PM / Director',
    'VP / Chief Product Officer',
    'Aspiring PM / Transitioning',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-[#e0dfdc] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LinkedIn-style Header */}
        <div className="p-6 pb-4 text-left border-b border-slate-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-md bg-[#0a66c2] text-white font-black text-lg flex items-center justify-center shadow-xs">
              <span>pm</span>
            </div>
            <span className="font-extrabold text-[#191919] text-base tracking-tight">
              PM<span className="text-[#0a66c2]">Verse</span>
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {authModalTab === 'signin' ? 'Sign in' : 'Join the PM Network'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {authModalTab === 'signin'
              ? 'Stay updated on your product world, discussions, and opportunities'
              : 'Create your verified PM profile, connect with squads, and track skill tests'}
          </p>
        </div>

        {/* LinkedIn Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              openAuthModal('signin');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              authModalTab === 'signin'
                ? 'text-[#0a66c2] border-b-2 border-[#0a66c2] bg-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              openAuthModal('signup');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              authModalTab === 'signup'
                ? 'text-[#0a66c2] border-b-2 border-[#0a66c2] bg-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Join Now
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-left">
          {error && (
            <div className="flex items-start space-x-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-md text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-md text-xs">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {authModalTab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none text-[#191919]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PM Level
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:border-[#0a66c2] outline-none bg-white text-[#191919]"
                    >
                      {pmRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Squad
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Linear"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-[#0a66c2] outline-none text-[#191919]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="pm@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none text-[#191919]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 pr-10 border border-slate-300 rounded-md focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none text-[#191919]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold rounded-full transition shadow-xs flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {authModalTab === 'signin' ? 'Sign In' : 'Agree & Join PMVerse'}
                </span>
              )}
            </button>
          </form>

          {/* Instant Demo Login for Offline / Quick Preview */}
          {!isConfigured && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={loginAsDemo}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-full transition border border-slate-300"
              >
                Instant Demo Mode (Preview without credentials)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
