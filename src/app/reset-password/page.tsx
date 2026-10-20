'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Mail,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [emailForNewLink, setEmailForNewLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setHasRecoverySession(true);
      setIsCheckingAuth(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsCheckingAuth(false);
      return;
    }

    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasRecoverySession(true);
      }
      setIsCheckingAuth(false);
    });

    // 2. Listen for auth changes, including PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasRecoverySession(true);
      }
      setIsCheckingAuth(false);
    });

    // 3. Fallback check for URL hash with recovery token
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        setHasRecoverySession(true);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (!configured) {
        setSuccessMessage('Password updated successfully (Demo Mode). Redirecting to PMVerse...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccessMessage('Your password has been updated successfully! Redirecting to PMVerse...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForNewLink.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(emailForNewLink.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetErr) {
        setError(resetErr.message);
      } else {
        setSuccessMessage('A fresh password reset link has been emailed to you. Please check your inbox.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f3f2f2] text-[#201e1d] p-4">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-md w-full shadow-2xl text-left relative my-8">
        {/* Header */}
        <div className="p-6 pb-4 border-b-2 border-[rgba(32,30,29,0.15)]">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <img src="/pmverse-mark.png" alt="PMVerse" className="w-6 h-6 object-contain" />
            <span className="font-black text-2xl tracking-tight text-[#201e1d]">PMVerse</span>
          </Link>

          <h1 className="text-xl font-black text-[#201e1d] m-0">
            {hasRecoverySession ? 'Set New Password' : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-[#605d5d] mt-1">
            {hasRecoverySession
              ? 'Create a strong, new password with at least 6 characters.'
              : 'Enter your email to receive a secure password reset link.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-900 border border-rose-300 p-3.5 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3.5 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {isCheckingAuth ? (
            <div className="py-8 text-center text-xs font-bold text-slate-500">
              Verifying security credentials...
            </div>
          ) : hasRecoverySession ? (
            /* Set New Password Form */
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#201e1d] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    autoFocus
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

              <div>
                <label className="block text-xs font-bold text-[#201e1d] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5 text-xs font-bold mt-2 flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {isLoading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          ) : (
            /* Request New Link Form (if opened without active session) */
            <form onSubmit={handleRequestNewLink} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                If your reset link expired or you arrived here directly, enter your email below to receive a new one.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#201e1d] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="pm@company.com"
                  value={emailForNewLink}
                  onChange={(e) => setEmailForNewLink(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                {isLoading ? 'Sending Link...' : 'Email Reset Link'}
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-[rgba(32,30,29,0.15)] text-center">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-[#201e1d] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to PMVerse Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
