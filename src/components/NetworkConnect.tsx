'use client';

import React, { useState } from 'react';
import { PmConnection } from '../types';
import { INITIAL_CONNECTIONS } from '../data/mockData';
import { Users, UserPlus, Check, X, Search, Filter, MessageSquare, Building2, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';

export const NetworkConnect: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [connections, setConnections] = useState<PmConnection[]>(INITIAL_CONNECTIONS);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [invitations, setInvitations] = useState([
    {
      id: 'inv-1',
      name: 'Elena Rostova',
      role: 'Staff PM @ Stripe | Ex-Google APM',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      mutual: 14,
      note: 'Loved your thoughts on problem bets vs feature factories!',
    },
    {
      id: 'inv-2',
      name: 'Jordan Hayes',
      role: 'Lead Technical PM @ Datadog',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
      mutual: 8,
      note: 'Connecting with fellow B2B platform PMs.',
    },
  ]);

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
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  };

  const handleIgnoreInvite = (id: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  };

  const filteredConnections = connections.filter((conn) => {
    const matchRole =
      selectedRoleFilter === 'All' || conn.role === selectedRoleFilter;
    const matchSearch =
      conn.name.toLowerCase().includes(search.toLowerCase()) ||
      conn.company.toLowerCase().includes(search.toLowerCase()) ||
      conn.headline.toLowerCase().includes(search.toLowerCase()) ||
      conn.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Network Header Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Grow Your Product Management Network</h1>
            <span className="bg-sky-50 text-[#0a66c2] text-xs font-bold px-2 py-0.5 rounded-full border border-sky-200">
              480+ PMs in Network
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connect with Associate PMs, Senior Product Managers, and VPs from top product companies like Stripe, Figma, Notion, and Linear.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PMs, companies, skills..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
        </div>
      </div>

      {/* Invitations Section (if any) */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">
              Invitations ({invitations.length})
            </h2>
            <span className="text-xs text-[#0a66c2] font-semibold cursor-pointer hover:underline">
              Manage all
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {invitations.map((inv) => (
              <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <UserAvatar
                    src={inv.avatar}
                    name={inv.name}
                    size="xl"
                    className="border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{inv.name}</h3>
                    <p className="text-xs text-slate-500">{inv.role}</p>
                    <p className="text-[11px] text-slate-400">{inv.mutual} mutual PM connections</p>
                    {inv.note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100 italic">
                        "{inv.note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleIgnoreInvite(inv.id)}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => handleAcceptInvite(inv.id)}
                    className="px-4 py-1 rounded-full text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 transition shadow-sm"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {filterOptions.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedRoleFilter === role
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Grid of PM Profiles (LinkedIn 'People you may know' cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredConnections.map((pm) => {
          const isConnected = pm.status === 'connected';
          const isPending = pm.status === 'pending';

          return (
            <div
              key={pm.id}
              className="bg-white rounded-lg border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              {/* Cover Photo */}
              <div
                className="h-16 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${pm.coverPhoto})` }}
              >
                <div className="absolute inset-0 bg-slate-900/20" />
              </div>

              {/* Card Body */}
              <div className="p-3.5 -mt-8 text-center flex-1 flex flex-col items-center">
                <UserAvatar
                  src={pm.avatar}
                  name={pm.name}
                  size="2xl"
                  className="border-2 border-white shadow bg-white"
                />

                <h3 className="text-sm font-bold text-slate-900 mt-2 hover:text-[#0a66c2] cursor-pointer transition">
                  {pm.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 px-1 mt-0.5 leading-tight">
                  {pm.headline}
                </p>

                <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1.5">
                  <MapPin className="w-3 h-3" />
                  <span>{pm.location}</span>
                </div>

                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  👥 {pm.mutualConnections} mutual PM connections
                </p>

                {/* Skills Chips */}
                <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                  {pm.skills.slice(0, 2).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleConnectToggle(pm.id)}
                  className={`flex-1 py-1 px-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1 transition ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isPending
                      ? 'bg-slate-100 text-slate-600 border border-slate-300'
                      : 'text-[#0a66c2] border border-[#0a66c2] hover:bg-sky-50'
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
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMessageRecipient(pm.name);
                    setMessageText(`Hi ${pm.name.split(' ')[0]}, I'd love to connect and exchange thoughts on product strategy!`);
                  }}
                  className="p-1.5 text-slate-600 hover:text-[#0a66c2] hover:bg-white rounded-full border border-slate-200 transition"
                  title={`Message ${pm.name}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredConnections.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center">
          <p className="text-slate-500 text-sm">No Product Managers found matching your filters.</p>
        </div>
      )}

      {/* Quick Message Modal */}
      {messageRecipient && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Send PM Message to {messageRecipient}
              </h3>
              <button
                onClick={() => setMessageRecipient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setMessageRecipient(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Message sent to ${messageRecipient}!`);
                  setMessageRecipient(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full transition shadow-sm"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
