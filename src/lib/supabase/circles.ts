import { getSupabaseClient, isSupabaseConfigured } from './client';
import {
  Circle,
  CircleMember,
  CircleInvitation,
  CirclePost,
  CircleReply,
  CircleResource,
  CircleActivity,
  CircleRole,
  UserProfile,
} from '@/types';

const CIRCLES_STORAGE_KEY = 'pmverse_circles_cache_v1';
const CIRCLE_INVITES_STORAGE_KEY = 'pmverse_circle_invites_cache_v1';
const CIRCLE_POSTS_STORAGE_KEY = 'pmverse_circle_posts_cache_v1';
const CIRCLE_RESOURCES_STORAGE_KEY = 'pmverse_circle_resources_cache_v1';
const CIRCLE_ACTIVITIES_STORAGE_KEY = 'pmverse_circle_activities_cache_v1';

// Seed initial collaborative circles for realistic demonstration
const SEED_CIRCLES: Circle[] = [
  {
    id: 'circle-teardown-alpha',
    name: 'SaaS Teardowns & Growth Loops',
    description: 'Weekly dissection of viral consumer & B2B software products. We analyze onboarding friction, retention hooks, and monetization triggers.',
    category: 'Product Teardown',
    coverIcon: '🔍',
    purpose: 'Deep dive into 1 high-growth product every Thursday at 7 PM IST.',
    creatorId: 'user-seed-1',
    creatorName: 'Arjun Mehta',
    maxMembers: 12,
    membersCount: 4,
    permissions: {
      allowMemberInvites: true,
      allowMemberPosts: true,
      allowFileUploads: true,
      enableNotifications: true,
    },
    members: [
      {
        id: 'cm-1',
        userId: 'user-seed-1',
        circleId: 'circle-teardown-alpha',
        name: 'Arjun Mehta',
        role: 'Senior PM @ Razorpay',
        membershipRole: 'owner',
        joinedAt: '2026-10-01T10:00:00Z',
        pmFitScore: 88,
      },
      {
        id: 'cm-2',
        userId: 'user-seed-2',
        circleId: 'circle-teardown-alpha',
        name: 'Priya Sharma',
        role: 'Growth PM @ Swiggy',
        membershipRole: 'admin',
        joinedAt: '2026-10-02T12:00:00Z',
        pmFitScore: 84,
      },
      {
        id: 'cm-3',
        userId: 'user-seed-3',
        circleId: 'circle-teardown-alpha',
        name: 'Devansh Kulkarni',
        role: 'Product Lead @ BrowserStack',
        membershipRole: 'member',
        joinedAt: '2026-10-04T15:30:00Z',
        pmFitScore: 91,
      },
    ],
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-12T14:00:00Z',
    lastActivityAt: '2026-10-12T11:45:00Z',
    unreadCount: 2,
    nextActivity: {
      title: 'Notion 3.0 Agentic AI Teardown',
      date: 'Thursday, 7:00 PM',
      type: 'Teardown Session',
    },
  },
  {
    id: 'circle-mock-faang',
    name: 'FAANG & Tier-1 Mock Interview Syndicate',
    description: 'Peer-to-peer 1:1 mock interview practice for Product Sense, Execution, Metrics RCA, and System Architecture with live rubric scoring.',
    category: 'Mock Interviews',
    coverIcon: '🎯',
    purpose: 'Practice at least 2 mock interviews per week with structured feedback.',
    creatorId: 'user-seed-4',
    creatorName: 'Rohan Gupta',
    maxMembers: 8,
    membersCount: 3,
    permissions: {
      allowMemberInvites: false,
      allowMemberPosts: true,
      allowFileUploads: true,
      enableNotifications: true,
    },
    members: [
      {
        id: 'cm-4',
        userId: 'user-seed-4',
        circleId: 'circle-mock-faang',
        name: 'Rohan Gupta',
        role: 'Principal PM @ Microsoft',
        membershipRole: 'owner',
        joinedAt: '2026-10-05T08:00:00Z',
        pmFitScore: 94,
      },
      {
        id: 'cm-5',
        userId: 'user-seed-5',
        circleId: 'circle-mock-faang',
        name: 'Ananya Verma',
        role: 'PM @ Zepto',
        membershipRole: 'member',
        joinedAt: '2026-10-06T11:20:00Z',
        pmFitScore: 82,
      },
    ],
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-12T13:00:00Z',
    lastActivityAt: '2026-10-12T09:15:00Z',
    unreadCount: 1,
    nextActivity: {
      title: 'Product Sense Mock: Uber for Senior Citizens',
      date: 'Tomorrow, 8:30 PM',
      type: 'Mock Interview',
    },
  },
];

