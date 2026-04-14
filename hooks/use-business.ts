/**
 * useBusiness Hook
 * 
 * Access business data from BusinessProvider context.
 * 
 * TO USE:
 * const business = useBusiness();
 * const wappUrl = business?.wapp_url;
 */

'use client';

import { useBusiness as useBusinessContext } from '@/components/providers/business-context';
import { Business } from '@/stores/business-store';

export function useBusiness(): Business | null {
    return useBusinessContext();
}