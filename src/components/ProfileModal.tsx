'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar, getInitials } from './UserAvatar';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
  Check,
  AlertCircle,
  Building,
  Briefcase,
  User,
  FileText,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, isConfigured } = useAuth();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Product Manager');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens or profile changes
  useEffect(() => {
    if (isOpen && profile) {
      setFullName(profile.fullName || user?.user_metadata?.full_name || '');
      setRole(profile.role || 'Product Manager');
      setCompany(profile.company || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl || '');
      setUrlInput(profile.avatarUrl || '');
      setStatusMessage(null);
      setShowUrlInput(false);
    }
  }, [isOpen, profile, user]);

  if (!isOpen) return null;

  // Process & compress uploaded image file to lightweight base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file size should be less than 5MB.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; // Resize to max 400x400 for optimal quality & fast storage
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setAvatarUrl(compressedDataUrl);
            setStatusMessage({ type: 'success', text: 'Photo ready! Click "Save" below.' });
          } else {
            setAvatarUrl(event.target?.result as string);
          }
        } catch {
          setAvatarUrl(event.target?.result as string);
        } finally {
          setIsUploading(false);
        }
      };
      img.onerror = () => {
        setIsUploading(false);
        setStatusMessage({ type: 'error', text: 'Failed to read image.' });
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploading(false);
      setStatusMessage({ type: 'error', text: 'Failed to load image file.' });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setAvatarUrl(urlInput.trim());
    setStatusMessage({ type: 'success', text: 'Image URL applied! Click "Save" to finish.' });
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setUrlInput('');
    setStatusMessage({ type: 'success', text: 'Photo removed. Initials will be used.' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        role: role.trim(),
        company: company.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      if (res?.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = getInitials(fullName, profile?.email || user?.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-[#e0dfdc] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8 text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit intro & profile photo</h2>
            <p className="text-xs text-slate-500">
              Personalize your public product management identity
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`flex items-start space-x-2 p-3 rounded-md text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="bg-slate-50/70 rounded-lg p-4 border border-slate-200">
            <label className="text-xs font-bold text-slate-800 block mb-2.5">
              Profile Photo
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative group flex-shrink-0">
                <UserAvatar
                  src={avatarUrl}
                  name={fullName}
                  email={profile?.email || user?.email}
                  size="3xl"
                  className="border-2 border-white shadow-sm ring-1 ring-slate-300"
                />
                {!avatarUrl && (
                  <span className="absolute -bottom-1 -right-1 bg-[#0a66c2] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                    Initials
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#0a66c2] text-white hover:bg-[#004182] transition shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Processing...' : 'Upload photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Image URL</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-full text-rose-600 hover:bg-rose-50 transition border border-rose-200"
                      title="Clear photo to use initials"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Use initials</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  {avatarUrl
                    ? 'Custom photo set. You can replace it or revert back to initials anytime.'
                    : `No photo added yet. Your profile displays "${initials}" initials.`}
                </p>

                {showUrlInput && (
                  <div className="flex items-center space-x-1.5 pt-1">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/your-photo.jpg"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-[#0a66c2] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200 transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-3.5 pt-3 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Or choose a professional PM avatar preset:
              </span>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setStatusMessage({ type: 'success', text: 'Preset avatar selected! Click Save.' });
                    }}
                    className={`relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 transition hover:scale-105 ${
                      avatarUrl === url ? 'border-[#0a66c2] ring-2 ring-sky-200' : 'border-slate-200'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Headline / Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Linear, Stealth AI"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                About / PM Philosophy
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your PM focus, frameworks, or domain experience..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {isConfigured ? 'Syncs with Supabase profile' : 'Saved locally'}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-5 py-1.5 text-xs font-semibold rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white shadow-xs transition disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