const SEED_POSTS: Record<string, CirclePost[]> = {
  'circle-teardown-alpha': [
    {
      id: 'cp-101',
      circleId: 'circle-teardown-alpha',
      authorId: 'user-seed-1',
      authorName: 'Arjun Mehta',
      authorRole: 'Senior PM @ Razorpay',
      title: 'Linear 2026 Onboarding Teardown: Why zero-friction wins',
      content: 'Here is my breakdown of how Linear handles new workspace creation without overwhelming developers or product teams with Jira-style configuration dialogs.\n\nKey finding: They ask only 2 inputs upfront (Workspace Name + Issue Prefix) and defer project hierarchy to the actual first commit/issue.',
      templateType: 'teardown',
      templateData: {
        product: 'Linear App',
        targetUser: 'Engineering & Product Squads',
        coreProblem: 'Bloated project tracking software requiring hours of setup',
        recommendation: 'Adopt default sensible views and progressive disclosure',
      },
      isPinned: true,
      reactions: {
        '🔥': { count: 4, users: ['user-seed-2', 'user-seed-3'] },
        '💡': { count: 3, users: ['user-seed-2'] },
      },
      repliesCount: 2,
      replies: [
        {
          id: 'cpr-1',
          postId: 'cp-101',
          circleId: 'circle-teardown-alpha',
          authorId: 'user-seed-2',
          authorName: 'Priya Sharma',
          authorRole: 'Growth PM @ Swiggy',
          content: 'Completely agree. Their keyboard shortcuts during onboarding (Cmd+K) also build high retention habits on day one.',
          createdAt: '2026-10-11T16:20:00Z',
        },
      ],
      createdAt: '2026-10-11T14:30:00Z',
    },
  ],
  'circle-mock-faang': [
    {
      id: 'cp-201',
      circleId: 'circle-mock-faang',
      authorId: 'user-seed-4',
      authorName: 'Rohan Gupta',
      authorRole: 'Principal PM @ Microsoft',
      title: 'Practice Prompt of the Week: Design Google Maps for Visually Impaired',
      content: 'Tips to keep in mind for this Product Sense case:\n1. Segment visually impaired users (completely blind vs low vision vs temporary injury)\n2. Pinpoint non-visual sensory modalities (haptic vibrations, audio beaconing, spatial audio)\n3. Avoid generic features — focus on sidewalk obstructions and transit transfers.',
      templateType: 'interview',
      templateData: {
        interviewType: 'Product Sense',
        interviewer: 'Rohan Gupta',
        casePrompt: 'Design Google Maps for Visually Impaired Commuters',
      },
      isPinned: true,
      reactions: {
        '🎯': { count: 3, users: ['user-seed-5'] },
        '👍': { count: 2, users: ['user-seed-5'] },
      },
      repliesCount: 1,
      createdAt: '2026-10-10T10:00:00Z',
    },
  ],
};

const SEED_ACTIVITIES: Record<string, CircleActivity[]> = {
  'circle-teardown-alpha': [
    {
      id: 'ca-101',
      circleId: 'circle-teardown-alpha',
      title: 'Notion 3.0 Agentic AI Teardown',
      description: 'Prepare a 10-minute slide or Figma teardown on how Notion Agents handle user permissions and multi-doc reasoning.',
      activityType: 'Teardown Session',
      scheduledDate: '2026-10-15T13:30:00Z',
      dueDate: '2026-10-15T13:30:00Z',
      assigneeName: 'Priya Sharma',
      status: 'in_progress',
      checklist: [
        { id: 'chk-1', text: 'Document onboarding and AI permission prompt', completed: true },
        { id: 'chk-2', text: 'Measure average response latency across 5 complex prompts', completed: true },
        { id: 'chk-3', text: 'Synthesize 3 improvement opportunities', completed: false },
      ],
      createdAt: '2026-10-08T09:00:00Z',
    },
    {
      id: 'ca-102',
      circleId: 'circle-teardown-alpha',
      title: 'Stripe Billing v2 Checkout Flow Review',
      description: 'Analyze localized payment drop-offs and subscription renewal UX.',
      activityType: 'Case Study',
      scheduledDate: '2026-10-22T13:30:00Z',
      status: 'not_started',
      checklist: [
        { id: 'chk-4', text: 'Map checkout funnel drop-offs', completed: false },
        { id: 'chk-5', text: 'Review 3-D Secure fallback UX', completed: false },
      ],
      createdAt: '2026-10-10T11:00:00Z',
    },
  ],
  'circle-mock-faang': [
    {
      id: 'ca-201',
      circleId: 'circle-mock-faang',
      title: 'Product Sense Mock: Uber for Senior Citizens',
      description: '45-minute live mock session followed by 15-minute rubric feedback.',
      activityType: 'Mock Interview',
      scheduledDate: '2026-10-13T15:00:00Z',
      assigneeName: 'Ananya Verma',
      status: 'in_progress',
      checklist: [
        { id: 'chk-6', text: 'Clarifying questions & user segmentation', completed: true },
        { id: 'chk-7', text: 'Pain points prioritization', completed: false },
        { id: 'chk-8', text: 'North star & counter metrics definition', completed: false },
      ],
      sessionMetadata: {
        interviewType: 'Product Sense',
        interviewer: 'Rohan Gupta',
        candidate: 'Ananya Verma',
        casePrompt: 'Design Uber ride experience optimized for senior citizens living in assisted care.',
      },
      createdAt: '2026-10-11T12:00:00Z',
    },
  ],
};

