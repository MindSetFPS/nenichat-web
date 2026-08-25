import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Wapp, WappApiError } from '@/Nenichat/Wapp';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to perform this action.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'businessId is required.' },
                { status: 400 }
            );
        }

        const wapp = new Wapp();
        const devices = await wapp.getAppDevices(businessId);

        if (devices.length > 0) {
            // At least one linked phone means the WhatsApp session is live.
            const { error } = await supabase.from('whatsapp-containers')
                .update({ status: 'connected' })
                .eq('business_id', parseInt(businessId));
            if (error) {
                console.error(error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
                    { status: 500 }
                );
            }
            return NextResponse.json(
                { success: true, devices },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                code: "SUCCESS",
                message: "Fetch device success",
                results: null
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof WappApiError) {
            console.error('Failed to get devices:', error.message);
            return NextResponse.json(
                { error: 'External API Error', message: `Failed to get devices: ${error.message}` },
                { status: error.status }
            );
        }
        console.error('Error in whatsapp devices API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
