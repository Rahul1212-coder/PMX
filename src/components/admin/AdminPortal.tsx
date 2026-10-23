'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isAuthorizedAdmin } from '@/lib/admin';
import { AdminUserModal } from './AdminUserModal';
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Award,
  FileText,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  BarChart2,
  Calendar,
  LogOut,
  Layers,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, signOut, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'overview' | 'benchmarks'>('users');

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last_active');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const isAdmin = user && isAuthorizedAdmin(user.email);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}&stage=${stageFilter}&status=${statusFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`),
      ]);

      const [statsData, usersData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
      ]);

      if (statsData.success) setStats(statsData);
      if (usersData.success) setUsers(usersData.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [stageFilter, statusFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Export Users to CSV
  const handleExportCsv = () => {
    if (!users || users.length === 0) return;

    const headers = [
      'Full Name',
      'Email',
      'Role',
      'Company',
      'PM Stage',
      'Years of Experience',
      'Diagnostic Score',
      'Diagnostic Archetype',
      'Resume Audits Count',
      'Account Status',
      'Last Signed In',
      'Created At',
    ];

    const rows = users.map((u) => [
      `"${(u.fullName || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(u.company || '').replace(/"/g, '""')}"`,
      `"${u.pmStage || ''}"`,
      u.yearsOfExperience ?? '',
      u.diagnosticScore ?? '',
      `"${(u.diagnosticArchetype || '').replace(/"/g, '""')}"`,
      u.resumeAuditsCount || 0,
      u.status || '',
      `"${u.lastSignInAt || 'Never'}"`,
      `"${u.createdAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pmverse_users_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStageBadge = (stage?: string) => {
    switch (stage) {
      case 'existing_pm':
        return <span className="tag bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">Existing PM</span>;
      case 'switching_roles':
        return <span className="tag bg-blue-50 text-blue-800 border-blue-300 font-bold">Switching</span>;
      case 'fresher':
        return <span className="tag bg-purple-50 text-purple-800 border-purple-300 font-bold">Fresher / APM</span>;
      default:
        return <span className="tag bg-slate-100 text-slate-600 border-slate-300 font-bold">Pending</span>;
    }
  };

  // If user is not authorized admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f3f2f2] text-[#201e1d] flex flex-col justify-center items-center p-4">
        <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-md w-full shadow-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-[#201e1d] text-[#f3f2f2] border-2 border-[#ec3013] flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-[#ec3013]" />
          </div>

          <div>
            <div className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#201e1d] text-[#f3f2f2] mb-2">
              admin.pmverse.in
            </div>
            <h1 className="text-2xl font-black text-[#201e1d] tracking-tight">
              PMVerse Admin Portal
            </h1>
            <p className="text-xs text-[#605d5d] mt-2 leading-relaxed">
              Restricted platform governance and user activity monitoring center.
            </p>
          </div>

          {user && !isAdmin ? (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-2">
              <div className="font-bold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Access Denied</span>
              </div>
              <p>
                Logged in as <strong className="font-mono">{user.email}</strong>, which does not have administrative privileges.
              </p>
              <button
                onClick={() => signOut()}
                className="btn btn-secondary w-full text-xs font-bold mt-2"
              >
                Sign Out & Use Admin Account
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-600">
                Please sign in with your authorized admin account (<strong className="font-mono">krjha1212@gmail.com</strong>) to proceed.
              </p>
              <button
                onClick={() => openAuthModal('signin')}
                className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Sign In to Admin Portal →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2f2] text-[#201e1d] flex flex-col selection:bg-[rgba(236,48,19,0.25)]">
      {/* 1. Admin Top Navbar */}
      <header className="border-b-2 border-[#201e1d] bg-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/pmverse-mark.png" alt="PMVerse" className="w-7 h-7 object-contain" />
            <div className="flex items-baseline gap-2">
              <span className="font-black text-xl tracking-tight text-[#201e1d]">PMVerse</span>
              <span className="bg-[#201e1d] text-[#f3f2f2] text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
                Admin Center
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 font-semibold border-l pl-2 border-slate-300">
                admin.pmverse.in
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="btn btn-secondary text-xs font-bold flex items-center gap-1.5 py-1.5 px-3"
              title="Refresh platform activity data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="btn btn-secondary text-xs font-bold flex items-center gap-1.5 py-1.5 px-3 border-[#201e1d]"
              title="Export all users to CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <div className="border-l border-slate-200 pl-2 sm:pl-3 flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-black text-[#201e1d] block leading-tight">{user.email}</span>
                <span className="text-[10px] text-emerald-700 font-bold">Super Admin</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 border border-slate-300 hover:border-[#201e1d] hover:bg-slate-100 transition-colors"
                title="Sign out of Admin Portal"
              >
                <LogOut className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Admin Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border-2 border-[#201e1d] p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Users</span>
            <span className="text-3xl font-black text-[#201e1d] leading-none">
              {stats?.kpis?.totalUsers ?? '—'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">Registered in DB</span>
          </div>

          <div className="bg-white border-2 border-[#201e1d] p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Active Users</span>
            <span className="text-3xl font-black text-emerald-600 leading-none">
              {stats?.kpis?.activeUsers ?? '—'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">Signed in at least once</span>
          </div>

          <div className="bg-white border-2 border-[#201e1d] p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Active (Past 7d)</span>
            <span className="text-3xl font-black text-[#ec3013] leading-none">
              {stats?.kpis?.activeLast7Days ?? '—'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">Weekly active users</span>
          </div>

          <div className="bg-white border-2 border-[#201e1d] p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Pending Invites</span>
            <span className="text-3xl font-black text-amber-600 leading-none">
              {stats?.kpis?.pendingUsers ?? '—'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">Never signed in</span>
          </div>

          <div className="bg-white border-2 border-[#201e1d] p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Diagnostic Tests</span>
            <span className="text-3xl font-black text-[#201e1d] leading-none">
              {stats?.kpis?.totalDiagnosticTests ?? '—'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">Avg: {stats?.kpis?.averageDiagnosticScore ?? 0}%</span>
          </div>

          <div className="bg-white border-2 border-[#201e1d] p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Resume Audits</span>
            <span className="text-3xl font-black text-[#201e1d] leading-none">
              {stats?.kpis?.totalResumeAudits ?? '—'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">Evaluations logged</span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex border-b-2 border-[#201e1d] bg-[#eae9e9]">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-6 text-xs font-black transition-colors flex items-center gap-2 border-r border-[#201e1d]/20 ${
              activeTab === 'users'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[#201e1d]/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users Activity Directory ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-6 text-xs font-black transition-colors flex items-center gap-2 border-r border-[#201e1d]/20 ${
              activeTab === 'overview'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[#201e1d]/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Platform Activity Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`py-2.5 px-6 text-xs font-black transition-colors flex items-center gap-2 ${
              activeTab === 'benchmarks'
                ? 'bg-[#201e1d] text-[#f3f2f2]'
                : 'text-[#201e1d] hover:bg-[#201e1d]/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Diagnostic Benchmark Breakdown</span>
          </button>
        </div>

        {/* TAB 1: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 bg-white border-2 border-[#201e1d] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, role, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-xs"
                />
              </div>

              {/* Stage Filter */}
              <div>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="input text-xs font-bold"
                >
                  <option value="all">All Stages</option>
                  <option value="existing_pm">Practicing PMs</option>
                  <option value="switching_roles">Role Switchers</option>
                  <option value="fresher">Freshers / Campus APM</option>
                  <option value="pending">Pending Onboarding</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input text-xs font-bold"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active (Signed In)</option>
                  <option value="pending">Pending (Never Logged In)</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input text-xs font-bold"
                >
                  <option value="last_active">Sort: Last Active</option>
                  <option value="created_at">Sort: Date Joined</option>
                  <option value="score">Sort: Diagnostic Score</option>
                  <option value="name">Sort: Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border-2 border-[#201e1d] overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#201e1d] bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role & Company</th>
                    <th className="py-3 px-4">PM Stage</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Benchmark Score</th>
                    <th className="py-3 px-4">Resume Audits</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-bold">
                        Loading users directory from Supabase...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-bold">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedUserId(u.id)}
                      >
                        {/* User Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#201e1d] text-[#f3f2f2] font-black text-[11px] flex items-center justify-center shrink-0">
                              {u.fullName?.slice(0, 2).toUpperCase() || 'PM'}
                            </div>
                            <div>
                              <span className="font-black text-[#201e1d] group-hover:text-[#ec3013] transition-colors block">
                                {u.fullName}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role & Company */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#201e1d] block">{u.role || '—'}</span>
                          <span className="text-[11px] text-slate-500">{u.company || '—'}</span>
                        </td>

                        {/* PM Stage */}
                        <td className="py-3 px-4">{getStageBadge(u.pmStage)}</td>

                        {/* Experience */}
                        <td className="py-3 px-4 font-bold text-[#201e1d]">
                          {typeof u.yearsOfExperience === 'number'
                            ? `${u.yearsOfExperience} yrs`
                            : '—'}
                        </td>

                        {/* Benchmark Score */}
                        <td className="py-3 px-4">
                          {typeof u.diagnosticScore === 'number' ? (
                            <span className="font-black text-sm text-[#ec3013]">
                              {u.diagnosticScore} / 100
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold italic text-[11px]">
                              Not taken
                            </span>
                          )}
                        </td>

                        {/* Resume Audits */}
                        <td className="py-3 px-4 font-bold text-[#201e1d]">
                          {u.resumeAuditsCount > 0 ? (
                            <span className="tag bg-slate-100 text-[#201e1d] font-bold">
                              {u.resumeAuditsCount} evaluated
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>

                        {/* Last Active */}
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold block ${
                              u.isActive ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {formatDate(u.lastSignInAt)}
                          </span>
                          <span className="text-[10px] text-slate-400">Joined {formatDate(u.createdAt)}</span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserId(u.id);
                            }}
                            className="btn btn-secondary text-[11px] font-bold py-1 px-2.5 hover:border-[#201e1d]"
                          >
                            View / Edit Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW & PLATFORM STREAM */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PM Stage Breakdown */}
            <div className="bg-white border-2 border-[#201e1d] p-5 space-y-4">
              <h2 className="text-base font-black text-[#201e1d] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ec3013]" /> PM Stage Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(stats?.stageDistribution || {}).map(([stage, count]: any) => (
                  <div key={stage} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="capitalize">{stage.replace('_', ' ')}</span>
                      <span>{count} ({Math.round(((count as number) / (stats?.kpis?.totalUsers || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 border border-slate-300">
                      <div
                        className="h-full bg-[#ec3013]"
                        style={{
                          width: `${Math.min(100, Math.round(((count as number) / (stats?.kpis?.totalUsers || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="lg:col-span-2 bg-white border-2 border-[#201e1d] p-5 space-y-4">
              <h2 className="text-base font-black text-[#201e1d] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#ec3013]" /> Recent Platform Activity Stream
              </h2>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {(stats?.recentActivities || []).map((item: any) => (
                  <div key={item.id} className="py-3 flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === 'login' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {item.type === 'signup' && <Users className="w-3.5 h-3.5 text-blue-600" />}
                      {item.type === 'quiz' && <Award className="w-3.5 h-3.5 text-[#ec3013]" />}
                      {item.type === 'resume' && <FileText className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-black text-[#201e1d]">{item.title}</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BENCHMARKS BREAKDOWN */}
        {activeTab === 'benchmarks' && (
          <div className="bg-white border-2 border-[#201e1d] p-5 space-y-4">
            <h2 className="text-base font-black text-[#201e1d] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ec3013]" /> Verified PM Archetypes & Benchmark Scores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats?.archetypeBreakdown || {}).map(([archetype, count]: any) => (
                <div key={archetype} className="p-4 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Archetype</span>
                  <span className="font-black text-sm text-[#201e1d] block leading-tight">{archetype}</span>
                  <span className="text-xl font-black text-[#ec3013] block mt-2">{count} Candidates</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* User Activity Modal */}
      <AdminUserModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserUpdated={fetchData}
      />
    </div>
  );
};
