import { create } from 'zustand';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { container_states } from '@/Nenichat/Containers/Domain/container-states';
import { getWappInfo, type WappAppInfo } from '@/lib/wapp/wapp-api';
import { getMyContactAction } from '@/app/(app)/settings/actions';

/**
 * Cache for the WhatsApp settings screen.
 * Data is fetched once per session (per business) so re-entering settings
 * doesn't re-query Supabase, the gateway, and the user's contact.
 */

/**
 * A `whatsapp-containers` Supabase row, as far as the settings screen needs it.
 * - `business_id`: the business that owns the container.
 * - `status`: state of the container deployed through Dokploy.
 * - `qr_code_url`: QR code returned by the wapp container, used to link a phone.
 * - `qr_code_updated_at`: when that QR was generated (drives expiry in the UI).
 */
export interface ContainerRow {
    business_id: number;
    status: container_states;
    qr_code_url: string | null;
    qr_code_updated_at: string | null;
}

export interface WappMe {
    phone_number: string | null;
    is_user: boolean;
}

// Once the container reaches one of these states it's stable enough to reuse.
// Pre-connection states are always refetched so an in-progress QR setup stays fresh.
const SETTLED_STATES: container_states[] = ['connected', 'error', 'stopped', 'unreachable'];

interface WappState {
    container: ContainerRow | null;
    containerBusinessId: number | null;
    isContainerLoaded: boolean;
    info: WappAppInfo | null;
    infoBusinessId: number | null;
    isInfoLoaded: boolean;
    me: WappMe | null;
    isMeLoaded: boolean;

    fetchContainer: (businessId: number) => Promise<void>;
    fetchInfo: (businessId: number) => Promise<void>;
    fetchMe: () => Promise<void>;
    setMe: (me: WappMe) => void;
}

export const useWappStore = create<WappState>((set, get) => ({
    container: null,
    containerBusinessId: null,
    isContainerLoaded: false,
    info: null,
    infoBusinessId: null,
    isInfoLoaded: false,
    me: null,
    isMeLoaded: false,

    fetchContainer: async (businessId: number) => {
        const { container, containerBusinessId, isContainerLoaded } = get();

        if (
            isContainerLoaded &&
            containerBusinessId === businessId &&
            container &&
            SETTLED_STATES.includes(container.status)
        ) {
            return;
        }

        const supabase = createBrowserSupabaseClient();

        try {
            const { data: containers } = await supabase
                .from('whatsapp-containers')
                .select('*')
                .eq('business_id', businessId)
                .limit(1);

            set({
                container: containers && containers.length > 0 ? containers[0] : null,
                containerBusinessId: businessId,
                isContainerLoaded: true,
            });
        } catch (error) {
            console.error('Error fetching WhatsApp data:', error);
            set({ containerBusinessId: businessId, isContainerLoaded: true });
        }
    },

    fetchInfo: async (businessId: number) => {
        const { isInfoLoaded, infoBusinessId } = get();

        if (isInfoLoaded && infoBusinessId === businessId) {
            return;
        }

        const info = await getWappInfo(businessId);
        set({ info, infoBusinessId: businessId, isInfoLoaded: true });
    },

    fetchMe: async () => {
        if (get().isMeLoaded) {
            return;
        }

        const contact = await getMyContactAction();
        set({
            me: contact ? { phone_number: contact.phone_number, is_user: !!contact.is_user } : null,
            isMeLoaded: true,
        });
    },

    setMe: (me: WappMe) => set({ me, isMeLoaded: true }),
}));
