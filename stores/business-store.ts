import { create } from 'zustand';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export interface Business {
    id: number;
    name: string;
    email: string;
    business_logo_url?: string | null;
    owner_id: string;
    created_at?: string;
    updated_at?: string;
}

interface BusinessState {
    business: Business | null;
    isLoading: boolean;
    error: string | null;

    fetchBusiness: (force?: boolean) => Promise<void>;
    setBusiness: (business: Business | null) => void;
    updateBusiness: (updates: Partial<Business>) => void;
    clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
    business: null,
    isLoading: false,
    error: null,

    fetchBusiness: async (force = false) => {
        const { business, isLoading } = get();

        if (isLoading || (!force && business)) {
            return;
        }

        set({ isLoading: true, error: null });
        const supabase = createBrowserSupabaseClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                set({ business: null, isLoading: false });
                return;
            }

            const { data: businesses, error } = await supabase
                .from('business')
                .select('*')
                .eq('owner_id', user.id)
                .limit(1);

            if (error) {
                throw error;
            }

            const businessData = businesses && businesses.length > 0 ? businesses[0] : null;
            set({ business: businessData, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch business in store:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch business',
                isLoading: false
            });
        }
    },

    setBusiness: (business) => set({ business }),

    updateBusiness: (updates) => set((state) => ({
        business: state.business ? { ...state.business, ...updates } : null
    })),

    clearBusiness: () => set({ business: null, error: null }),
}));
