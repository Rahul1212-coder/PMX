'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Shield,
  Users,
  Check,
  Search,
  ArrowRight,
  ArrowLeft,
  Lock,
  Plus,
  AlertCircle,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Circle, CircleCategory, CirclePermissions } from '@/types';
import { CIRCLE_TEMPLATES, CirclePurposeTemplate } from './CircleTemplates';
import { createCircleInDb } from '@/lib/supabase/circles';
import { getOtherProfilesFromDb } from '@/lib/supabase/database';
import { UserAvatar } from '../UserAvatar';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCircleCreated: (circle: Circle) => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCircleCreated,
}) => {
  const { user, profile, openAuthModal } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<CirclePurposeTemplate>(CIRCLE_TEMPLATES[0]);

  // Step 2 Details Form State
  const [name, setName] = useState(CIRCLE_TEMPLATES[0].defaultName);
  const [description, setDescription] = useState(CIRCLE_TEMPLATES[0].defaultDescription);
  const [category, setCategory] = useState<CircleCategory>(CIRCLE_TEMPLATES[0].category);
  const [coverIcon, setCoverIcon] = useState(CIRCLE_TEMPLATES[0].icon);
  const [purpose, setPurpose] = useState(CIRCLE_TEMPLATES[0].defaultPurpose);
  const [maxMembers, setMaxMembers] = useState<number>(CIRCLE_TEMPLATES[0].recommendedMaxMembers);

  // Step 3 Privacy & Permissions
  const [permissions, setPermissions] = useState<CirclePermissions>({
    allowMemberInvites: true,
    allowMemberPosts: true,
    allowFileUploads: true,
    enableNotifications: true,
  });

  // Step 4 Invite Connections
  const [availableProfiles, setAvailableProfiles] = useState<
    Array<{ id: string; name: string; role: string; company?: string; avatar?: string }>
  >([]);
  const [inviteSearch, setInviteSearch] = useState('');
  const [selectedInvites, setSelectedInvites] = useState<
    Array<{ id: string; name: string; role: string; avatar?: string }>
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Fetch connections/profiles when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadMembers() {
      const dbProfiles = await getOtherProfilesFromDb(user?.id);
      if (dbProfiles && dbProfiles.length > 0) {
        setAvailableProfiles(
          dbProfiles.map((p) => ({
            id: p.id,
            name: p.fullName || 'Product Manager',
            role: p.role || 'Product Manager',
            company: p.company || '',
            avatar: p.avatarUrl || '',
          }))
        );
      } else {
        setAvailableProfiles([]);
      }
    }

    loadMembers();
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: CirclePurposeTemplate) => {
    setSelectedTemplate(tpl);
    setName(tpl.defaultName);
    setDescription(tpl.defaultDescription);
    setCategory(tpl.category);
    setCoverIcon(tpl.icon);
    setPurpose(tpl.defaultPurpose);
    setMaxMembers(tpl.recommendedMaxMembers);
    setCurrentStep(2);
  };

  const validateStep2 = () => {
    if (!name.trim()) {
      setValidationError('Circle name is required.');
      return false;
    }
    if (name.length > 60) {
      setValidationError('Circle name must be 60 characters or fewer.');
      return false;
    }
    if (!description.trim()) {
      setValidationError('Description is required.');
      return false;
    }
    if (description.length > 300) {
      setValidationError('Description must be 300 characters or fewer.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const toggleInviteUser = (p: { id: string; name: string; role: string; avatar?: string }) => {
    if (selectedInvites.some((i) => i.id === p.id)) {
      setSelectedInvites((prev) => prev.filter((i) => i.id !== p.id));
    } else {
      setSelectedInvites((prev) => [...prev, p]);
    }
  };

  const handleCreateCircle = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      const created = await createCircleInDb(
        {
          name,
          description,
          category,
          coverIcon,
          purpose,
          maxMembers,
          permissions,
          creatorId: user.id,
          creatorName: profile?.fullName || user.email?.split('@')[0] || 'Product Manager',
          creatorRole: profile?.role || 'Product Manager',
          creatorCompany: profile?.company || '',
          creatorAvatar: profile?.avatarUrl || '',
          starterTemplate: selectedTemplate.name,
        },
        selectedInvites
      );

      setIsSubmitting(false);
      onCircleCreated(created);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setValidationError(err.message || 'Failed to create circle. Please try again.');
    }
  };

  const filteredProfiles = availableProfiles.filter((p) => {
    if (p.id === user?.id) return false;
    const matchSearch =
      p.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      p.role.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(inviteSearch.toLowerCase()));
    return matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#201e1d] overflow-hidden text-[#201e1d]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[rgba(32,30,29,0.15)] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#ec3013] text-white flex items-center justify-center font-black text-sm">
              ⭕
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-none text-[#201e1d]">
                Create a PMVerse Circle
              </h2>
              <p className="text-xs text-[#605d5d] mt-1 font-medium">
                Step {currentStep} of 4 • {currentStep === 1 && 'Choose Purpose'}
                {currentStep === 2 && 'Circle Details'}
                {currentStep === 3 && 'Privacy & Permissions'}
                {currentStep === 4 && 'Invite Connections'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-[#201e1d] hover:bg-slate-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1">
          <div
            className="bg-[#ec3013] h-1 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#ec3013]" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: CHOOSE A PURPOSE TEMPLATE */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#201e1d]">
                  What is this Circle for?
                </h3>
                <p className="text-xs text-[#605d5d] mt-0.5">
                  Select a template to prefill structured discussions, activities, and goals. You can customize everything in the next step.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {CIRCLE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="p-3.5 bg-white border-2 border-[rgba(32,30,29,0.15)] hover:border-[#ec3013] rounded text-left transition-all hover:shadow-[3px_3px_0px_#201e1d] group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{tpl.icon}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {tpl.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-[#605d5d] mt-1 line-clamp-2 leading-relaxed">
                        {tpl.defaultDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 group-hover:text-[#ec3013]">
                      <span>{tpl.recommendedMaxMembers} max members</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CIRCLE DETAILS & PREVIEW */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Form */}
                <div className="lg:col-span-2 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#201e1d] mb-1">
                      Circle Name *
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., SaaS Teardowns & Growth Loops"
                      className="w-full text-sm font-semibold p-2.5 bg-white border-2 border-[rgba(32,30,29,0.2)] focus:border-[#ec3013] outline-none rounded"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Max 60 characters</span>
                      <span>{name.length}/60</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201e1d] mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      maxLength={300}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what your Circle collaborates on..."
                      className="w-full text-xs font-medium p-2.5 bg-white border-2 border-[rgba(32,30,29,0.2)] focus:border-[#ec3013] outline-none rounded"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Max 300 characters</span>
                      <span>{description.length}/300</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#201e1d] mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CircleCategory)}
                        className="w-full text-xs font-bold p-2 bg-white border-2 border-[rgba(32,30,29,0.2)] focus:border-[#ec3013] outline-none rounded"
                      >
                        <option value="Product Teardown">Product Teardown</option>
                        <option value="Mock Interviews">Mock Interviews</option>
                        <option value="Case Study Practice">Case Study Practice</option>
                        <option value="Vibe Coding & Build">Vibe Coding & Build</option>
                        <option value="Product Strategy">Product Strategy</option>
                        <option value="Peer Learning & Accountability">Peer Learning</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#201e1d] mb-1">
                        Icon Emoji
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        value={coverIcon}
                        onChange={(e) => setCoverIcon(e.target.value)}
                        className="w-full text-center text-lg p-1.5 bg-white border-2 border-[rgba(32,30,29,0.2)] focus:border-[#ec3013] outline-none rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201e1d] mb-1">
                      Shared Goal / Schedule (Optional)
                    </label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g., Weekly session every Thursday at 7 PM"
                      className="w-full text-xs font-medium p-2 bg-white border-2 border-[rgba(32,30,29,0.2)] focus:border-[#ec3013] outline-none rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201e1d] mb-1">
                      Max Members (Sensible Limit: 5 - 50)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={50}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      className="w-28 text-xs font-bold p-2 bg-white border-2 border-[rgba(32,30,29,0.2)] focus:border-[#ec3013] outline-none rounded"
                    />
                  </div>
                </div>

                {/* Live Card Preview */}
                <div className="bg-white p-3.5 border-2 border-[#201e1d] rounded shadow-[3px_3px_0px_#201e1d] flex flex-col justify-between h-fit">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#ec3013] block mb-2">
                      Live Card Preview
                    </span>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{coverIcon || '⭕'}</span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          {category}
                        </span>
                        <h4 className="font-black text-sm text-[#201e1d] truncate">
                          {name || 'Circle Name'}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-[#605d5d] line-clamp-3 leading-relaxed mt-2">
                      {description || 'Your circle description will appear here.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>1/{maxMembers} members</span>
                    <span className="text-[#ec3013] font-bold">Private</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRIVACY & PERMISSIONS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Strictly Private & Invitation-Only
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Only members you invite can access this Circle's discussions, documents, and resources. Non-members cannot see internal content or join without an invitation.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-[rgba(32,30,29,0.15)] rounded divide-y divide-slate-100">
                <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-xs text-[#201e1d] block">
                      Allow All Members to Invite Connections
                    </span>
                    <span className="text-[11px] text-slate-500">
                      When disabled, only Circle owner and admins can send invites.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.allowMemberInvites}
                    onChange={(e) =>
                      setPermissions((prev) => ({ ...prev, allowMemberInvites: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#ec3013]"
                  />
                </label>

                <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-xs text-[#201e1d] block">
                      Allow All Members to Create Discussions
                    </span>
                    <span className="text-[11px] text-slate-500">
                      When disabled, discussions can only be initiated by admins.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.allowMemberPosts}
                    onChange={(e) =>
                      setPermissions((prev) => ({ ...prev, allowMemberPosts: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#ec3013]"
                  />
                </label>

                <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-xs text-[#201e1d] block">
                      Allow Resource & File Uploads
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Members can share links, tear-down docs, and case templates.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.allowFileUploads}
                    onChange={(e) =>
                      setPermissions((prev) => ({ ...prev, allowFileUploads: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#ec3013]"
                  />
                </label>

                <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-xs text-[#201e1d] block">
                      Enable Notification Alerts by Default
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Notify members on new discussions, activity assignments, and replies.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.enableNotifications}
                    onChange={(e) =>
                      setPermissions((prev) => ({ ...prev, enableNotifications: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#ec3013]"
                  />
                </label>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  You will automatically become the <strong>Owner</strong> of this Circle. Ownership can be transferred anytime in settings.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: INVITE CONNECTIONS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-[#201e1d]">
                  Invite Your PM Connections
                </h3>
                <p className="text-xs text-[#605d5d] mt-0.5">
                  Select people from your PMVerse network. You can also skip and invite colleagues later from the workspace.
                </p>
              </div>

              {/* Selected Chips */}
              {selectedInvites.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded">
                  {selectedInvites.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-xs font-bold text-[#201e1d] rounded"
                    >
                      <span>{u.name}</span>
                      <button
                        onClick={() => toggleInviteUser(u)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  placeholder="Search connections by name, role, or company..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border-2 border-[rgba(32,30,29,0.15)] focus:border-[#ec3013] outline-none rounded"
                />
              </div>

              {/* Connections List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 bg-white p-2 border border-slate-200 rounded">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((p) => {
                    const isSelected = selectedInvites.some((i) => i.id === p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleInviteUser(p)}
                        className={`p-2 rounded flex items-center justify-between cursor-pointer transition ${
                          isSelected ? 'bg-red-50 border border-red-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar name={p.name} src={p.avatar} size="sm" />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-[#201e1d] truncate">
                              {p.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 truncate">
                              {p.role} {p.company ? `• ${p.company}` : ''}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#ec3013] border-[#ec3013] text-white'
                              : 'border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 font-medium">
                    {inviteSearch
                      ? `No connections found matching “${inviteSearch}”.`
                      : 'No connections found yet. You can invite colleagues anytime from the workspace.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t-2 border-[rgba(32,30,29,0.15)] bg-white flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="btn btn-secondary text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                onClick={() => {
                  if (currentStep === 1) setCurrentStep(2);
                  else if (currentStep === 2) handleNextFromStep2();
                  else if (currentStep === 3) setCurrentStep(4);
                }}
                className="btn btn-primary text-xs font-bold py-1.5 px-4 flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleCreateCircle}
                  disabled={isSubmitting}
                  className="btn btn-secondary text-xs font-bold py-1.5 px-3"
                >
                  Skip Invites
                </button>
                <button
                  onClick={handleCreateCircle}
                  disabled={isSubmitting}
                  className="btn btn-primary text-xs font-bold py-1.5 px-5 flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Creating Circle...' : 'Create & Open Circle'}</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
