'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { X, Camera, Link as LinkIcon, Trash2, Check, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();

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
          const MAX_SIZE = 400;
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
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setAvatarUrl(compressedBase64);
            setStatusMessage({ type: 'success', text: 'Profile photo selected.' });
          }
        } catch {
          setAvatarUrl(event.target?.result as string);
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
      });

      if (res?.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#201e1d] mb-1">PM Title</label>
              <input
                type="text"
                required
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
                placeholder="Tech Squad"
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
