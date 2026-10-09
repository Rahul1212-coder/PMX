'use client';

import React, { useState, useEffect } from 'react';

export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0][0] || '';
      const last = parts[parts.length - 1][0] || '';
      return (first + last).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0][0].toUpperCase();
    }
  }

  if (email && email.trim()) {
    const username = email.split('@')[0] || '';
    const parts = username.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0][0] || '';
      const second = parts[1][0] || '';
      return (first + second).toUpperCase();
    }
    if (username.length > 0) {
      return username[0].toUpperCase();
    }
  }

  return 'PM';
}

export function isValidCustomAvatar(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Ignore legacy hardcoded dummy Unsplash seed placeholders so initials show naturally
  if (
    trimmed.includes('photo-1534528741775-53994a69daeb') ||
    trimmed.includes('photo-1535713875002-d1d0cf377fde')
  ) {
    return false;
  }
  return true;
}

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  onClick?: () => void;
  alt?: string;
}

const SIZE_MAP: Record<string, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-7 h-7', text: 'text-xs' },
  md: { container: 'w-8 h-8', text: 'text-xs' },
  lg: { container: 'w-10 h-10', text: 'text-sm' },
  xl: { container: 'w-12 h-12 text-base', text: 'text-base' },
  '2xl': { container: 'w-16 h-16', text: 'text-lg font-extrabold' },
  '3xl': { container: 'w-20 h-20 sm:w-24 sm:h-24', text: 'text-2xl font-black' },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  email,
  size = 'md',
  className = '',
  onClick,
  alt,
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = getInitials(name, email);
  const hasValidUrl = isValidCustomAvatar(src);

  // Reset error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (hasValidUrl && !imgError && src) {
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden ${sizeConfig.container} ${className}`}
      >
        <img
          src={src}
          alt={alt || name || 'Profile Avatar'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center flex-shrink-0 rounded-full bg-gradient-to-tr from-purple-800 via-purple-600 to-indigo-600 text-white font-bold select-none shadow-inner tracking-wider ${sizeConfig.container} ${sizeConfig.text} ${className}`}
      title={name || email || 'PM Profile'}
    >
      <span>{initials}</span>
    </div>
  );
};
