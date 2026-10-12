import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ circles: [], message: 'Supabase client not initialized' });
    }

    const { data: circles, error } = await supabase
      .from('circles')
      .select('*, circle_members(*)')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ circles: [], error: error.message });
    }

    return NextResponse.json({ circles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch circles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, creatorId, creatorName, maxMembers, permissions } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 60) {
      return NextResponse.json(
        { error: 'Circle name is required and must be 60 characters or fewer.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0 || description.trim().length > 300) {
      return NextResponse.json(
        { error: 'Description is required and must be 300 characters or fewer.' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    }

    if (!creatorId || !creatorName) {
      return NextResponse.json({ error: 'User must be authenticated to create a Circle.' }, { status: 401 });
    }

    const newId = `circle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error: insertErr } = await supabase.from('circles').insert({
        id: newId,
        name: name.trim(),
        description: description.trim(),
        category,
        cover_icon: body.coverIcon || '⭕',
        purpose: body.purpose || '',
        creator_id: creatorId,
        creator_name: creatorName,
        max_members: maxMembers || 20,
        allow_member_invites: permissions?.allowMemberInvites ?? true,
        allow_member_posts: permissions?.allowMemberPosts ?? true,
        allow_file_uploads: permissions?.allowFileUploads ?? true,
        enable_notifications: permissions?.enableNotifications ?? true,
      });

      if (!insertErr) {
        await supabase.from('circle_members').insert({
          circle_id: newId,
          user_id: creatorId,
          name: creatorName,
          role: body.creatorRole || 'Product Manager',
          company: body.creatorCompany || '',
          avatar: body.creatorAvatar || '',
          membership_role: 'owner',
          joined_at: now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      circleId: newId,
      message: 'Circle created successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create circle' }, { status: 500 });
  }
}
