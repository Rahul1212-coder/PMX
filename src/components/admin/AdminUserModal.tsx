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
} from 'lucide-react';

interface AdminUserModalProps {
  userId: string | null;
  onClose: () => void;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({ userId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/admin/user/${userId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (!isMounted) return;
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
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
      default:
        return 'Stage Not Set';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-2xl w-full shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b-2 border-[rgba(32,30,29,0.15)] flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="tag tag-accent font-bold text-[11px] uppercase tracking-wider">
                User Activity Audit
              </span>
              {data?.user?.lastSignInAt ? (
                <span className="tag bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">
                  Active User
                </span>
              ) : (
                <span className="tag bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
                  Pending / Never Logged In
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-[#201e1d] m-0">
              {data?.profile?.full_name || data?.user?.email?.split('@')[0] || 'User Profile'}
            </h2>
            <p className="text-xs text-[#605d5d] mt-0.5 font-mono">{data?.user?.email || 'Loading...'}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#201e1d] hover:bg-[#201e1d] hover:text-[#f3f2f2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 font-bold">
              Loading user activity records from Supabase...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Profile Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-[#201e1d]/20">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Role / Title</span>
                  <span className="font-bold text-[#201e1d]">{data.profile?.role || '—'}</span>
                </div>
                <div className="p-3 bg-white border border-[#201e1d]/20">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Company</span>
                  <span className="font-bold text-[#201e1d]">{data.profile?.company || '—'}</span>
                </div>
                <div className="p-3 bg-white border border-[#201e1d]/20">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">PM Stage</span>
                  <span className="font-bold text-[#ec3013]">{getStageLabel(data.profile?.pm_stage)}</span>
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
              </div>

              {/* Diagnostic Benchmarks Section */}
              <div className="border border-[#201e1d]/20 bg-white p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#ec3013]" />
                    <h3 className="text-sm font-black text-[#201e1d]">Competency Diagnostic Benchmark History</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {data.quizHistory?.length || 0} Test(s) Completed
                  </span>
                </div>

                {data.quizHistory && data.quizHistory.length > 0 ? (
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
                        {quiz.strengths && quiz.strengths.length > 0 && (
                          <div className="mt-2 text-[10px] text-emerald-800 font-semibold space-y-0.5">
                            {quiz.strengths.slice(0, 2).map((s: string, idx: number) => (
                              <div key={idx}>✔ {s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px] italic py-2">
                    User has not yet taken the 50-question PM Competency Benchmark.
                  </p>
                )}
              </div>

              {/* Resume Intelligence Audits */}
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

              {/* Raw Technical Metadata */}
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
        <div className="p-4 border-t-2 border-[rgba(32,30,29,0.15)] bg-slate-50 flex justify-end">
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