const SEED_RESOURCES: Record<string, CircleResource[]> = {
  'circle-teardown-alpha': [
    {
      id: 'cr-101',
      circleId: 'circle-teardown-alpha',
      authorId: 'user-seed-1',
      authorName: 'Arjun Mehta',
      title: 'Linear Method Principles & Workflow Guide',
      description: 'Official Linear philosophy: Autonomous squads, outcome cycles, zero backlog grooming.',
      url: 'https://linear.app/method',
      category: 'Links',
      createdAt: '2026-10-02T10:00:00Z',
    },
    {
      id: 'cr-102',
      circleId: 'circle-teardown-alpha',
      authorId: 'user-seed-2',
      authorName: 'Priya Sharma',
      title: 'Product Teardown Framework Matrix (Notion/Doc)',
      description: 'Standard 7-dimension rubric used across our Thursday evening teardown calls.',
      content: '1. Problem Clarity\n2. User Segmentation\n3. Value Prop & Aha Moment\n4. Onboarding Friction\n5. Viral / Growth Loops\n6. Monetization UX\n7. Counter-metrics',
      category: 'Case Studies',
      createdAt: '2026-10-04T12:30:00Z',
    },
  ],
  'circle-mock-faang': [
    {
      id: 'cr-201',
      circleId: 'circle-mock-faang',
      authorId: 'user-seed-4',
      authorName: 'Rohan Gupta',
      title: 'Meta & Google Product Sense Rubric (Level 5 / 6)',
      description: 'The exact 4-bar evaluation matrix: Problem comprehension, creative vision, structural prioritization, trade-off defense.',
      url: 'https://pmverse.in',
      category: 'Interview Prep',
      createdAt: '2026-10-07T14:00:00Z',
    },
  ],
};

// ==============================================================================
// LOCAL STORAGE HELPERS
// ==============================================================================

function getLocalCircles(): Circle[] {
  if (typeof window === 'undefined') return SEED_CIRCLES;
  try {
    const raw = localStorage.getItem(CIRCLES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CIRCLES_STORAGE_KEY, JSON.stringify(SEED_CIRCLES));
      return SEED_CIRCLES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CIRCLES;
  }
}

function saveLocalCircles(circles: Circle[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CIRCLES_STORAGE_KEY, JSON.stringify(circles));
  } catch {
    // Ignore storage quota
  }
}

function getLocalInvitations(): CircleInvitation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CIRCLE_INVITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInvitations(invites: CircleInvitation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CIRCLE_INVITES_STORAGE_KEY, JSON.stringify(invites));
  } catch {
    // Ignore storage quota
  }
}

function getLocalPosts(circleId: string): CirclePost[] {
  if (typeof window === 'undefined') return SEED_POSTS[circleId] || [];
  try {
    const raw = localStorage.getItem(`${CIRCLE_POSTS_STORAGE_KEY}_${circleId}`);
    if (!raw) {
      const initial = SEED_POSTS[circleId] || [];
      if (initial.length > 0) {
        localStorage.setItem(`${CIRCLE_POSTS_STORAGE_KEY}_${circleId}`, JSON.stringify(initial));
      }
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_POSTS[circleId] || [];
  }
}

function saveLocalPosts(circleId: string, posts: CirclePost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CIRCLE_POSTS_STORAGE_KEY}_${circleId}`, JSON.stringify(posts));
  } catch {}
}

function getLocalResources(circleId: string): CircleResource[] {
  if (typeof window === 'undefined') return SEED_RESOURCES[circleId] || [];
  try {
    const raw = localStorage.getItem(`${CIRCLE_RESOURCES_STORAGE_KEY}_${circleId}`);
    if (!raw) {
      const initial = SEED_RESOURCES[circleId] || [];
      if (initial.length > 0) {
        localStorage.setItem(`${CIRCLE_RESOURCES_STORAGE_KEY}_${circleId}`, JSON.stringify(initial));
      }
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_RESOURCES[circleId] || [];
  }
}

function saveLocalResources(circleId: string, resources: CircleResource[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CIRCLE_RESOURCES_STORAGE_KEY}_${circleId}`, JSON.stringify(resources));
  } catch {}
}

