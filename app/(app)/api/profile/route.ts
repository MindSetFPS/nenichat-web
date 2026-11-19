import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';

const UPDATABLE_FIELDS = [
  'name',
  'last_name',
  'email',
  'phone',
  'birth_date',
  'avatar_url',
  'country',
] as const;

type UpdatableField = (typeof UPDATABLE_FIELDS)[number];

/**
 * Returns the authenticated user's profile row, creating a default one if it
 * does not exist yet.
 */
async function getOrCreateProfile(supabase: SupabaseClient, userId: string, email: string | undefined) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (profile) return profile;

  const { data: created, error: createError } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, email }, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (createError) throw createError;
  return created;
}

/**
 * GET handler for the profile API.
 * Returns the personal profile of the registered (authenticated) user.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { user: authUser, business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !authUser || !business) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, authUser.id, authUser.email);

    return NextResponse.json({ ...profile, business_id: business.id });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

/**
 * PATCH handler for the profile API.
 * Updates the optional personal-information fields of the authenticated user.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user: authUser, business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !authUser || !business) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Partial<Record<UpdatableField, string | null>> = {};

    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        const value = body[field];
        updates[field] = value === '' || value === null || value === undefined ? null : String(value);
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({ user_id: authUser.id, ...updates }, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ...profile, business_id: business.id });
  } catch (error) {
    console.error('Unexpected error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
