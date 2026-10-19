'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { PmStage } from '@/types';
import { X, Camera, Link as LinkIcon, Trash2, Check, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [pmStage, setPmStage] = useState<PmStage | ''>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && profile) {
      const emailPrefix = user?.email?.split('@')[0] || '';
      const initialName =
        (profile.fullName && !profile.fullName.includes('@') ? profile.fullName.trim() : '') ||
        (user?.user_metadata?.full_name ? String(user.user_metadata.full_name).trim() : '') ||
        (user?.user_metadata?.name ? String(user.user_metadata.name).trim() : '') ||
        (profile.fullName ? profile.fullName.trim() : '') ||
        emailPrefix;

      setFullName(initialName || '');
      setPmStage(profile.pmStage || (user?.user_metadata?.pm_stage as PmStage) || '');
      setYearsOfExperience(
        typeof profile.yearsOfExperience === 'number'
          ? profile.yearsOfExperience
          : typeof user?.user_metadata?.years_of_experience === 'number'
          ? user.user_metadata.years_of_experience
          : ''
      );

      const rawRole = (profile.role || user?.user_metadata?.role || '').trim();
      setRole(rawRole);

      const rawCompany = (profile.company || user?.user_metadata?.company || '').trim();
      const cleanCompany =
        rawCompany === 'Tech Company' || rawCompany === 'Independent PM' || rawCompany === 'Tech Squad'
          ? (user?.user_metadata?.company && !['Tech Company', 'Independent PM', 'Tech Squad'].includes(user.user_metadata.company)
              ? user.user_metadata.company
              : '')
          : rawCompany;
      setCompany(cleanCompany);
      setBio(profile.bio || user?.user_metadata?.bio || '');
      setAvatarUrl(profile.avatarUrl || user?.user_metadata?.avatar_url || '');
      setUrlInput(profile.avatarUrl || user?.user_metadata?.avatar_url || '');
      setStatusMessage(null);
      setShowUrlInput(false);
    }
  }, [isOpen, profile, user]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file.' });
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
          const MAX_SIZE = 120;
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
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setAvatarUrl(compressedBase64);
            setStatusMessage({ type: 'success', text: 'Profile photo selected.' });
          }
        } catch {
          setStatusMessage({ type: 'error', text: 'Failed to process image. Please choose another file.' });
        } finally {
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
        pmStage: pmStage || undefined,
        yearsOfExperience: typeof yearsOfExperience === 'number' ? yearsOfExperience : undefined,
      });

      if (res?.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        // Also sync to backend service-role API to guarantee Supabase DB and auth metadata stay in sync
        if (user?.id) {
          fetch('/api/auth/profile-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              fullName: fullName.trim(),
              role: role.trim(),
              company: company.trim(),
              bio: bio.trim(),
              avatarUrl: avatarUrl.trim(),
              pmStage: pmStage || undefined,
              yearsOfExperience: typeof yearsOfExperience === 'number' ? yearsOfExperience : undefined,
            }),
          }).catch(() => {});
        }

        setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-lg w-full shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b-2 border-[rgba(32,30,29,0.15)]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#ae1800] font-bold">
              PMVerse Verification
            </div>
            <h2 className="text-xl font-black text-[#201e1d] m-0">Edit Public Profile</h2>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 text-xs font-semibold flex items-center space-x-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Avatar Upload Swatch */}
          <div className="flex items-center gap-4 p-3.5 bg-[#eae9e9] border border-[rgba(32,30,29,0.15)]">
            <UserAvatar name={fullName} src={avatarUrl} size="2xl" />
            <div className="space-y-1.5 flex-1">
              <div className="text-xs font-bold text-[#201e1d]">Profile Swatch / Photo</div>
              <div className="flex flex-wrap gap-1.5">
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
                  className="btn btn-secondary text-xs font-bold py-1 px-2.5"
                >
                  <Camera className="w-3.5 h-3.5 mr-1" />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="btn btn-ghost text-xs font-bold py-1 px-2"
                >
                  <LinkIcon className="w-3 h-3 mr-1" />
                  <span>Link URL</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('');
                      setUrlInput('');
                    }}
                    className="btn btn-ghost text-xs font-bold py-1 px-2 text-[#ae1800]"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="input text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl(urlInput);
                  setShowUrlInput(false);
                }}
                className="btn btn-primary text-xs font-bold px-3"
              >
                Apply
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#201e1d] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#201e1d] mb-1">Career Stage</label>
              <select
                value={pmStage}
                onChange={(e) => {
                  const nextStage = e.target.value as PmStage;
                  setPmStage(nextStage);
                  if (nextStage === 'fresher' && typeof yearsOfExperience === 'number' && yearsOfExperience > 1) {
                    setYearsOfExperience(0);
                  }
                }}
                className="input bg-white text-xs"
              >
                <option value="" disabled>
                  Select your stage...
                </option>
                <option value="existing_pm">Practicing PM</option>
                <option value="switching_roles">Switching to PM</option>
                <option value="fresher">Fresher / APM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#201e1d] mb-1">Experience (Years)</label>
              <select
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
                className="input bg-white text-xs"
              >
                <option value="" disabled>
                  Select experience...
                </option>
                <option value={0}>0 Yrs (Fresher / Student)</option>
                <option value={1}>1 Yr (APM / Associate)</option>
                <option value={2}>2 Yrs</option>
                <option value={3}>3 Yrs (Mid PM)</option>
                <option value={4}>4 Yrs</option>
                <option value={5}>5 Yrs (Senior PM)</option>
                <option value={6}>6 Yrs</option>
                <option value={8}>8 Yrs (Lead / Staff)</option>
                <option value={10}>10+ Yrs (Principal / VP)</option>
                <option value={14}>14+ Yrs (Director / CPO)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#201e1d] mb-1">PM Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Associate PM, Senior PM"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#201e1d] mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Swiggy, Razorpay or Independent"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#201e1d] mb-1">Bio / Headline</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Product philosophy, target industries, or roadmapping focus..."
              className="input text-xs"
            />
          </div>

          <div className="pt-3 border-t-2 border-[rgba(32,30,29,0.15)] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary text-xs font-bold px-5"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