function getLocalActivities(circleId: string): CircleActivity[] {
  if (typeof window === 'undefined') return SEED_ACTIVITIES[circleId] || [];
  try {
    const raw = localStorage.getItem(`${CIRCLE_ACTIVITIES_STORAGE_KEY}_${circleId}`);
    if (!raw) {
      const initial = SEED_ACTIVITIES[circleId] || [];
      if (initial.length > 0) {
        localStorage.setItem(`${CIRCLE_ACTIVITIES_STORAGE_KEY}_${circleId}`, JSON.stringify(initial));
      }
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ACTIVITIES[circleId] || [];
  }
}

function saveLocalActivities(circleId: string, activities: CircleActivity[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CIRCLE_ACTIVITIES_STORAGE_KEY}_${circleId}`, JSON.stringify(activities));
  } catch {}
}

// ==============================================================================
// PUBLIC ASYNC API METHODS
// ==============================================================================

/**
 * Fetch all circles accessible to the current user (member of or created by).
 */
export async function getUserCirclesFromDb(userId?: string): Promise<Circle[]> {
  const localCircles = getLocalCircles();

  if (!isSupabaseConfigured()) {
    return localCircles;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return localCircles;

  try {
    // 1. Fetch circles from DB
    const { data: dbCircles, error: cErr } = await supabase
      .from('circles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (cErr || !dbCircles) {
      return localCircles;
    }

    // 2. Fetch members for these circles
    const circleIds = dbCircles.map((c: any) => c.id);
    const { data: dbMembers } = await supabase
      .from('circle_members')
      .select('*')
      .in('circle_id', circleIds);

    const membersByCircle = (dbMembers || []).reduce((acc: Record<string, CircleMember[]>, row: any) => {
      if (!acc[row.circle_id]) acc[row.circle_id] = [];
      acc[row.circle_id].push({
        id: row.id,
        userId: row.user_id,
        circleId: row.circle_id,
        name: row.name,
        role: row.role || 'Product Manager',
        company: row.company,
        avatar: row.avatar,
        membershipRole: row.membership_role as CircleRole,
        joinedAt: row.joined_at,
      });
      return acc;
    }, {});

    const mappedFromDb: Circle[] = dbCircles.map((row: any) => {
      const members = membersByCircle[row.id] || [];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        coverIcon: row.cover_icon || '⭕',
        coverImage: row.cover_image,
        purpose: row.purpose,
        creatorId: row.creator_id,
        creatorName: row.creator_name,
        maxMembers: row.max_members || 20,
        membersCount: members.length,
        members,
        permissions: {
          allowMemberInvites: row.allow_member_invites ?? true,
          allowMemberPosts: row.allow_member_posts ?? true,
          allowFileUploads: row.allow_file_uploads ?? true,
          enableNotifications: row.enable_notifications ?? true,
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isArchived: row.is_archived || false,
      };
    });

    // Merge with any local user-created circles not yet in remote DB
    const combined = [...mappedFromDb];
    for (const lc of localCircles) {
      if (!combined.some((c) => c.id === lc.id)) {
        combined.push(lc);
      }
    }

    return combined;
  } catch (err) {
    console.warn('Error reading circles from Supabase, falling back to local cache:', err);
    return localCircles;
  }
}

/**
 * Create a new Circle with creator as owner and send out invitations
 */
export async function createCircleInDb(
  circleData: {
    name: string;
    description: string;
    category: Circle['category'];
    coverIcon?: string;
    purpose?: string;
    maxMembers?: number;
    permissions?: Circle['permissions'];
    creatorId: string;
    creatorName: string;
    creatorRole?: string;
    creatorCompany?: string;
    creatorAvatar?: string;
    starterTemplate?: string;
  },
  invitedUsers: Array<{ id: string; name: string; role?: string; avatar?: string }> = []
): Promise<Circle> {
  const newId = `circle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const ownerMember: CircleMember = {
    id: `cm-${Date.now()}`,
    userId: circleData.creatorId,
    circleId: newId,
    name: circleData.creatorName,
    role: circleData.creatorRole || 'Product Manager',
    company: circleData.creatorCompany || '',
    avatar: circleData.creatorAvatar || '',
    membershipRole: 'owner',
    joinedAt: now,
  };

  const newCircle: Circle = {
    id: newId,
    name: circleData.name.trim(),
    description: circleData.description.trim(),
    category: circleData.category,
    coverIcon: circleData.coverIcon || '⭕',
    purpose: circleData.purpose?.trim() || '',
    creatorId: circleData.creatorId,
    creatorName: circleData.creatorName,
    maxMembers: circleData.maxMembers || 20,
    membersCount: 1,
    members: [ownerMember],
    permissions: circleData.permissions || {
      allowMemberInvites: true,
      allowMemberPosts: true,
      allowFileUploads: true,
      enableNotifications: true,
    },
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    unreadCount: 0,
  };

  // 1. Save locally
  const currentLocal = getLocalCircles();
  saveLocalCircles([newCircle, ...currentLocal]);

  // Create local invitations
  const currentInvites = getLocalInvitations();
  const createdInvites: CircleInvitation[] = invitedUsers.map((inv) => ({
    id: `cinv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    circleId: newId,
    circleName: newCircle.name,
    circleCategory: newCircle.category,
    circleIcon: newCircle.coverIcon,
    inviterId: circleData.creatorId,
    inviterName: circleData.creatorName,
    inviterRole: circleData.creatorRole,
    inviterAvatar: circleData.creatorAvatar,
    inviteeId: inv.id,
    inviteeName: inv.name,
    status: 'pending',
    createdAt: now,
  }));
  saveLocalInvitations([...createdInvites, ...currentInvites]);

  // If a template was selected, seed initial starter discussion and activity
  if (circleData.starterTemplate === 'Product Teardown Club') {
    const starterPost: CirclePost = {
      id: `cp-start-${Date.now()}`,
      circleId: newId,
      authorId: circleData.creatorId,
      authorName: circleData.creatorName,
      authorRole: circleData.creatorRole || 'Product Manager',
      authorAvatar: circleData.creatorAvatar,
      title: `Welcome to ${newCircle.name}! 🚀`,
      content: 'Welcome everyone to our Product Teardown space! Here we analyze products, user journeys, UX friction, and business metrics.\n\nDrop an upcoming product you want us to dissect this week!',
      templateType: 'teardown',
      templateData: { product: 'First Teardown Candidate', targetUser: 'Early Adopters' },
      isPinned: true,
      reactions: { '🔥': { count: 1, users: [circleData.creatorId] } },
      repliesCount: 0,
      createdAt: now,
    };
    saveLocalPosts(newId, [starterPost]);

    const starterActivity: CircleActivity = {
      id: `ca-start-${Date.now()}`,
      circleId: newId,
      title: 'Pick first teardown product & schedule call',
      description: 'Vote on which product teardown to conduct for our first session.',
      activityType: 'Teardown Session',
      status: 'in_progress',
      checklist: [
        { id: 'c1', text: 'Nominate 3 candidate apps in discussions', completed: true },
        { id: 'c2', text: 'Confirm date and video link', completed: false },
      ],
      createdAt: now,
    };
    saveLocalActivities(newId, [starterActivity]);
  } else if (circleData.starterTemplate === 'Mock Interview Practice') {
    const starterActivity: CircleActivity = {
      id: `ca-mock-${Date.now()}`,
      circleId: newId,
      title: 'Mock Interview Practice Session #1',
      description: 'Pair up for 1:1 Product Sense case interview with live rubric feedback.',
      activityType: 'Mock Interview',
      status: 'not_started',
      checklist: [
        { id: 'cm1', text: 'Select candidate and interviewer', completed: false },
        { id: 'cm2', text: 'Choose case prompt from Resources', completed: false },
        { id: 'cm3', text: 'Record constructive scoring rubric', completed: false },
      ],
      sessionMetadata: {
        interviewType: 'Product Sense',
        casePrompt: 'Design an audio navigation experience for warehouse pickers.',
      },
      createdAt: now,
    };
    saveLocalActivities(newId, [starterActivity]);
  }

  // 2. Try Supabase
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circles').insert({
        id: newId,
        name: newCircle.name,
        description: newCircle.description,
        category: newCircle.category,
        cover_icon: newCircle.coverIcon,
        purpose: newCircle.purpose,
        creator_id: newCircle.creatorId,
        creator_name: newCircle.creatorName,
        max_members: newCircle.maxMembers,
        allow_member_invites: newCircle.permissions.allowMemberInvites,
        allow_member_posts: newCircle.permissions.allowMemberPosts,
        allow_file_uploads: newCircle.permissions.allowFileUploads,
        enable_notifications: newCircle.permissions.enableNotifications,
      });

      await supabase.from('circle_members').insert({
        circle_id: newId,
        user_id: circleData.creatorId,
        name: circleData.creatorName,
        role: circleData.creatorRole || 'Product Manager',
        company: circleData.creatorCompany || '',
        avatar: circleData.creatorAvatar || '',
        membership_role: 'owner',
      });

      if (createdInvites.length > 0) {
        await supabase.from('circle_invitations').insert(
          createdInvites.map((ci) => ({
            circle_id: ci.circleId,
            inviter_id: ci.inviterId,
            invitee_id: ci.inviteeId,
            status: 'pending',
          }))
        );
      }
    } catch (e) {
      console.warn('Supabase circle creation warning (local cache retained):', e);
    }
  }

  return newCircle;
}

/**
 * Fetch pending invitations for a specific user
 */
export async function getUserCircleInvitationsFromDb(userId: string): Promise<CircleInvitation[]> {
  const localInvites = getLocalInvitations().filter(
    (inv) => inv.inviteeId === userId && inv.status === 'pending'
  );

  const supabase = getSupabaseClient();
  if (!isSupabaseConfigured() || !supabase) {
    return localInvites;
  }

  try {
    const { data, error } = await supabase
      .from('circle_invitations')
      .select('*, circles(name, category, cover_icon), profiles!circle_invitations_inviter_id_fkey(full_name, role, avatar_url)')
      .eq('invitee_id', userId)
      .eq('status', 'pending');

    if (error || !data) return localInvites;

    const mapped: CircleInvitation[] = data.map((row: any) => ({
      id: row.id,
      circleId: row.circle_id,
      circleName: row.circles?.name || 'Private Circle',
      circleCategory: row.circles?.category || 'Custom',
      circleIcon: row.circles?.cover_icon || '⭕',
      inviterId: row.inviter_id,
      inviterName: row.profiles?.full_name || 'A fellow PM',
      inviterRole: row.profiles?.role || 'Product Manager',
      inviterAvatar: row.profiles?.avatar_url || '',
      inviteeId: row.invitee_id,
      status: row.status,
      createdAt: row.created_at,
    }));

    // Merge without duplicates
    const all = [...mapped];
    for (const li of localInvites) {
      if (!all.some((i) => i.id === li.id)) {
        all.push(li);
      }
    }
    return all;
  } catch {
    return localInvites;
  }
}

/**
 * Respond to an invitation (Accept or Decline)
 */
export async function respondToCircleInvitationInDb(
  invitationId: string,
  circleId: string,
  status: 'accepted' | 'declined',
  user: UserProfile
): Promise<boolean> {
  const now = new Date().toISOString();

  // 1. Update local invitations
  const localInvites = getLocalInvitations();
  const inviteIndex = localInvites.findIndex((i) => i.id === invitationId || (i.circleId === circleId && i.inviteeId === user.id));
  if (inviteIndex >= 0) {
    localInvites[inviteIndex].status = status;
    saveLocalInvitations(localInvites);
  }

  // 2. If accepted, add to circle members locally
  if (status === 'accepted') {
    const circles = getLocalCircles();
    const target = circles.find((c) => c.id === circleId);
    if (target) {
      const alreadyMember = target.members.some((m) => m.userId === user.id);
      if (!alreadyMember) {
        const newMember: CircleMember = {
          id: `cm-${Date.now()}`,
          userId: user.id,
          circleId,
          name: user.fullName,
          role: user.role || 'Product Manager',
          company: user.company || '',
          avatar: user.avatarUrl || '',
          membershipRole: 'member',
          joinedAt: now,
          pmFitScore: user.pmFitScore,
        };
        target.members.push(newMember);
        target.membersCount = target.members.length;
        saveLocalCircles(circles);
      }
    }
  }

  // 3. Supabase update
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('circle_invitations')
        .update({ status })
        .match({ circle_id: circleId, invitee_id: user.id });

      if (status === 'accepted') {
        await supabase.from('circle_members').upsert(
          {
            circle_id: circleId,
            user_id: user.id,
            name: user.fullName,
            role: user.role,
            company: user.company,
            avatar: user.avatarUrl,
            membership_role: 'member',
            joined_at: now,
          },
          { onConflict: 'circle_id,user_id' }
        );
      }
    } catch (e) {
      console.warn('Supabase invitation response update error:', e);
    }
  }

  return true;
}

/**
 * Leave a Circle
 */
export async function leaveCircleInDb(circleId: string, userId: string): Promise<boolean> {
  const circles = getLocalCircles();
  const circle = circles.find((c) => c.id === circleId);
  if (circle) {
    circle.members = circle.members.filter((m) => m.userId !== userId);
    circle.membersCount = circle.members.length;
    saveLocalCircles(circles);
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circle_members').delete().match({ circle_id: circleId, user_id: userId });
    } catch {}
  }
  return true;
}

/**
 * Delete a Circle (Owner only)
 */
export async function deleteCircleInDb(circleId: string, userId: string): Promise<boolean> {
  const circles = getLocalCircles().filter((c) => c.id !== circleId);
  saveLocalCircles(circles);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circles').delete().match({ id: circleId, creator_id: userId });
    } catch {}
  }
  return true;
}

/**
 * Discussions / Posts
 */
export async function getCirclePostsFromDb(circleId: string): Promise<CirclePost[]> {
  const localPosts = getLocalPosts(circleId);

  const supabase = getSupabaseClient();
  if (!isSupabaseConfigured() || !supabase) {
    return localPosts;
  }

  try {
    const { data: postsData, error } = await supabase
      .from('circle_posts')
      .select('*, circle_post_replies(*)')
      .eq('circle_id', circleId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !postsData) return localPosts;

    const mapped: CirclePost[] = postsData.map((row: any) => ({
      id: row.id,
      circleId: row.circle_id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorRole: row.author_role,
      authorCompany: row.author_company,
      authorAvatar: row.author_avatar,
      title: row.title,
      content: row.content,
      templateType: row.template_type,
      templateData: row.template_data,
      isPinned: row.is_pinned,
      reactions: {},
      repliesCount: row.circle_post_replies?.length || 0,
      replies: (row.circle_post_replies || []).map((r: any) => ({
        id: r.id,
        postId: r.post_id,
        circleId: r.circle_id,
        authorId: r.author_id,
        authorName: r.author_name,
        authorRole: r.author_role,
        authorAvatar: r.author_avatar,
        content: r.content,
        createdAt: r.created_at,
      })),
      createdAt: row.created_at,
    }));

    return mapped.length > 0 ? mapped : localPosts;
  } catch {
    return localPosts;
  }
}

export async function createCirclePostInDb(
  post: Omit<CirclePost, 'id' | 'createdAt' | 'reactions' | 'repliesCount'>
): Promise<CirclePost> {
  const newId = `cp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullPost: CirclePost = {
    ...post,
    id: newId,
    reactions: {},
    repliesCount: 0,
    replies: [],
    createdAt: now,
  };

  const local = getLocalPosts(post.circleId);
  saveLocalPosts(post.circleId, [fullPost, ...local]);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circle_posts').insert({
        id: newId,
        circle_id: post.circleId,
        author_id: post.authorId,
        author_name: post.authorName,
        author_role: post.authorRole,
        author_company: post.authorCompany,
        author_avatar: post.authorAvatar,
        title: post.title,
        content: post.content,
        template_type: post.templateType,
        template_data: post.templateData,
        is_pinned: post.isPinned || false,
      });
    } catch {}
  }

  return fullPost;
}

