'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PmStage } from '@/types';
import {
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  RefreshCw,
  GraduationCap,
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
  const [pmStage, setPmStage] = useState<PmStage>('existing_pm');
  const [role, setRole] = useState('Product Manager');
  const [previousRole, setPreviousRole] = useState('Software Engineer');
  const [company, setCompany] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(3);
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

        let classifiedRole = role;
        let classifiedCompany = company.trim();

        if (pmStage === 'existing_pm') {
          classifiedRole = role;
          classifiedCompany = company.trim() || 'Tech Squad';
        } else if (pmStage === 'switching_roles') {
          classifiedRole = previousRole ? `Aspiring PM (ex-${previousRole})` : 'Aspiring PM (Career Switcher)';
          classifiedCompany = company.trim() || 'Transitioning Professional';
        } else if (pmStage === 'fresher') {
          classifiedRole = 'Aspiring Associate PM (Fresher)';
          classifiedCompany = company.trim() || 'Recent Graduate';
        }

        const res = await signUp(email, password, {
          fullName,
          role: classifiedRole,
          company: classifiedCompany,
          pmStage,
          previousRole: pmStage === 'switching_roles' ? previousRole : undefined,
          yearsOfExperience: pmStage === 'fresher' ? 0 : yearsOfExperience,
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
  ];

  const switcherRoles = [
    'Software Engineer',
    'Product Designer',
    'Data Analyst / Scientist',
    'QA / SDET Engineer',
    'Consultant / BizOps',
    'Sales / Solutions Engineer',
    'Project Manager / Scrum Master',
    'Marketing / Growth',
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
                {/* 1. Journey Stage Question */}
                <div>
                  <label className="block text-xs font-bold text-[#201e1d] mb-1.5">
                    What best describes your current product path?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPmStage('existing_pm');
                        setRole('Product Manager');
                        setYearsOfExperience(3);
                      }}
                      className={`p-2 text-left border-2 transition-all flex flex-col justify-between min-h-[72px] ${
                        pmStage === 'existing_pm'
                          ? 'border-[#ec3013] bg-[#fdf3f2]'
                          : 'border-[rgba(32,30,29,0.15)] bg-white hover:border-[#201e1d]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Briefcase className={`w-3.5 h-3.5 ${pmStage === 'existing_pm' ? 'text-[#ec3013]' : 'text-[#605d5d]'}`} />
                        {pmStage === 'existing_pm' && <span className="w-1.5 h-1.5 bg-[#ec3013]" />}
                      </div>
                      <div className="mt-1">
                        <div className="font-extrabold text-[11px] text-[#201e1d] leading-tight">
                          Already a PM
                        </div>
                        <div className="text-[10px] text-[#605d5d] leading-tight">
                          Working PM
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPmStage('switching_roles');
                        setRole('Aspiring PM');
                        setYearsOfExperience(2);
                      }}
                      className={`p-2 text-left border-2 transition-all flex flex-col justify-between min-h-[72px] ${
                        pmStage === 'switching_roles'
                          ? 'border-[#ec3013] bg-[#fdf3f2]'
                          : 'border-[rgba(32,30,29,0.15)] bg-white hover:border-[#201e1d]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <RefreshCw className={`w-3.5 h-3.5 ${pmStage === 'switching_roles' ? 'text-[#ec3013]' : 'text-[#605d5d]'}`} />
                        {pmStage === 'switching_roles' && <span className="w-1.5 h-1.5 bg-[#ec3013]" />}
                      </div>
                      <div className="mt-1">
                        <div className="font-extrabold text-[11px] text-[#201e1d] leading-tight">
                          Switching Role
                        </div>
                        <div className="text-[10px] text-[#605d5d] leading-tight">
                          Eng, Design, QA...
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPmStage('fresher');
                        setRole('Associate PM');
                        setYearsOfExperience(0);
                      }}
                      className={`p-2 text-left border-2 transition-all flex flex-col justify-between min-h-[72px] ${
                        pmStage === 'fresher'
                          ? 'border-[#ec3013] bg-[#fdf3f2]'
                          : 'border-[rgba(32,30,29,0.15)] bg-white hover:border-[#201e1d]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <GraduationCap className={`w-3.5 h-3.5 ${pmStage === 'fresher' ? 'text-[#ec3013]' : 'text-[#605d5d]'}`} />
                        {pmStage === 'fresher' && <span className="w-1.5 h-1.5 bg-[#ec3013]" />}
                      </div>
                      <div className="mt-1">
                        <div className="font-extrabold text-[11px] text-[#201e1d] leading-tight">
                          Fresher
                        </div>
                        <div className="text-[10px] text-[#605d5d] leading-tight">
                          New Grad / Entry
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Full Name */}
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

                {/* 3. Stage-Specific Contextual Inputs */}
                {pmStage === 'existing_pm' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#201e1d] mb-1">
                          Current PM Level
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="input bg-white text-xs"
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
                          Experience (Years)
                        </label>
                        <select
                          value={yearsOfExperience}
                          onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                          className="input bg-white text-xs"
                        >
                          <option value={1}>1 Year</option>
                          <option value={2}>2 Years</option>
                          <option value={3}>3 Years</option>
                          <option value={5}>5 Years (Senior)</option>
                          <option value={8}>8 Years (Lead)</option>
                          <option value={12}>12+ Years (VP/Director)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#201e1d] mb-1">
                        Current Company / Org
                      </label>
                      <input
                        type="text"
                        placeholder="Current Company (e.g. Swiggy, Razorpay, Tech Co)"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                  </div>
                )}

                {pmStage === 'switching_roles' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#201e1d] mb-1">
                        Current Background
                      </label>
                      <select
                        value={previousRole}
                        onChange={(e) => setPreviousRole(e.target.value)}
                        className="input bg-white text-xs"
                      >
                        {switcherRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#201e1d] mb-1">
                        Current Org / Domain
                      </label>
                      <input
                        type="text"
                        placeholder="Current company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                  </div>
                )}

                {pmStage === 'fresher' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#201e1d] mb-1">
                        Target Focus
                      </label>
                      <input
                        type="text"
                        value="Associate PM (APM)"
                        disabled
                        className="input text-xs bg-slate-100 text-slate-700 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#201e1d] mb-1">
                        College / Bootcamp
                      </label>
                      <input
                        type="text"
                        placeholder="College or University"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                  </div>
                )}
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
