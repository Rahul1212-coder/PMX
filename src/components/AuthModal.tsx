'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Lock, Mail, User, Briefcase, Building, Sparkles, CheckCircle2, AlertCircle, Database, ChevronRight, Eye, EyeOff } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white text-center relative">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20 shadow-inner">
            <Sparkles className="w-6 h-6 text-indigo-200" />
          </div>
          <h2 className="text-xl font-bold">
            {authModalTab === 'signin' ? 'Welcome Back to ProdCraft' : 'Join the PM Network'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            {authModalTab === 'signin'
              ? 'Access your saved jobs, assessment scores, and squad discussions'
              : 'Create your PM profile, track interview readiness, and contribute'}
          </p>

          {/* Connection Status Indicator */}
          <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 border border-white/20 backdrop-blur-md">
            <Database className="w-3 h-3 text-indigo-200" />
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
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              openAuthModal('signin');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-bold tracking-wide uppercase transition-colors ${
              authModalTab === 'signin'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
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
            className={`flex-1 py-3 text-xs font-bold tracking-wide uppercase transition-colors ${
              authModalTab === 'signup'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create PM Profile
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PM Role</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full text-xs pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Team</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Stripe, Linear"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="pm@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {authModalTab === 'signin' ? 'Sign In to Account' : 'Create PM Profile'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo Login for Offline / Quick Preview */}
          {!isConfigured && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={loginAsDemo}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instant Demo Login (Preview without Supabase credentials)</span>
              </button>
            </div>
          )}

          {/* Supabase Integration Drawer Toggle */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition flex items-center justify-center mx-auto space-x-1"
            >
              <Database className="w-3 h-3 text-indigo-500" />
              <span>{showSetupGuide ? 'Hide Supabase Setup Guide' : 'How to connect your live Supabase database?'}</span>
            </button>

            {showSetupGuide && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2 text-slate-600">
                <p className="font-semibold text-slate-800">3-Minute Supabase Connection:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>Create a free project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">supabase.com</a>.</li>
                  <li>Go to <strong>SQL Editor</strong> → copy contents of <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">supabase/schema.sql</code> → Click <strong>Run</strong>.</li>
                  <li>In <strong>Project Settings → API</strong>, copy your <em>Project URL</em> and <em>anon public key</em> into your <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">.env.local</code>:</li>
                </ol>
                <pre className="bg-slate-900 text-slate-200 p-2 rounded-lg text-[10px] overflow-x-auto">
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
