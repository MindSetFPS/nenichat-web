import { createServerSupabaseClient } from './supabase/server';
import { redirect } from 'next/navigation';

/**
 * Gets the current authenticated user from the server
 * Returns null if not authenticated
 */
export async function getUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Requires authentication, redirects to login if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth() {
    const user = await getUser();
    if (!user) {
        redirect('/login');
    }
    return user;
}
