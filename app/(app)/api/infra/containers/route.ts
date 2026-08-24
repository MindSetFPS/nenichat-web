import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { containerService, SupabaseContainerRepository, fetchAndStoreQrCode } from '@/Nenichat/Containers';

/**
 * GET is not supported. Return a generic error.
 * 
 * @returns {Promise<NextResponse>} The response object.
 */
export async function GET() {
    return NextResponse.json(
        { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
        { status: 500 }
    );
}

/**
 * DELETE handler for the infra containers API.
 * Deletes a container from both Dokploy and Supabase.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to perform this action.' },
                { status: 401 }
            );
        }

        const businessId = request.nextUrl.searchParams.get('business_id');
        if (!businessId) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'business_id is required.' },
                { status: 400 }
            );
        }

        const supaRepo = new SupabaseContainerRepository(supabase);
        const container = await supaRepo.getContainerByBusinessId(Number(businessId));

        if (!container) {
            return NextResponse.json(
                { error: 'Not Found', message: 'No container found for this business.' },
                { status: 404 }
            );
        }

        // Delete from Dokploy first, ignore errors if compose is already gone
        if (container.container_id) {
            try {
                await containerService.deleteContainer(container.container_id);
            } catch (e) {
                console.warn('Dokploy deletion failed (may already be deleted):', e);
            }
        }

        // Reset the container record in Supabase (clears container_id, QR, status)
        await supaRepo.resetContainer(Number(businessId));

        return NextResponse.json({ success: true, message: 'Container reset successfully.' });
    } catch (error) {
        console.error('Unexpected error in DELETE API route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}

/**
 * POST handler for the infra containers API.
 * Checks for user authentication before proceeding.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const supaRepo = new SupabaseContainerRepository(supabase);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to perform this action.' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Perform container creation

        // steps
        // 1. Check if container already exists
        const existingContainer = await supaRepo.getContainerByBusinessId(body.business_id);
        let composeId = existingContainer?.container_id;

        if (!composeId) {
            // 2. create whatsapp container(business_id)
            composeId = await containerService.createContainer(body.business_id);
            await supaRepo.insertContainer(body.business_id, composeId);
            // Update state to 'created' after container is created
            await supaRepo.updateContainerState(body.business_id, 'created');
        }

        if (composeId) {
            // Helper to wait for a short duration
            const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // 2. set initial wapp container(compose_id, business_id, port, source_type="raw")
            const initialWappContainer = await containerService.updateContainerConfiguration(composeId, body.business_id);
            // wait a few seconds for container initialization
            // 3. deploy whatsapp container(compose_id)
            const deployedWappContainer = await containerService.deployContainer(composeId);
            // Update state to 'deployed' after deployment
            await supaRepo.updateContainerState(body.business_id, 'deployed');
            await wait(6000);
            // 4. Update container info in Supabase
            await supaRepo.updateContainerInfo(body.business_id, composeId);

            // Start the polling in background so we don't timeout the request.
            (async () => {
                await fetchAndStoreQrCode(supabase, supaRepo, body.business_id);
            })();

            return NextResponse.json({
                success: true,
                message: 'Action performed successfully',
                processedBy: user.id
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Action failed',
                processedBy: user.id
            });
        }


    } catch (error) {
        console.error('Unexpected error in POST API route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
