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
  Sparkles,
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
            setStatusMessage({ type: 'success', text: 'Profile picture ready! Click "Save Changes" below.' });
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
    setStatusMessage({ type: 'success', text: 'Image URL applied! Click "Save Changes" to save.' });
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setUrlInput('');
    setStatusMessage({ type: 'success', text: 'Profile picture removed. Initials will be used.' });
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
        }, 600);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = getInitials(fullName, profile?.email || user?.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8 text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c053a] via-[#3b0764] to-[#581c87] p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Camera className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Edit PM Profile & Picture</h2>
              <p className="text-[11px] text-purple-200">
                Personalize your PMVerse identity and avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`flex items-start space-x-2 p-3 rounded-xl text-xs ${
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
          <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/80">
            <label className="text-xs font-bold text-slate-800 block mb-3">
              Profile Picture
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative group flex-shrink-0">
                <UserAvatar
                  src={avatarUrl}
                  name={fullName}
                  email={profile?.email || user?.email}
                  size="3xl"
                  className="ring-4 ring-purple-200/70 shadow-md"
                />
                {!avatarUrl && (
                  <span className="absolute -bottom-1 -right-1 bg-purple-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white">
                    Initials
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap gap-2">
                  {/* Upload from Device */}
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
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-700 text-white hover:bg-purple-800 transition shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Processing...' : 'Upload Photo'}</span>
                  </button>

                  {/* Toggle Image URL Input */}
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Image URL</span>
                  </button>

                  {/* Remove Photo */}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-xl text-rose-600 hover:bg-rose-50 transition border border-rose-200"
                      title="Clear photo to use initials"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Use Initials</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  {avatarUrl
                    ? 'Custom photo set. You can replace it or switch back to initials anytime.'
                    : `No photo added yet. Your profile displays "${initials}" initials.`}
                </p>

                {/* Optional Image URL Input Field */}
                {showUrlInput && (
                  <div className="flex items-center space-x-1.5 pt-1.5">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/your-photo.jpg"
                      className="flex-1 px-3 py-1.5 text-xs border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-2.5 py-1.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg hover:bg-purple-200 transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-3.5 pt-3 border-t border-purple-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Or select a professional PM avatar preset:
              </span>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setStatusMessage({ type: 'success', text: 'Preset avatar selected! Click Save Changes.' });
                    }}
                    className={`relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 transition hover:scale-110 ${
                      avatarUrl === url ? 'border-purple-600 ring-2 ring-purple-300' : 'border-slate-200'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>PM Role / Title</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-purple-600" />
                  <span>Company / Organization</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Linear, Stealth AI"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Bio / Headline</span>
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your PM focus, frameworks, or domain experience..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-md shadow-purple-600/20 transition disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
