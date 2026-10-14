'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getUserProfileFromDb, upsertUserProfileInDb, saveQuizResultToDb } from '@/lib/supabase/database';
import { UserProfile, PmStage } from '@/types';

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
  signUp: (
    email: string,
    password: string,
    meta: {
      fullName: string;
      role: string;
      company: string;
      pmStage?: PmStage;
      previousRole?: string;
      yearsOfExperience?: number;
    }
  ) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const metaName = (metadata.full_name || metadata.name || '').trim();
      const metaRole = (metadata.role || '').trim();
      const metaCompany = (metadata.company || '').trim();
      const metaAvatar = (metadata.avatar_url || '').trim();

      const metaStage = (metadata.pm_stage as PmStage) || 'existing_pm';
      const metaPrev = metadata.previous_role || '';
      const metaYears = metadata.years_of_experience;
      const metaBio = metadata.bio || '';
      const emailUsername = supabaseUser.email?.split('@')[0] || '';

      let shouldSyncDb = false;

      if (dbProfile) {
        // Enforce user's actual name if DB profile had default or raw email username
        const isPlaceholderName =
          !dbProfile.fullName ||
          dbProfile.fullName === 'Product Manager' ||
          dbProfile.fullName === emailUsername;

        if (metaName && (isPlaceholderName || metaName !== dbProfile.fullName)) {
          dbProfile.fullName = metaName;
          shouldSyncDb = true;
        }

        // Enforce user's actual role from metadata if DB has default trigger role or different
        const isDefaultRole =
          !dbProfile.role ||
          dbProfile.role === 'Product Manager' ||
          dbProfile.role === 'Associate PM';

        if (metaRole && (isDefaultRole || dbProfile.role !== metaRole)) {
          dbProfile.role = metaRole;
          shouldSyncDb = true;
        }

        // Enforce user's actual company from metadata if DB has default trigger company or different
        const isDefaultCompany =
          !dbProfile.company ||
          dbProfile.company === 'Independent PM' ||
          dbProfile.company === 'Tech Company' ||
          dbProfile.company === 'Tech Squad';

        if (metaCompany && (isDefaultCompany || dbProfile.company !== metaCompany)) {
          dbProfile.company = metaCompany;
          shouldSyncDb = true;
        }

        if (metaStage && (!dbProfile.pmStage || dbProfile.pmStage === 'existing_pm')) {
          dbProfile.pmStage = metaStage;
          shouldSyncDb = true;
        }
        if (!dbProfile.previousRole && metaPrev) {
          dbProfile.previousRole = metaPrev;
          shouldSyncDb = true;
        }
        if (typeof dbProfile.yearsOfExperience !== 'number' && typeof metaYears === 'number') {
          dbProfile.yearsOfExperience = metaYears;
          shouldSyncDb = true;
        }
        if (!dbProfile.bio && metaBio) {
          dbProfile.bio = metaBio;
          shouldSyncDb = true;
        }
        if (!dbProfile.avatarUrl && metaAvatar) {
          dbProfile.avatarUrl = metaAvatar;
          shouldSyncDb = true;
        }

        // Strip out legacy dummy Unsplash URLs if stored from prior default schemas
        if (
          dbProfile.avatarUrl &&
          (dbProfile.avatarUrl.includes('photo-1534528741775-53994a69daeb') ||
            dbProfile.avatarUrl.includes('photo-1535713875002-d1d0cf377fde'))
        ) {
          dbProfile.avatarUrl = '';
          shouldSyncDb = true;
        }

        setProfile(dbProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pmverse_user', JSON.stringify(dbProfile));
        }

        // Persist reconciled profile to Supabase DB so other users see true role & company
        if (shouldSyncDb) {
          upsertUserProfileInDb(dbProfile).catch(() => {});
        }
      } else {
        // Fallback profile from user metadata - NO dummy Unsplash avatar!
        const fallbackProfile: UserProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: metaName || emailUsername || 'Product Manager',
          role: metaRole || 'Product Manager',
          company: metaCompany || 'Tech Company',
          avatarUrl: metaAvatar && !metaAvatar.includes('unsplash') ? metaAvatar : '',
          bio: metaBio,
          pmStage: metaStage,
          previousRole: metaPrev,
          yearsOfExperience: typeof metaYears === 'number' ? metaYears : undefined,
        };
        setProfile(fallbackProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pmverse_user', JSON.stringify(fallbackProfile));
        }
        upsertUserProfileInDb(fallbackProfile).catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Purge any legacy demo user from older sessions
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prodcraft_demo_user');
    }

    if (!configured) {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('pmverse_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setProfile(parsed);
            setUser({ id: parsed.id, email: parsed.email } as any);
          } catch {
            // ignore
          }
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
      } else if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('pmverse_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed && parsed.id && parsed.id.startsWith('pm-')) {
              setUser({ id: parsed.id, email: parsed.email } as any);
              setProfile(parsed);
            }
          } catch {
            // ignore
          }
        }
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
    meta: {
      fullName: string;
      role: string;
      company: string;
      pmStage?: PmStage;
      previousRole?: string;
      yearsOfExperience?: number;
    }
  ) => {
    if (!configured) {
      let localDiagScore: number | undefined = undefined;
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('pmverse_latest_diagnostic');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.scorePercentage === 'number') {
              localDiagScore = parsed.scorePercentage;
            }
          }
        } catch {}
      }

      const cleanProfile: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        fullName: meta.fullName.trim() || 'Product Manager',
        role: meta.role.trim() || 'Associate PM',
        company: meta.company.trim() || 'Independent PM',
        pmStage: meta.pmStage || 'existing_pm',
        previousRole: meta.previousRole || '',
        yearsOfExperience: meta.yearsOfExperience,
        pmFitScore: localDiagScore,
        avatarUrl: '',
        connectionsCount: 0,
        profileViews: 0,
        postImpressions: 0,
      };
      setUser({ id: cleanProfile.id, email } as any);
      setProfile(cleanProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmverse_user', JSON.stringify(cleanProfile));
        if (localDiagScore !== undefined) {
          localStorage.setItem(`pmverse_diagnostic_${cleanProfile.id}`, localStorage.getItem('pmverse_latest_diagnostic') || '');
        }
      }
      closeAuthModal();
      return { message: 'Account created and signed in successfully!' };
    }

    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase client not initialized' };

    try {
      const PRODUCTION_SITE_URL = 'https://pmverse.in';
      const siteRedirectUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' && !window.location.origin.includes('localhost')
          ? window.location.origin
          : PRODUCTION_SITE_URL);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: siteRedirectUrl,
          data: {
            full_name: meta.fullName.trim(),
            name: meta.fullName.trim(),
            role: meta.role.trim() || 'Product Manager',
            company: meta.company.trim() || 'Tech Company',
            pm_stage: meta.pmStage || 'existing_pm',
            previous_role: meta.previousRole || '',
            years_of_experience: meta.yearsOfExperience ?? null,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          return {
            error:
              'Email rate limit exceeded: Supabase free tier limits confirmation emails to ~3-4/hour. Disable "Confirm email" in Supabase Auth settings to enable instant signups.',
          };
        }
        return { error: error.message };
      }

      if (data.user) {
        let cachedScore: number | undefined = undefined;
        if (typeof window !== 'undefined') {
          try {
            const rawDiag = localStorage.getItem('pmverse_latest_diagnostic');
            if (rawDiag) {
              const parsed = JSON.parse(rawDiag);
              if (typeof parsed.scorePercentage === 'number') {
                cachedScore = parsed.scorePercentage;
                localStorage.setItem(`pmverse_diagnostic_${data.user.id}`, rawDiag);
                saveQuizResultToDb(data.user.id, parsed).catch(() => {});
              }
            }
          } catch {}
        }

        const initialProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: meta.fullName.trim() || email.split('@')[0] || 'Product Manager',
          role: meta.role.trim() || 'Product Manager',
          company: meta.company.trim() || 'Tech Company',
          pmStage: meta.pmStage || 'existing_pm',
          previousRole: meta.previousRole || '',
          yearsOfExperience: meta.yearsOfExperience,
          pmFitScore: cachedScore,
          avatarUrl: '',
          connectionsCount: 0,
          profileViews: 0,
          postImpressions: 0,
        };

        // Cache locally immediately
        if (typeof window !== 'undefined') {
          localStorage.setItem('pmverse_user', JSON.stringify(initialProfile));
        }

        // Directly sync user profile to Supabase database
        await upsertUserProfileInDb(initialProfile).catch(() => {});

        // Sync to backend API endpoint to persist even if unconfirmed
        fetch('/api/auth/profile-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email || email,
            fullName: meta.fullName.trim(),
            role: meta.role.trim() || 'Product Manager',
            company: meta.company.trim() || 'Tech Company',
            pmStage: meta.pmStage || 'existing_pm',
            previousRole: meta.previousRole || '',
            yearsOfExperience: meta.yearsOfExperience,
          }),
        }).catch(() => {});

        // Check if email confirmation is required
        if (!data.session) {
          return { message: 'Account created! Please check your email inbox to confirm your email before signing in.' };
        }

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmverse_user');
      localStorage.removeItem('prodcraft_demo_user');
    }

    if (configured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
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

    const updated: UserProfile = { ...current, ...updates };
    setProfile(updated);

    // 1. Always sync to localStorage immediately so user experience is instant & resilient
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmverse_user', JSON.stringify(updated));
    }

    // 2. If Supabase is configured and user is logged in
    if (configured && user) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Update user metadata in Supabase Auth (stores all profile fields reliably across sessions)
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: updated.fullName,
              role: updated.role,
              company: updated.company,
              bio: updated.bio,
              avatar_url: updated.avatarUrl,
              pm_stage: updated.pmStage,
              years_of_experience: updated.yearsOfExperience,
              previous_role: updated.previousRole,
            },
          });
        } catch (authMetaErr) {
          console.warn('Could not update user metadata in Supabase auth:', authMetaErr);
        }
      }

      // Upsert into Supabase profiles database table if valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      if (isUuid) {
        try {
          const ok = await upsertUserProfileInDb(updated);
          if (!ok) {
            console.warn('Supabase DB table sync returned false, but local and auth metadata were saved.');
          }
        } catch (dbErr) {
          console.warn('Supabase DB profile sync error:', dbErr);
        }
      }
    }

    return {};
  };

  const loginAsDemo = () => {
    const defaultProfile: UserProfile = {
      id: `pm-${Date.now()}`,
      email: 'member@pmverse.dev',
      fullName: 'New Product Manager',
      role: 'Product Manager',
      company: 'Tech Squad',
      avatarUrl: '',
      bio: 'Excited to build outcome-driven product roadmaps and connect with fellow PMs.',
      connectionsCount: 0,
      profileViews: 0,
      postImpressions: 0,
    };
    setUser({ id: defaultProfile.id, email: defaultProfile.email } as any);
    setProfile(defaultProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmverse_user', JSON.stringify(defaultProfile));
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
