'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Lock, Mail, User, Briefcase, Building, CheckCircle2, AlertCircle, Database, ChevronRight, Eye, EyeOff, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-purple-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with PMVerse Icon */}
        <div className="bg-gradient-to-br from-[#1c053a] via-[#2f0857] to-[#4c1d95] p-6 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20 shadow-inner p-1">
            <img src="/pmverse-icon.png" alt="PMVerse Icon" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {authModalTab === 'signin' ? 'Welcome to PMVerse' : 'Join the PMVerse Network'}
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            {authModalTab === 'signin'
              ? 'Access saved PM jobs, assessment history, and community teardowns'
              : 'Create your PM profile, track interview readiness, and contribute'}
          </p>

          {/* Connection Status Indicator */}
          <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 border border-white/20 backdrop-blur-md">
            <Database className="w-3 h-3 text-purple-300" />
            <span>
              {isConfigured ? 'Supabase Live Connected' : 'Supabase Demo / Offline Mode'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-100 bg-purple-50/30">
          <button
            type="button"
            onClick={() => {
              openAuthModal('signin');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${
              authModalTab === 'signin'
                ? 'text-purple-700 border-b-2 border-purple-700 bg-white'
                : 'text-slate-500 hover:text-purple-900'
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
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${
              authModalTab === 'signup'
                ? 'text-purple-700 border-b-2 border-purple-700 bg-white'
                : 'text-slate-500 hover:text-purple-900'
            }`}
          >
            Create PM Profile
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalTab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-sm pl-10 pr-3 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PM Level</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full text-xs pl-8 pr-2 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                      >
                        {pmRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company / Squad</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Stripe, Linear"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="pm@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-10 pr-3 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-purple-400 hover:text-purple-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {authModalTab === 'signin' ? 'Sign In to PMVerse' : 'Create PM Profile'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo Login for Offline / Quick Preview */}
          {!isConfigured && (
            <div className="pt-2 border-t border-purple-50 text-center">
              <button
                type="button"
                onClick={loginAsDemo}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 border border-purple-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Instant Demo Login (Preview without credentials)</span>
              </button>
            </div>
          )}

          {/* Supabase Integration Drawer Toggle */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 transition flex items-center justify-center mx-auto space-x-1"
            >
              <Database className="w-3 h-3 text-purple-600" />
              <span>{showSetupGuide ? 'Hide Supabase Setup Guide' : 'How to connect your live Supabase database?'}</span>
            </button>

            {showSetupGuide && (
              <div className="mt-3 p-3 bg-purple-50/50 border border-purple-100 rounded-2xl text-left text-xs space-y-2 text-slate-700">
                <p className="font-bold text-purple-950">3-Minute Supabase Connection:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>Create a free project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-purple-700 font-bold underline">supabase.com</a>.</li>
                  <li>In <strong>SQL Editor</strong>, run the contents of <code className="bg-purple-100 px-1 py-0.5 rounded text-[10px] font-mono">supabase/schema.sql</code>.</li>
                  <li>In <strong>Project Settings → API</strong>, add your URL and anon key to <code className="bg-purple-100 px-1 py-0.5 rounded text-[10px] font-mono">.env.local</code> without angle brackets:</li>
                </ol>
                <pre className="bg-[#1c053a] text-purple-200 p-2.5 rounded-xl text-[10px] overflow-x-auto font-mono">
{`NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
