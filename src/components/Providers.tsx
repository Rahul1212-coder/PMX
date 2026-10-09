'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { ProfileModal } from '@/components/ProfileModal';

const GlobalModals: React.FC = () => {
  const { isProfileModalOpen, closeProfileModal } = useAuth();
  return (
    <>
      <AuthModal />
      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Purge any legacy mock posts from browser storage
        const postsStr = localStorage.getItem('pmverse_posts');
        if (postsStr) {
          const posts = JSON.parse(postsStr);
          if (
            Array.isArray(posts) &&
            posts.some(
              (p: any) =>
                ['post-1', 'post-2', 'post-3', 'post-4'].includes(p.id) ||
                ['Elena Rostova', 'Marcus Chen', 'Sarah Jenkins', 'Liam Vance'].includes(p.author?.name)
            )
          ) {
            localStorage.removeItem('pmverse_posts');
          }
        }

        // Purge any legacy mock jobs from browser storage
        const jobsStr = localStorage.getItem('pmverse_jobs');
        if (jobsStr) {
          const jobs = JSON.parse(jobsStr);
          if (
            Array.isArray(jobs) &&
            jobs.some(
              (j: any) =>
                ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'].includes(j.id) ||
                ['Linear', 'Monzo', 'Figma', 'Ro Health', 'Datadog'].includes(j.company)
            )
          ) {
            localStorage.removeItem('pmverse_jobs');
          }
        }

        // Purge any legacy mock demo user
        const userStr = localStorage.getItem('pmverse_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (
            u.id === 'demo-pm-user' ||
            u.fullName === 'Alex Vance' ||
            u.email === 'alex.pm@prodcraft.dev'
          ) {
            localStorage.removeItem('pmverse_user');
          }
        }

        localStorage.removeItem('prodcraft_demo_user');
        localStorage.removeItem('prodin_saved_jobs');
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <AuthProvider>
      {children}
      <GlobalModals />
    </AuthProvider>
  );
};
