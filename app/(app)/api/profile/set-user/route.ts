import { NextRequest, NextResponse } from 'next/server';
import { contactRepository } from '@/Nenichat/Contacts/infra/persistance/ContactRepository';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST handler for setting the current user's linked contact.
 * Updates the local contact repository and links the contact ID to the Supabase profile.
 * 
 * @param {NextRequest} request - The incoming request containing the userId.
 * @returns {Promise<NextResponse>} A JSON response containing the updated user or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 1. Update the local contact repository
    const user = await contactRepository.setMe(BigInt(userId));

    // 2. Link the contact ID to the Supabase profile
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authUser) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          contact_id: userId,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error updating Supabase profile:', profileError);
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error setting user:', error);
    return NextResponse.json({ error: 'Failed to set user' }, { status: 500 });
  }
}