export async function createCircleReplyInDb(
  reply: Omit<CircleReply, 'id' | 'createdAt'>
): Promise<CircleReply> {
  const newId = `cpr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullReply: CircleReply = {
    ...reply,
    id: newId,
    createdAt: now,
  };

  const posts = getLocalPosts(reply.circleId);
  const target = posts.find((p) => p.id === reply.postId);
  if (target) {
    target.replies = [...(target.replies || []), fullReply];
    target.repliesCount = target.replies.length;
    saveLocalPosts(reply.circleId, posts);
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circle_post_replies').insert({
        id: newId,
        post_id: reply.postId,
        circle_id: reply.circleId,
        author_id: reply.authorId,
        author_name: reply.authorName,
        author_role: reply.authorRole,
        author_avatar: reply.authorAvatar,
        content: reply.content,
      });
    } catch {}
  }

  return fullReply;
}

export async function toggleCirclePostReactionInDb(
  postId: string,
  circleId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const posts = getLocalPosts(circleId);
  const target = posts.find((p) => p.id === postId);
  if (target) {
    if (!target.reactions[emoji]) {
      target.reactions[emoji] = { count: 0, users: [] };
    }
    const idx = target.reactions[emoji].users.indexOf(userId);
    if (idx >= 0) {
      target.reactions[emoji].users.splice(idx, 1);
      target.reactions[emoji].count = Math.max(0, target.reactions[emoji].count - 1);
      if (target.reactions[emoji].count === 0) {
        delete target.reactions[emoji];
      }
    } else {
      target.reactions[emoji].users.push(userId);
      target.reactions[emoji].count += 1;
    }
    saveLocalPosts(circleId, posts);
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('circle_post_reactions')
        .upsert({ post_id: postId, circle_id: circleId, user_id: userId, emoji });
    } catch {}
  }
}

/**
 * Resources
 */
export async function getCircleResourcesFromDb(circleId: string): Promise<CircleResource[]> {
  const localResources = getLocalResources(circleId);

  const supabase = getSupabaseClient();
  if (!isSupabaseConfigured() || !supabase) {
    return localResources;
  }

  try {
    const { data, error } = await supabase
      .from('circle_resources')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });

    if (error || !data) return localResources;

    const mapped: CircleResource[] = data.map((r: any) => ({
      id: r.id,
      circleId: r.circle_id,
      authorId: r.author_id,
      authorName: r.author_name,
      title: r.title,
      description: r.description,
      url: r.url,
      content: r.content,
      category: r.category,
      createdAt: r.created_at,
    }));

    return mapped.length > 0 ? mapped : localResources;
  } catch {
    return localResources;
  }
}

export async function createCircleResourceInDb(
  resource: Omit<CircleResource, 'id' | 'createdAt'>
): Promise<CircleResource> {
  const newId = `cr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullResource: CircleResource = {
    ...resource,
    id: newId,
    createdAt: now,
  };

  const current = getLocalResources(resource.circleId);
  saveLocalResources(resource.circleId, [fullResource, ...current]);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circle_resources').insert({
        id: newId,
        circle_id: resource.circleId,
        author_id: resource.authorId,
        author_name: resource.authorName,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        content: resource.content,
        category: resource.category,
      });
    } catch {}
  }

  return fullResource;
}

