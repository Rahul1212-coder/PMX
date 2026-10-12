-- ==============================================================================
-- PMVerse Platform - Circles (Private Group Collaboration) Migration
-- ==============================================================================

-- 1. CIRCLES TABLE
CREATE TABLE IF NOT EXISTS public.circles (
  id TEXT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  description VARCHAR(300) NOT NULL,
  category TEXT NOT NULL,
  cover_icon TEXT DEFAULT '⭕',
  cover_image TEXT,
  purpose TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  max_members INTEGER DEFAULT 20,
  allow_member_invites BOOLEAN DEFAULT TRUE,
  allow_member_posts BOOLEAN DEFAULT TRUE,
  allow_file_uploads BOOLEAN DEFAULT TRUE,
  enable_notifications BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CIRCLE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Product Manager',
  company TEXT,
  avatar TEXT,
  membership_role TEXT NOT NULL CHECK (membership_role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- 3. CIRCLE INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.circle_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  UNIQUE(circle_id, invitee_id)
);

-- 4. CIRCLE POSTS TABLE (Discussions)
CREATE TABLE IF NOT EXISTS public.circle_posts (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Product Manager',
  author_company TEXT,
  author_avatar TEXT,
  title TEXT,
  content TEXT NOT NULL,
  template_type TEXT,
  template_data JSONB,
  is_pinned BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CIRCLE POST REPLIES TABLE
CREATE TABLE IF NOT EXISTS public.circle_post_replies (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES public.circle_posts(id) ON DELETE CASCADE NOT NULL,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Product Manager',
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CIRCLE POST REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.circle_post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT REFERENCES public.circle_posts(id) ON DELETE CASCADE NOT NULL,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- 7. CIRCLE RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.circle_resources (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('Links', 'Notes', 'Case Studies', 'Interview Prep', 'Documents', 'Tools')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CIRCLE ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.circle_activities (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignee_name TEXT,
  assignee_avatar TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  checklist JSONB DEFAULT '[]'::jsonb,
  session_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_invitations_invitee ON public.circle_invitations(invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle ON public.circle_posts(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circle_replies_post ON public.circle_post_replies(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_circle_reactions_post ON public.circle_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_circle_resources_circle ON public.circle_resources(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_activities_circle ON public.circle_activities(circle_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_activities ENABLE ROW LEVEL SECURITY;

-- Circles: Members or invited users can view
CREATE POLICY "Members can view circles"
  ON public.circles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = id AND cm.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.circle_invitations ci WHERE ci.circle_id = id AND ci.invitee_id = auth.uid() AND ci.status = 'pending')
  );

CREATE POLICY "Authenticated users can create circles"
  ON public.circles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owners and admins can update circles"
  ON public.circles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can delete circles"
  ON public.circles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = id AND cm.user_id = auth.uid() AND cm.membership_role = 'owner'
    )
  );

-- Circle Members: Members can view member list
CREATE POLICY "Members can view other circle members"
  ON public.circle_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Owners and admins or self-joining can insert members"
  ON public.circle_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update member roles"
  ON public.circle_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners, admins, or self can remove members"
  ON public.circle_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin')
    )
  );

-- Circle Invitations: Inviter, invitee, or admins can view/manage
CREATE POLICY "Inviter or invitee can view invitations"
  ON public.circle_invitations FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Circle members with invite permissions can create invitations"
  ON public.circle_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circle_members cm
      JOIN public.circles c ON c.id = cm.circle_id
      WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()
        AND (c.allow_member_invites = TRUE OR cm.membership_role IN ('owner', 'admin'))
    )
  );

CREATE POLICY "Invitee can update invitation status"
  ON public.circle_invitations FOR UPDATE
  USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

-- Circle Discussions & Content: Only members can read/write
CREATE POLICY "Members can view posts"
  ON public.circle_posts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Members can create posts"
  ON public.circle_posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Author or admins can update posts"
  ON public.circle_posts FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin'))
  );

CREATE POLICY "Author or admins can delete posts"
  ON public.circle_posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin'))
  );

-- Replies
CREATE POLICY "Members can view replies"
  ON public.circle_post_replies FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Members can create replies"
  ON public.circle_post_replies FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

-- Reactions
CREATE POLICY "Members can view reactions"
  ON public.circle_post_reactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Members can manage own reactions"
  ON public.circle_post_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can delete own reactions"
  ON public.circle_post_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Resources
CREATE POLICY "Members can view resources"
  ON public.circle_resources FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Members can create resources"
  ON public.circle_resources FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

-- Activities
CREATE POLICY "Members can view activities"
  ON public.circle_activities FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Members can create and update activities"
  ON public.circle_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
