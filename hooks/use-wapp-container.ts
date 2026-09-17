/**
 * useWappContainer Hook
 *
 * Loads the business's `whatsapp-containers` row into the wapp store.
 *
 * BEHAVIOR:
 * - Fetches once on mount, per business (the store caches settled states)
 * - Pass `enabled: false` when the container is already available as a prop
 *
 * IMPORTANT:
 * - Every component that reads the container status must call this. Reading
 *   `container`/`isContainerLoaded` without it renders the store's initial
 *   empty state, which is indistinguishable from "not connected".
 */

'use client';

import { useEffect } from 'react';
import { useWappStore } from '@/stores/wapp-store';
import { useBusiness } from '@/hooks/use-business';

export function useWappContainer({ enabled = true }: { enabled?: boolean } = {}) {
    const { container, isContainerLoaded, fetchContainer } = useWappStore();
    const business = useBusiness();

    useEffect(() => {
        if (!enabled || !business?.id) {
            return;
        }

        fetchContainer(business.id);
    }, [enabled, business?.id, fetchContainer]);

    return { container, isContainerLoaded };
}