/**
 * Activities
 */
export async function getCircleActivitiesFromDb(circleId: string): Promise<CircleActivity[]> {
  const localActivities = getLocalActivities(circleId);

  const supabase = getSupabaseClient();
  if (!isSupabaseConfigured() || !supabase) {
    return localActivities;
  }

  try {
    const { data, error } = await supabase
      .from('circle_activities')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });

    if (error || !data) return localActivities;

    const mapped: CircleActivity[] = data.map((a: any) => ({
      id: a.id,
      circleId: a.circle_id,
      title: a.title,
      description: a.description,
      activityType: a.activity_type,
      scheduledDate: a.scheduled_date,
      dueDate: a.due_date,
      assigneeId: a.assignee_id,
      assigneeName: a.assignee_name,
      assigneeAvatar: a.assignee_avatar,
      status: a.status,
      checklist: a.checklist || [],
      sessionMetadata: a.session_metadata,
      createdAt: a.created_at,
    }));

    return mapped.length > 0 ? mapped : localActivities;
  } catch {
    return localActivities;
  }
}

export async function createCircleActivityInDb(
  activity: Omit<CircleActivity, 'id' | 'createdAt'>
): Promise<CircleActivity> {
  const newId = `ca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullActivity: CircleActivity = {
    ...activity,
    id: newId,
    createdAt: now,
  };

  const current = getLocalActivities(activity.circleId);
  saveLocalActivities(activity.circleId, [fullActivity, ...current]);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circle_activities').insert({
        id: newId,
        circle_id: activity.circleId,
        title: activity.title,
        description: activity.description,
        activity_type: activity.activityType,
        scheduled_date: activity.scheduledDate,
        due_date: activity.dueDate,
        assignee_id: activity.assigneeId,
        assignee_name: activity.assigneeName,
        assignee_avatar: activity.assigneeAvatar,
        status: activity.status,
        checklist: activity.checklist,
        session_metadata: activity.sessionMetadata,
      });
    } catch {}
  }

  return fullActivity;
}

export async function updateCircleActivityStatusInDb(
  activityId: string,
  circleId: string,
  status: CircleActivity['status']
): Promise<void> {
  const activities = getLocalActivities(circleId);
  const target = activities.find((a) => a.id === activityId);
  if (target) {
    target.status = status;
    saveLocalActivities(circleId, activities);
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('circle_activities').update({ status }).eq('id', activityId);
    } catch {}
  }
}

export async function toggleCircleActivityChecklistInDb(
  activityId: string,
  circleId: string,
  checkId: string
): Promise<void> {
  const activities = getLocalActivities(circleId);
  const target = activities.find((a) => a.id === activityId);
  if (target) {
    target.checklist = target.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
    );
    saveLocalActivities(circleId, activities);
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase && target) {
    try {
      await supabase.from('circle_activities').update({ checklist: target.checklist }).eq('id', activityId);
    } catch {}
  }
}
