/**
 * useInitializeChats Hook
 * 
 * Initializes chat data on app mount.
 * 
 * BEHAVIOR:
 * - Called once when ChatInitializer component mounts
 * - Triggers fetchChats from chat-store if not already loaded
 * - Prevents duplicate fetches via isLoaded/isLoading flags
 * - Passes business data from BusinessProvider to the store
 * 
 * TO EDIT:
 * - Add loading state handling in parent components
 * - Modify conditions for when to fetch
 * - Add error handling UI feedback
 * 
 * USAGE:
 * const { isLoading } = useInitializeChats();
 * if (isLoading) return <LoadingSpinner />;
 */

'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { useBusiness } from '@/hooks/useBusiness';

export function useInitializeChats() {
    const { fetchChats, isLoaded, isLoading } = useChatStore();
    const business = useBusiness();

    useEffect(() => {
        // Only fetch if not already loaded and not currently loading
        if (!isLoaded && !isLoading) {
            fetchChats(business);
        }
    }, [isLoaded, isLoading, fetchChats, business]);

    return { isLoading };
}