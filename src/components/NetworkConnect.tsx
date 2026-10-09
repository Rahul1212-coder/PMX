'use client';

import React, { useState, useEffect } from 'react';
import { PmConnection, ConnectionInvitation } from '../types';
import { INITIAL_CONNECTIONS } from '../data/mockData';
import {
  Users,
  UserPlus,
  Check,
  Search,
  Building2,
  MapPin,
  Layers,
  Calendar,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';
import {
  getOtherProfilesFromDb,
  getUserNetworkData,
  sendConnectionRequestDb,
  acceptConnectionRequestDb,
  removeOrIgnoreConnectionDb,
} from '@/lib/supabase/database';

export const NetworkConnect: React.FC = () => {
  const { user, profile, updateProfile, openAuthModal } = useAuth();
  const [connections, setConnections] = useState<PmConnection[]>(INITIAL_CONNECTIONS);
  const [invitations, setInvitations] = useState<ConnectionInvitation[]>([]);
  const [connectedCount, setConnectedCount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');

  // Load real members and connection status from Supabase & synced store
  useEffect(() => {
    let mounted = true;

    async function loadNetwork() {
      // 1. Fetch other registered PM profiles
      const dbProfiles = await getOtherProfilesFromDb(user?.id);

      // 2. Fetch connections & incoming invitations
      let networkData = {
        incomingInvitations: [] as ConnectionInvitation[],
        statusMap: {} as Record<string, 'not_connected' | 'pending' | 'received' | 'connected'>,
        connectedCount: 0,
      };

      if (user?.id) {
        networkData = await getUserNetworkData(user.id);
      }

      if (!mounted) return;

      setInvitations(networkData.incomingInvitations);
      setConnectedCount(networkData.connectedCount);

      if (dbProfiles && dbProfiles.length > 0) {
        const mapped: PmConnection[] = dbProfiles.map((p) => {
          const status = networkData.statusMap[p.id] || 'not_connected';
          return {
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
            status,
            bio: p.bio || '',
          };
        });
        setConnections(mapped);
      }
    }

    loadNetwork();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleConnectToggle = async (targetUserId: string) => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const current = connections.find((c) => c.id === targetUserId);
    if (!current) return;

    if (current.status === 'not_connected') {
      // Send connection request
      setConnections((prev) =>
        prev.map((c) => (c.id === targetUserId ? { ...c, status: 'pending' } : c))
      );
      await sendConnectionRequestDb(user.id, targetUserId);
    } else if (current.status === 'pending') {
      // Withdraw request
      setConnections((prev) =>
        prev.map((c) => (c.id === targetUserId ? { ...c, status: 'not_connected' } : c))
      );
      await removeOrIgnoreConnectionDb(user.id, targetUserId);
    } else if (current.status === 'received') {
      // Accept incoming request
      await handleAcceptInvite(targetUserId);
    }
  };

  const handleAcceptInvite = async (senderId: string) => {
    if (!user) return;

    // Update invitations UI
    setInvitations((prev) => prev.filter((i) => i.requesterId !== senderId && i.id !== senderId));

    // Update connection status in list
    setConnections((prev) =>
      prev.map((c) => (c.id === senderId ? { ...c, status: 'connected' } : c))
    );

    const newCount = connectedCount + 1;
    setConnectedCount(newCount);
    updateProfile({ connectionsCount: newCount }).catch(() => {});

    await acceptConnectionRequestDb(senderId, user.id);
  };

  const handleIgnoreInvite = async (senderId: string) => {
    if (!user) return;

    setInvitations((prev) => prev.filter((i) => i.requesterId !== senderId && i.id !== senderId));
    setConnections((prev) =>
      prev.map((c) => (c.id === senderId ? { ...c, status: 'not_connected' } : c))
    );

    await removeOrIgnoreConnectionDb(senderId, user.id);
  };

  const filterOptions = [
    'All',
    'Associate PM',
    'Product Manager',
    'Senior PM',
    'Lead / Principal PM',
    'Director / VP of Product',
  ];

  const filteredConnections = connections.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.headline.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q);

    const matchesRole = selectedRoleFilter === 'All' || c.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start text-left">
      {/* Left Column: Manage My Network Panel */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-3">
        <div className="bg-[#f3f2f2] border-2 border-[rgba(32,30,29,0.15)] p-4">
          <h2 className="text-xs uppercase tracking-widest font-extrabold text-[#201e1d] pb-2 border-b-2 border-[rgba(32,30,29,0.15)]">
            Manage Network
          </h2>

          <div className="divide-y divide-[rgba(32,30,29,0.1)] text-xs">
            <div className="py-2.5 flex items-center justify-between text-[#201e1d]">
              <span className="flex items-center space-x-2 font-semibold">
                <Users className="w-3.5 h-3.5 text-[#605d5d]" />
                <span>Connections</span>
              </span>
              <span className="font-extrabold text-[#ec3013] text-sm">
                {connectedCount}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-[#201e1d]">
              <span className="flex items-center space-x-2 font-semibold">
                <Layers className="w-3.5 h-3.5 text-[#605d5d]" />
                <span>PM Squads</span>
              </span>
              <span className="font-bold text-[#605d5d]">4</span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-[#201e1d]">
              <span className="flex items-center space-x-2 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#605d5d]" />
                <span>Teardown Sessions</span>
              </span>
              <span className="font-bold text-[#605d5d]">2</span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-[#201e1d]">
              <span className="flex items-center space-x-2 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#605d5d]" />
                <span>Company Pages</span>
              </span>
              <span className="font-bold text-[#605d5d]">12</span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-[#201e1d]">
              <span className="flex items-center space-x-2 font-semibold">
                <FileText className="w-3.5 h-3.5 text-[#605d5d]" />
                <span>Product Newsletters</span>
              </span>
              <span className="font-bold text-[#605d5d]">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Invitations + Directory */}
      <div className="flex-1 min-w-0 w-full space-y-4">
        {/* Incoming Invitations Card */}
        {invitations.length > 0 && (
          <div className="bg-[#f3f2f2] border-2 border-[#ec3013] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(32,30,29,0.15)]">
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-[#ae1800]">
                Incoming Invitations ({invitations.length})
              </h3>
              <span className="text-xs text-[#605d5d] font-semibold">Action Required</span>
            </div>

            <div className="divide-y divide-[rgba(32,30,29,0.15)]">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar name={inv.name} src={inv.avatar} size="lg" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#201e1d] leading-snug">
                        {inv.name}
                      </h4>
                      <p className="text-xs text-[#605d5d]">{inv.role}</p>
                      <p className="text-[11px] text-[#605d5d]">{inv.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleIgnoreInvite(inv.requesterId)}
                      className="btn btn-secondary text-xs font-bold py-1.5 px-3"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() => handleAcceptInvite(inv.requesterId)}
                      className="btn btn-primary text-xs font-bold py-1.5 px-4"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-[#f3f2f2] border-2 border-[rgba(32,30,29,0.15)] p-3 space-y-2.5">
          <div className="flex items-center border border-[rgba(32,30,29,0.2)] bg-white px-2.5">
            <Search className="w-3.5 h-3.5 text-[#605d5d] mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PMs by name or company…"
              className="w-full text-xs py-2 bg-transparent outline-none font-medium text-[#201e1d]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filterOptions.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`text-xs font-bold py-1 px-2.5 whitespace-nowrap border transition-colors ${
                  selectedRoleFilter === role
                    ? 'bg-[#201e1d] text-[#f3f2f2] border-[#201e1d]'
                    : 'bg-transparent text-[#201e1d] border-[rgba(32,30,29,0.15)] hover:border-[#201e1d]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Title */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#201e1d] uppercase tracking-wide">
            Product Managers You May Know
          </h2>
          <span className="text-xs text-[#605d5d]">{filteredConnections.length} PMs</span>
        </div>

        {/* Modernist Grid of PM Profiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredConnections.map((pm) => {
            const isConnected = pm.status === 'connected';
            const isPending = pm.status === 'pending';
            const isReceived = pm.status === 'received';

            return (
              <div
                key={pm.id}
                className="bg-[#f3f2f2] border-2 border-[rgba(32,30,29,0.15)] p-4 flex flex-col justify-between text-center hover:border-[#201e1d] transition-colors"
              >
                <div className="flex flex-col items-center">
                  <UserAvatar name={pm.name} src={pm.avatar} size="2xl" className="mb-2.5" />
                  <h3 className="font-extrabold text-sm text-[#201e1d] line-clamp-1">{pm.name}</h3>
                  <p className="text-xs text-[#605d5d] line-clamp-2 mt-0.5 leading-snug">
                    {pm.headline}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                    <Building2 className="w-3 h-3 text-[#605d5d]" />
                    <span>{pm.company}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-[#605d5d]" />
                    <span>{pm.location}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                    {pm.skills.slice(0, 2).map((skill, i) => (
                      <span key={i} className="tag tag-neutral text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[rgba(32,30,29,0.15)]">
                  <button
                    onClick={() => handleConnectToggle(pm.id)}
                    className={`btn w-full text-xs font-bold py-1.5 ${
                      isConnected
                        ? 'btn-secondary text-[#201e1d]'
                        : isPending
                        ? 'btn-secondary text-slate-500'
                        : isReceived
                        ? 'btn-primary'
                        : 'btn-secondary hover:border-[#ec3013] hover:text-[#ae1800]'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Connected</span>
                      </>
                    ) : isPending ? (
                      <span>Pending • Withdraw</span>
                    ) : isReceived ? (
                      <span>Accept Invitation</span>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
