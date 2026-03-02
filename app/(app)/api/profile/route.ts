
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { contactRepository } from '@/Nenichat/Contacts/infra/persistance/ContactRepository';

/**
 * GET handler for the profile API.
 * Retrieves the current authenticated user's ID from Supabase and then fetches the profile data.
 * 
 * @returns {Promise<NextResponse>} A JSON response containing the profile data or an error message.
 */
export async function GET() {

  return NextResponse.json({
    "id": "1",
    "name": "Daniel",
    "phone": "1234567890",
    "email": "[EMAIL_ADDRESS]",
    "is_user": true,
    "created_at": "2022-01-01T00:00:00.000Z",
    "updated_at": "2022-01-01T00:00:00.000Z"
  })

  // try {
  //   const supabase = await createServerSupabaseClient();

  //   // Get the current authenticated user from Supabase
  //   const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  //   if (authError || !authUser) {
  //     return NextResponse.json({ error: 'No authenticated user found' }, { status: 401 });
  //   }

  //   // Get profile data from Supabase profiles table
  //   const { data: profile, error: profileError } = await supabase
  //     .from('profiles')
  //     .select('*')
  //     .eq('id', authUser.id)
  //     .single();

  //   if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'not found'
  //     console.error('Error fetching profile from Supabase:', profileError);
  //   }

  //   // If we have a profile and it contains a contact_id, fetch the corresponding contact data
  //   if (profile && profile.contact_id) {
  //     try {
  //       const contact = await contactRepository.findById(BigInt(profile.contact_id));
  //       if (contact) {
  //         // Merge profile and contact data
  //         return NextResponse.json({ ...profile, ...contact });
  //       }
  //     } catch (contactErr) {
  //       console.error('Error fetching contact for profile:', contactErr);
  //     }
  //   }

  //   // Fallback: if no profile or no contact_id in profile, try to find the "me" contact as before
  //   const user = await contactRepository.findMe();

  //   if (!user) {
  //     // If we have a profile but no contact, return the profile
  //     if (profile) {
  //       return NextResponse.json(profile);
  //     }
  //     return NextResponse.json(null, { status: 404 });
  //   }

  //   // If we have both profile and fallback user, merger them (prefer profile data)
  //   return NextResponse.json(profile ? { ...user, ...profile } : user);
  // } catch (error) {
  //   console.error('Unexpected error in profile API:', error);
  //   return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  // }
}
