import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';

/**
 * Interface representing the merged profile and contact data.
 * This structure follows what is returned by the /api/profile endpoint.
 */
export interface UserProfile extends Omit<IContact, 'id'> {
    id: string;
    contact_id?: string | null;
    [key: string]: any; // To allow for other profile fields
}

interface UserState {
    user: UserProfile | null;
    supabaseUser: User | null;
    isLoading: boolean;
    error: string | null;

    /**
     * Initializes the store by fetching the user data.
     * Prevents multiple concurrent fetches and only refetches if forced or error occurred.
     */
    fetchUser: (force?: boolean) => Promise<void>;

    /**
     * Clears the user store data.
     */
    clearUser: () => void;

    /**
     * Updates the user data in the store localy.
     */
    setUser: (user: UserProfile | null) => void;
}

/**
 * useUserStore
 * 
 * A hook to access and manage global user state, including Supabase Auth user
 * and the application-specific profile/contact data.
 * 
 * @example
 * ```tsx
 * // Using the store in a component
 * const { user, supabaseUser, isLoading, fetchUser } = useUserStore();
 * 
 * useEffect(() => {
 *   fetchUser();
 * }, [fetchUser]);
 * 
 * if (isLoading) return <Skeleton />;
 * if (!user) return <ProfileNotFound />;
 * ```
 */
export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    supabaseUser: null,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),

    clearUser: () => set({ user: null, supabaseUser: null, error: null }),

    fetchUser: async (force = false) => {
        const { user, supabaseUser, isLoading } = get();

        // Don't fetch if already loading, or if we already have data (unless forced)
        if (isLoading || (!force && user && supabaseUser)) {
            return;
        }

        set({ isLoading: true, error: null });
        const supabase = createBrowserSupabaseClient();

        try {
            const [profileRes, authRes] = await Promise.all([
                fetch('/api/profile'),
                supabase.auth.getUser()
            ]);

            let profileData: UserProfile | null = null;
            if (profileRes.ok) {
                profileData = await profileRes.json();
            }

            set({
                user: profileData,
                supabaseUser: authRes.data.user,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Failed to fetch user in store:', error);
            set({
                error: error.message || 'Failed to fetch user',
                isLoading: false
            });
        }
    },
}));
