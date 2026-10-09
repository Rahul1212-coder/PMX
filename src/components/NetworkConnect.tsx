'use client';

import React, { useState, useEffect } from 'react';
import { PmConnection } from '../types';
import { INITIAL_CONNECTIONS } from '../data/mockData';
import {
  Users,
  UserPlus,
  Check,
  X,
  Search,
  Filter,
  MessageSquare,
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Calendar,
  Layers,
  FileText,
  Send,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { getOtherProfilesFromDb } from '@/lib/supabase/database';

export const NetworkConnect: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [connections, setConnections] = useState<PmConnection[]>(INITIAL_CONNECTIONS);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadMembers() {
      const dbProfiles = await getOtherProfilesFromDb(user?.id);
      if (mounted && dbProfiles && dbProfiles.length > 0) {
        const mapped: PmConnection[] = dbProfiles.map((p) => ({
          id: p.id,
          name: p.fullName,
          headline: `${p.role || 'Product Manager'}${p.company ? ` @ ${p.company}` : ''}`,
          role: (p.role as any) || 'Product Manager',
          company: p.company || 'Tech Squad',
          avatar: p.avatarUrl || '',
          coverPhoto: '',
          mutualConnections: 0,
          location: p.bio || 'Global',
          skills: ['Product Strategy', 'Roadmapping'],
          status: 'not_connected',
          bio: p.bio || '',
        }));
        setConnections(mapped);
      }
    }
    loadMembers();
    return () => {
      mounted = false;
    };
  }, [user]);

  const [messageRecipient, setMessageRecipient] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const filterOptions = [
    'All',
    'Associate PM',
    'Product Manager',
    'Senior PM',
    'Lead / Principal PM',
    'Director / VP of Product',
  ];

  const handleConnectToggle = (id: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    setConnections((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus =
            c.status === 'not_connected'
              ? 'pending'
              : c.status === 'pending'
              ? 'connected'
              : 'not_connected';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleAcceptInvite = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  const handleIgnoreInvite = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredConnections = connections.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.headline.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'All' || c.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start text-left">
      {/* Left Column: Manage my network panel (LinkedIn style) */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
        <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3.5">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Manage my network
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Connections</span>
              </span>
              <span className="font-bold text-slate-800">
                {connections.filter((c) => c.status === 'connected').length}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>PM Groups</span>
              </span>
              <span className="font-semibold text-slate-500">4</span>
            </div>

            <div className="py-2 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Events & Teardowns</span>
              </span>
              <span className="font-semibold text-slate-500">2</span>
            </div>

            <div className="py-2 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Company Pages</span>
              </span>
              <span className="font-semibold text-slate-500">0</span>
            </div>

            <div className="py-2 flex items-center justify-between text-slate-700 hover:text-[#0a66c2] cursor-pointer">
              <span className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>PM Newsletters</span>
              </span>
              <span className="font-semibold text-slate-500">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Invitations + Connections Grid */}
      <div className="flex-1 min-w-0 w-full space-y-3">
        {/* Invitations Card (if any pending) */}
        {invitations.length > 0 && (
          <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Invitations ({invitations.length})
              </h2>
              <span className="text-xs font-semibold text-[#0a66c2] hover:underline cursor-pointer">
                Manage all
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <UserAvatar
                      src={inv.avatar}
                      name={inv.name}
                      size="xl"
                      className="border border-slate-200 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#0a66c2] hover:underline cursor-pointer">
                        {inv.name}
                      </h3>
                      <p className="text-xs text-slate-500">{inv.role}</p>
                      <p className="text-[11px] text-slate-400">
                        {inv.mutual} mutual PM connections
                      </p>
                      {inv.note && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100 italic">
                          "{inv.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleIgnoreInvite(inv.id)}
                      className="px-3.5 py-1 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() => handleAcceptInvite(inv.id)}
                      className="px-4 py-1 rounded-full text-xs font-semibold text-[#0a66c2] border border-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2 transition"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Controls: Search & Role Filters */}
        <div className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-3 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company (e.g. Stripe, Figma), or skills..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#edf3f8] hover:bg-[#e4ecf4] focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 border border-transparent rounded-md transition outline-none text-[#191919]"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
            {filterOptions.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedRoleFilter === role
                    ? 'bg-[#0a66c2] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-[#e0dfdc] hover:bg-slate-50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            People in Product Management you may know
          </h2>
          <span className="text-xs text-slate-500">
            Showing {filteredConnections.length} PMs
          </span>
        </div>

        {/* Grid of PM Profiles (LinkedIn 'People you may know' cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredConnections.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-[#e0dfdc] shadow-sm p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0a66c2] mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Expand Your PM Network
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Connect with Product Managers, APMs, and Leaders across tech squads. As fellow PMs register on PMVerse, they will appear in your network directory.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.origin);
                      alert('PMVerse invite link copied to clipboard! Share it with your product colleagues.');
                    }
                  }}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] transition shadow-xs"
                >
                  Copy Invite Link
                </button>
              </div>
            </div>
          ) : (
            filteredConnections.map((pm) => {
            const isConnected = pm.status === 'connected';
            const isPending = pm.status === 'pending';

            return (
              <div
                key={pm.id}
                className="bg-white rounded-lg border border-[#e0dfdc] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition text-center"
              >
                {/* Cover Photo */}
                <div
                  className="h-16 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${pm.coverPhoto})` }}
                >
                  <div className="absolute inset-0 bg-slate-900/10" />
                </div>

                {/* Card Body */}
                <div className="p-3.5 -mt-9 flex-1 flex flex-col items-center">
                  <UserAvatar
                    src={pm.avatar}
                    name={pm.name}
                    size="2xl"
                    className="border-2 border-white shadow-sm bg-white"
                  />

                  <h3 className="text-sm font-bold text-slate-900 mt-2 hover:text-[#0a66c2] hover:underline cursor-pointer transition line-clamp-1">
                    {pm.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 px-1 mt-0.5 leading-tight">
                    {pm.headline}
                  </p>

                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{pm.company}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{pm.location}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">
                    {pm.mutualConnections} mutual PM connections
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                    {pm.skills.slice(0, 2).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-3 border-t border-slate-100">
                  <button
                    onClick={() => handleConnectToggle(pm.id)}
                    className={`w-full py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      isConnected
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : isPending
                        ? 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                        : 'border border-[#0a66c2] text-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Connected</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pending</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 text-[#0a66c2]" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
};
