'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getUserProfileFromDb, upsertUserProfileInDb } from '@/lib/supabase/database';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  isProfileModalOpen: boolean;
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, meta: { fullName: string; role: string; company: string }) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILE: UserProfile = {
  id: 'demo-pm-user',
  email: 'alex.pm@prodcraft.dev',
  fullName: 'Alex Vance',
  role: 'Senior Product Manager',
  company: 'Linear / Stealth AI',
  avatarUrl: '', // Clean initials avatar by default
  bio: 'Building outcome-driven product squads and AI-native workflows.',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const configured = isSupabaseConfigured();

  const loadUserProfile = async (supabaseUser: User) => {
    try {
      const dbProfile = await getUserProfileFromDb(supabaseUser.id);
      const metadata = supabaseUser.user_metadata || {};
      const metaName = metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0] || '';
      const metaRole = metadata.role || 'Product Manager';
      const metaCompany = metadata.company || 'Independent PM';
      const metaAvatar = metadata.avatar_url || '';

      if (dbProfile) {
        // Enforce user's actual name if DB profile had default or empty name
        if ((!dbProfile.fullName || dbProfile.fullName === 'Product Manager') && metaName) {
          dbProfile.fullName = metaName;
        }
        // Strip out legacy dummy Unsplash URLs if stored from prior default schemas
        if (
          dbProfile.avatarUrl &&
          (dbProfile.avatarUrl.includes('photo-1534528741775-53994a69daeb') ||
            dbProfile.avatarUrl.includes('photo-1535713875002-d1d0cf377fde'))
        ) {
          dbProfile.avatarUrl = '';
        }
        setProfile(dbProfile);
      } else {
        // Fallback profile from user metadata - NO dummy Unsplash avatar!
        const fallbackProfile: UserProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: metaName || 'Product Manager',
          role: metaRole,
          company: metaCompany,
          avatarUrl: metaAvatar,
        };
        setProfile(fallbackProfile);
        upsertUserProfileInDb(fallbackProfile).catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!configured) {
      // Check for saved demo session in local storage
      const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('prodcraft_demo_user') : null;
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setProfile(parsed);
          setUser({ id: parsed.id, email: parsed.email } as any);
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then((result: { data: { session: Session | null } }) => {
      const currentSession = result?.data?.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        loadUserProfile(currentSession.user);
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, authSession: Session | null) => {
      setSession(authSession);
      setUser(authSession?.user ?? null);
      if (authSession?.user) {
        await loadUserProfile(authSession.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      loginAsDemo();
      closeAuthModal();
      return {};
    }

    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase client not initialized' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        await loadUserProfile(data.user);
      }

      closeAuthModal();
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign in' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    meta: { fullName: string; role: string; company: string }
  ) => {
    if (!configured) {
      loginAsDemo();
      closeAuthModal();
      return { message: 'Demo account created successfully!' };
    }

    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase client not initialized' };

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: meta.fullName,
            role: meta.role,
            company: meta.company,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { message: 'Account created! Please check your email inbox to confirm your email before signing in.' };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await loadUserProfile(data.user);
      }

      closeAuthModal();
      return { message: 'Account created and signed in successfully!' };
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign up' };
    }
  };

  const signOut = async () => {
    if (!configured) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('prodcraft_demo_user');
      }
      setUser(null);
      setProfile(null);
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user && !profile) return { error: 'Not authenticated' };

    const current = profile || {
      id: user?.id || 'guest',
      email: user?.email || '',
      fullName: 'Product Manager',
      role: 'Associate PM',
      company: 'Tech Company',
    };

    const updated = { ...current, ...updates };
    setProfile(updated);

    if (configured && user) {
      const ok = await upsertUserProfileInDb(updated);
      if (!ok) return { error: 'Failed to update database profile' };
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('prodcraft_demo_user', JSON.stringify(updated));
      }
    }
    return {};
  };

  const loginAsDemo = () => {
    setUser({ id: DEMO_PROFILE.id, email: DEMO_PROFILE.email } as any);
    setProfile(DEMO_PROFILE);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prodcraft_demo_user', JSON.stringify(DEMO_PROFILE));
    }
    closeAuthModal();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured: configured,
        isAuthModalOpen,
        authModalTab,
        isProfileModalOpen,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        signIn,
        signUp,
        signOut,
        updateProfile,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
