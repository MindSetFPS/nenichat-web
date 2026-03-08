import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

        const envUser = process.env.WAPP_USER;
        const envPassword = process.env.WAPP_PASSWORD;

        let userstring = envUser;
        let password = envPassword;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (userstring && password) {
            headers['Authorization'] = `Basic ${btoa(`${userstring}:${password}`)}`;
        }

        const response = await fetch(`${wappApiUrl}/api/user/${businessId}/app/devices`, {
            headers,
        });

        if (response.ok) {
            const data = await response.json();
            const devices = data.results || [];
            if (devices.length > 0) {
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
            } else {
                return NextResponse.json(
                    {
                        code: "SUCCESS",
                        message: "Fetch device success",
                        results: null
                    },
                    { status: 200 }
                );
            }
        } else {
            const errorText = await response.text();
            const message = `Failed to get devices: ${response.status}: ${errorText}`;
            console.error(message);
            return NextResponse.json(
                { error: 'External API Error', message },
                { status: response.status }
            );
        }
    } catch (error) {
        console.error('Error in whatsapp devices API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
