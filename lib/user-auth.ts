import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Retrieves the business associated with the currently authenticated user.
 * @param supabase The Supabase client instance.
 * @returns The business object if found, otherwise throws an error or returns null.
 */
export async function getBusinessFromUser(supabase: SupabaseClient) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, business: null, error: 'Unauthorized' };
    }

    const { data: business, error } = await supabase
        .from('business')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching business:', error);
        return { user, business: null, error: 'Business not found' };
    }

    return { user, business, error: null };
}
