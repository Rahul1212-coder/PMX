'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  Award,
  FileText,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  Loader2,
  Trophy,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AdminUserModalProps {
  userId: string | null;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({
  userId,
  onClose,
  onUserUpdated,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [pmStage, setPmStage] = useState('existing_pm');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>('');
  const [previousRole, setPreviousRole] = useState('');
  const [bio, setBio] = useState('');

  const initForm = (resData: any) => {
    const prof = resData?.profile;
    const meta = resData?.user?.metadata || {};
    setFullName(prof?.full_name || meta.full_name || meta.name || resData?.user?.email?.split('@')[0] || '');
    setRole(prof?.role || meta.role || '');
    setCompany(prof?.company || meta.company || '');
    setPmStage(prof?.pm_stage || meta.pm_stage || 'existing_pm');
    setYearsOfExperience(
      typeof prof?.years_of_experience === 'number'
        ? prof.years_of_experience
        : typeof meta.years_of_experience === 'number'
        ? meta.years_of_experience
        : ''
    );
    setPreviousRole(prof?.previous_role || meta.previous_role || '');
    setBio(prof?.bio || meta.bio || '');
  };

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setIsEditing(false);
    setSaveSuccess(null);
    setSaveError(null);

    fetch(`/api/admin/user/${userId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (!isMounted) return;
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
          initForm(resData);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load user details');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (!userId) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStageLabel = (stage?: string) => {
    switch (stage) {
      case 'existing_pm':
        return 'Practicing PM';
      case 'switching_roles':
        return 'Role Switcher';
      case 'fresher':
        return 'Aspiring PM / Campus';
      case 'pending':
        return 'Pending Onboarding';
      default:
        return stage || 'Stage Not Set';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          role: role.trim(),
          company: company.trim(),
          pmStage,
          yearsOfExperience: yearsOfExperience === '' ? null : Number(yearsOfExperience),
          previousRole: previousRole.trim(),
          bio: bio.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || 'Failed to update profile');
      }

      setSaveSuccess('User profile successfully updated in database!');
      setIsEditing(false);

      // Refresh local user data
      const refreshRes = await fetch(`/api/admin/user/${userId}`);
      const freshData = await refreshRes.json();
      if (freshData.success) {
        setData(freshData);
        initForm(freshData);
      }

      // Notify parent to refresh user table
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const userDisplayName =
    data?.profile?.full_name ||
    data?.user?.metadata?.full_name ||
    data?.user?.metadata?.name ||
    data?.user?.email?.split('@')[0] ||
    'PM Member';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-3xl w-full shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b-2 border-[rgba(32,30,29,0.15)] flex items-start justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="tag tag-accent font-bold text-[11px] uppercase tracking-wider">
                User Profile Governance
              </span>
              {data?.user?.lastSignInAt ? (
                <span className="tag bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">
                  Active User
                </span>
              ) : (
                <span className="tag bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px]">
                  Pending Activation
                </span>
              )}
              {data?.profile?.pm_stage && (
                <span className="tag bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
                  {getStageLabel(data.profile.pm_stage)}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#201e1d] tracking-tight">
              {userDisplayName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5 flex-wrap">
              <span>{data?.user?.email}</span>
              <span>•</span>
              <span>ID: {data?.user?.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 shrink-0"
                title="Edit user profile details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 border border-[#201e1d] hover:bg-[#201e1d] hover:text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 font-bold flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#ec3013]" />
              <span>Loading complete user records from Supabase...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold">{saveSuccess}</span>
                  </div>
                  <button
                    onClick={() => setSaveSuccess(null)}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="font-bold">{saveError}</span>
                </div>
              )}

              {/* EDIT PROFILE FORM */}
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="bg-white border-2 border-[#201e1d] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2 font-black text-sm text-[#201e1d]">
                      <Edit3 className="w-4 h-4 text-[#ec3013]" />
                      <span>Edit User Profile Attributes</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Syncs to both profiles table & auth metadata
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maya Chen"
                        className="input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Product Manager"
                        className="input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Stripe, Independent, Google"
                        className="input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                        PM Career Stage
                      </label>
                      <select
                        value={pmStage}
                        onChange={(e) => setPmStage(e.target.value)}
                        className="input text-xs font-bold"
                      >
                        <option value="existing_pm">Practicing PM</option>
                        <option value="switching_roles">Role Switcher</option>
                        <option value="fresher">Aspiring PM / Campus APM</option>
                        <option value="pending">Pending Onboarding</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="1"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        placeholder="e.g. 5"
                        className="input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                        Previous Role / Background
                      </label>
                      <input
                        type="text"
                        value={previousRole}
                        onChange={(e) => setPreviousRole(e.target.value)}
                        placeholder="e.g. Software Engineer, Management Consultant"
                        className="input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                      Professional Bio & Focus Areas
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="User's product background, domains, interests..."
                      className="input text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="btn btn-secondary text-xs font-bold py-1.5 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn btn-primary text-xs font-bold py-1.5 px-5 flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Profile Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW PROFILE GRID */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Role / Title</span>
                    <span className="font-bold text-[#201e1d] text-sm">{data.profile?.role || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Company</span>
                    <span className="font-bold text-[#201e1d] text-sm">{data.profile?.company || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">PM Stage</span>
                    <span className="font-bold text-[#ec3013] text-sm">{getStageLabel(data.profile?.pm_stage)}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Experience</span>
                    <span className="font-bold text-[#201e1d]">
                      {typeof data.profile?.years_of_experience === 'number'
                        ? `${data.profile.years_of_experience} Years`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Account Created</span>
                    <span className="font-bold text-[#201e1d]">{formatDate(data.user?.createdAt)}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Last Logged In</span>
                    <span className="font-bold text-[#201e1d]">{formatDate(data.user?.lastSignInAt)}</span>
                  </div>
                  {data.profile?.bio && (
                    <div className="col-span-2 sm:col-span-3 p-3 bg-white border border-[#201e1d]/20">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Professional Bio</span>
                      <p className="text-slate-700 leading-relaxed">{data.profile.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* THREE-LEVEL ASSESSMENT EVALUATIONS */}
              <div className="border border-[#201e1d]/20 bg-white p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#ec3013]" />
                    <h3 className="text-sm font-black text-[#201e1d]">Structured Three-Level PM Assessment History</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {data.assessmentAttempts?.length || 0} Attempt(s)
                  </span>
                </div>

                {data.assessmentAttempts && data.assessmentAttempts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['beginner', 'intermediate', 'advanced'].map((lvlKey) => {
                      const attemptsForLevel = data.assessmentAttempts.filter(
                        (a: any) => a.level_id === lvlKey
                      );
                      const bestAttempt = attemptsForLevel.sort(
                        (a: any, b: any) => (b.score_percentage || 0) - (a.score_percentage || 0)
                      )[0];

                      const label =
                        lvlKey === 'beginner'
                          ? '1. Beginner (Foundations)'
                          : lvlKey === 'intermediate'
                          ? '2. Intermediate (Application)'
                          : '3. Advanced (Strategic)';

                      return (
                        <div key={lvlKey} className="p-3 bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="text-[10px] font-black uppercase text-slate-500">{label}</div>
                          {bestAttempt ? (
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black text-[#ec3013]">
                                  {bestAttempt.score_percentage || 0}%
                                </span>
                                {bestAttempt.is_passed ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5">
                                    PASSED
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5">
                                    IN PROGRESS
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">
                                {attemptsForLevel.length} attempt(s) · Last {formatDate(bestAttempt.created_at)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic py-1">
                              Not attempted yet
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px] italic py-2">
                    User has not yet attempted the Three-Level Product Management Assessment.
                  </p>
                )}
              </div>

              {/* WEEKLY CHALLENGE & COMPETITION SUBMISSIONS */}
              <div className="border border-[#201e1d]/20 bg-white p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#ec3013]" />
                    <h3 className="text-sm font-black text-[#201e1d]">Weekly Case Study & Competition Submissions</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {data.challengeSubmissions?.length || 0} Submission(s)
                  </span>
                </div>

                {data.challengeSubmissions && data.challengeSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {data.challengeSubmissions.map((sub: any) => (
                      <div key={sub.id} className="p-3 bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#201e1d]">
                            Challenge: {sub.challenge_id || 'Active Challenge'}
                          </span>
                          <span className="text-[10px] text-slate-500">{formatDate(sub.created_at)}</span>
                        </div>
                        {sub.ai_feedback && (
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#ec3013]">
                              Score: {sub.ai_feedback.overallScore || 0}/100
                            </span>
                            <span className="text-[10px] font-bold bg-[#201e1d] text-white px-2 py-0.5">
                              {sub.ai_feedback.verdictLabel || 'Evaluated'}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-700 line-clamp-2">
                          <strong>Diagnosis:</strong> {sub.problem_statement}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px] italic py-2">
                    User has not yet submitted any weekly challenge solutions.
                  </p>
                )}
              </div>

              {/* LEGACY 50-QUESTION DIAGNOSTIC BENCHMARKS */}
              {data.quizHistory && data.quizHistory.length > 0 && (
                <div className="border border-[#201e1d]/20 bg-white p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#ec3013]" />
                      <h3 className="text-sm font-black text-[#201e1d]">Legacy 50-Question Benchmark History</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {data.quizHistory.length} Test(s)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {data.quizHistory.map((quiz: any) => (
                      <div key={quiz.id} className="p-3 bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-base text-[#ec3013]">
                            {quiz.score_percentage} / 100
                          </span>
                          <span className="text-[11px] text-slate-500">{formatDate(quiz.created_at)}</span>
                        </div>
                        <div className="font-bold text-xs text-[#201e1d] mt-1">
                          {quiz.archetype || 'Completed Benchmark'}
                        </div>
                        {quiz.summary && (
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{quiz.summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESUME INTELLIGENCE AUDITS */}
              <div className="border border-[#201e1d]/20 bg-white p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ec3013]" />
                    <h3 className="text-sm font-black text-[#201e1d]">Resume Intelligence Evaluations</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {data.savedJobs?.length || 0} Audit(s) Saved
                  </span>
                </div>

                {data.savedJobs && data.savedJobs.length > 0 ? (
                  <div className="space-y-2">
                    {data.savedJobs.map((item: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-[#201e1d]">Audit #{idx + 1}</span>
                          <span className="text-[10px] font-mono text-slate-500 ml-2">ID: {item.job_id}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{formatDate(item.created_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px] italic py-2">
                    User has not yet saved any resume evaluations.
                  </p>
                )}
              </div>

              {/* RAW TECHNICAL METADATA */}
              <div className="border border-[#201e1d]/20 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-black text-[#201e1d]">Supabase Security & Auth Metadata</h3>
                </div>
                <div className="bg-slate-900 text-slate-200 p-3 rounded text-[10px] font-mono overflow-x-auto max-h-32">
                  {JSON.stringify(data.user?.metadata || {}, null, 2)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[rgba(32,30,29,0.15)] bg-slate-50 flex justify-end gap-2 shrink-0">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary text-xs font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit User Profile</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs font-bold px-6 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
