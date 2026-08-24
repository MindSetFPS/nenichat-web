import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContainerRepository, fetchAndStoreQrCode } from '@/Nenichat/Containers';

/*
Regenerates the QR Code in case a user interrupted the process,
or if the QR code expired. This will trigger the same process as the initial QR code generation, but without creating a new container.
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
        const { business_id } = body;

        if (!business_id) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'business_id is required.' },
                { status: 400 }
            );
        }

        // Check if container exists
        const existingContainer = await supaRepo.getContainerByBusinessId(business_id);
        if (!existingContainer) {
            return NextResponse.json(
                { error: 'Not Found', message: 'No container found for this business.' },
                { status: 404 }
            );
        }

        // QR Code Regeneration Process
        (async () => {
            await fetchAndStoreQrCode(supabase, supaRepo, business_id);
        })();

        return NextResponse.json({
            success: true,
            message: 'QR code regeneration initiated successfully',
            processedBy: user.id
        });

    } catch (error) {
        console.error('Unexpected error in QR regeneration API route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}