/**
 * Chat API Route
 * 
 * Provides a cached endpoint for fetching WhatsApp chats.
 * 
 * PROTECTION:
 * - Requires valid Supabase session token
 * - Validates that user belongs to the requested business
 * - Uses server-side Supabase client for auth verification
 * 
 * CACHING STRATEGY:
 * - Server-side in-memory cache stores chat data per businessId
 * - TTL is 5 minutes (300000ms)
 * - Cache is checked before fetching from WhatsApp API
 * - If cache hit, returns cached data (fast)
 * - If cache miss, fetches from WhatsApp API, stores in cache, returns data
 * 
 * CACHE INVALIDATION:
 * - Cache expires after 5 minutes (TTL_MS)
 * - On server restart, cache is cleared
 * - For manual invalidation, call DELETE endpoint or implement webhook handler
 * 
 * REQUEST FORMAT:
 * GET /api/chats?businessId=123&wappUrl=http://192.168.1.64/api/user/123
 * 
 * RESPONSE FORMAT:
 * JSON array of IChat objects
 * 
 * TO EDIT:
 * - Change TTL_MS to adjust cache duration
 * - Modify cache key (currently businessId) for different caching strategies
 * - Add webhook handler in DELETE method to clear cache on new messages
 */

import { NextResponse } from 'next/server';
import { GoWappChatRepository } from '@/Nenichat/Chats/infra/api/GoWappChatRepository';
import { IChat } from '@/Nenichat/Chats/domain/IChat';
import { SupabaseContainerRepository } from '@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository';
import { checkWappHealth } from '@/Nenichat/Wapp';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';

interface CacheEntry {
    data: IChat[];
    timestamp: number;
}

/**
 * In-memory cache for WhatsApp chats
 * Key: businessId
 * Value: { data: IChat[], timestamp: number }
 * 
 * NOTE: This cache is server-side only and resets on server restart.
 * For production with multiple instances, consider using Redis for persistent caching.
 */
const chatCache = new Map<string, CacheEntry>();

/**
 * Time-to-live for cache entries in milliseconds
 * Default: 5 minutes (300000ms)
 * 
 * TO CHANGE: Modify this value
 * - 60000 = 1 minute
 * - 300000 = 5 minutes  
 * - 600000 = 10 minutes
 */
const TTL_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
    let businessId: string | null = null;
    let wappUrl: string | null = null;
    let supabase;

    try {
        // PROTECTION: Verify user is authenticated
        supabase = await createServerSupabaseClient();
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized - no valid session' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        businessId = searchParams.get('businessId');
        wappUrl = searchParams.get('wappUrl');

        if (!businessId || !wappUrl) {
            return NextResponse.json(
                { error: 'Missing businessId or wappUrl' },
                { status: 400 }
            );
        }

        // PROTECTION: Verify user belongs to this business
        const { business, error: businessError } = await getBusinessFromUser(supabase);

        if (businessError || !business) {
            return NextResponse.json(
                { error: 'Forbidden - user does not have access to this business' },
                { status: 403 }
            );
        }

        // Double-check: ensure requested businessId matches user's business
        if (business.id.toString() !== businessId) {
            return NextResponse.json(
                { error: 'Forbidden - cannot access other businesses data' },
                { status: 403 }
            );
        }

        const cacheKey = businessId;
        const cached = chatCache.get(cacheKey);

        // Return cached data if valid (within TTL)
        if (cached && Date.now() - cached.timestamp < TTL_MS) {
            return NextResponse.json(cached.data);
        }

        // Fetch from WhatsApp API (cache miss)
        const wappChatRepository = new GoWappChatRepository(wappUrl, 'admin', 'admin', businessId);
        const chats = await wappChatRepository.list(0, 100);

        // Store in cache for future requests
        chatCache.set(cacheKey, {
            data: chats,
            timestamp: Date.now()
        });

        return NextResponse.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);

        try {
            if (wappUrl && businessId && supabase) {
                const isAlive = await checkWappHealth(wappUrl);
                const repo = new SupabaseContainerRepository(supabase);

                if (!isAlive) {
                    await repo.updateContainerState(Number(businessId), 'unreachable');
                    return NextResponse.json(
                        { error: 'container_unreachable' },
                        { status: 503 }
                    );
                }
            }
        } catch (dbError) {
            console.error('Error updating container status:', dbError);
        }

        return NextResponse.json(
            { error: 'Failed to fetch chats' },
            { status: 500 }
        );
    }
}

/**
 * DELETE endpoint to manually clear cache
 * 
 * USAGE:
 * Call from client or webhook to force cache refresh
 * DELETE /api/chats?businessId=123
 * 
 * TO USE FOR NEW MESSAGE INVALIDATION:
 * 1. Set up WhatsApp webhook to receive new message events
 * 2. When webhook receives new message, call this DELETE endpoint
 * 3. Next fetch will get fresh data from WhatsApp API
 */
export async function DELETE(request: Request) {
    try {
        // PROTECTION: Verify user is authenticated
        const supabase = await createServerSupabaseClient();
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized - no valid session' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json(
                { error: 'Missing businessId' },
                { status: 400 }
            );
        }

        // PROTECTION: Verify user belongs to this business
        const { business, error: businessError } = await getBusinessFromUser(supabase);

        if (businessError || !business) {
            return NextResponse.json(
                { error: 'Forbidden - user does not have access to this business' },
                { status: 403 }
            );
        }

        // Double-check: ensure requested businessId matches user's business
        if (business.id.toString() !== businessId) {
            return NextResponse.json(
                { error: 'Forbidden - cannot access other businesses data' },
                { status: 403 }
            );
        }

        chatCache.delete(businessId);
        return NextResponse.json({ success: true, message: 'Cache cleared for business' });
    } catch (error) {
        console.error('Error clearing chat cache:', error);
        return NextResponse.json(
            { error: 'Failed to clear cache' },
            { status: 500 }
        );
    }
}

