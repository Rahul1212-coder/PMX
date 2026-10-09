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
  return (
    <AuthProvider>
      {children}
      <GlobalModals />
    </AuthProvider>
  );
};
