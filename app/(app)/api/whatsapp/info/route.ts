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

        const wappApiUrl = process.env.NEXT_PUBLIC_WAPP_API_URL || 'http://192.168.1.64';
        const wapp = new Wapp({ baseUrl: wappApiUrl });
        const info = await wapp.getAppInfo(businessId);

        return NextResponse.json(info);
    } catch (error) {
        if (error instanceof WappApiError) {
            console.error('Failed to get app info:', error.message);
            return NextResponse.json(
                { error: 'External API Error', message: `Failed to get app info: ${error.message}` },
                { status: error.status }
            );
        }
        console.error('Error in whatsapp app info API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
