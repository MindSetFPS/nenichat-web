import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { containerService, containerRepository } from '@/Nenichat/Containers';

/**
 * GET handler for the infra containers API.
 * Checks for user authentication before proceeding.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize Supabase client
        const supabase = await createServerSupabaseClient();

        // Check for user authentication
        // getUser() is more secure than getSession() as it validates the user with the Supabase API
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to access this resource.' },
                { status: 401 }
            );
        }

        // Proceed with the logic for authenticated users
        // For example, fetching data from the database
        // const { data, error } = await supabase.from('your_table').select('*').eq('user_id', user.id);

        return NextResponse.json({
            message: 'Authentication successful',
            userId: user.id,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Unexpected error in API route:', error);
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
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to perform this action.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log(body);

        // Perform container creation

        // steps
        // 1. create whatsapp container(business_id)
        const composeId = await containerService.createContainer(body.business_id);
        console.log(composeId);
        if (composeId) {
            // 2. set initial wapp container(compose_id, business_id, port, source_type="raw")
            const initialWappContainer = await containerService.updateContainerConfiguration(composeId, body.business_id, 6666);
            console.log(initialWappContainer);
            // 3. deploy whatsapp container(compose_id)
            const deployedWappContainer = await containerService.deployContainer(composeId);
            console.log(deployedWappContainer);
            // 4. if compose_id is not None and port is not None:
            // 5. set wapp container id(business_id, compose_id, port)
            const wappContainerId = await containerRepository.updateContainerInfo(body.business_id, composeId, body.port);
            console.log(wappContainerId);

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
