'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-md w-full shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 btn btn-icon btn-secondary"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modernist Header */}
        <div className="p-6 pb-4 border-b-2 border-[rgba(32,30,29,0.15)]">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-black text-2xl tracking-tighter text-[#201e1d]">PMVerse</span>
            <span className="w-2 h-2 bg-[#ec3013]"></span>
          </div>

          <h2 className="text-xl font-black text-[#201e1d] m-0">
            {authModalTab === 'signin' ? 'Sign in to PMVerse' : 'Join the Product Network'}
          </h2>
          <p className="text-xs text-[#605d5d] mt-1">
            {authModalTab === 'signin'
              ? 'Stay updated on product frameworks, peer discussions, and open roles.'
              : 'Create your verified PM profile, take the diagnostic, and connect with peers.'}
          </p>
        </div>

        {/* Modernist Segmented Tabs */}
        <div className="flex border-b-2 border-[rgba(32,30,29,0.15)] bg-[#eae9e9]">
          <button
            type="button"
            onClick={() => {
              openAuthModal('signin');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors border-r border-[rgba(32,30,29,0.15)] ${
              authModalTab === 'signin'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
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
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[rgba(32,30,29,0.06)]'
            }`}
          >
            Join Now
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-900 border border-rose-300 p-3.5 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                <span className="font-bold">{error}</span>
              </div>
              {error.toLowerCase().includes('rate limit') && (
                <div className="pt-2 border-t border-rose-200 text-[11px] leading-relaxed space-y-1">
                  <p className="font-bold text-rose-900">How to fix in Supabase:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                    <li>Open your Supabase Dashboard</li>
                    <li>Go to Authentication &rarr; Providers &rarr; Email</li>
                    <li>Toggle OFF &quot;Confirm email&quot; and click Save</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="flex items-start space-x-2 bg-emerald-50 text-emerald-900 border border-emerald-300 p-3 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {authModalTab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#201e1d] mb-1">
                      PM Level
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="input bg-white"
                    >
                      {pmRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201e1d] mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="Organization"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#201e1d] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="pm@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#201e1d] mb-1">
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
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-2.5 text-xs font-bold mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <span>{authModalTab === 'signin' ? 'Sign In' : 'Agree & Join PMVerse'}</span>
              )}
            </button>
          </form>

          {!isConfigured && (
            <div className="pt-2 border-t border-[rgba(32,30,29,0.15)] text-center">
              <button
                type="button"
                onClick={loginAsDemo}
                className="btn btn-secondary w-full text-xs font-bold"
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
