import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import SendMessage from '@/Nenichat/Messages/app/send-message';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { business, error: authError } = await getBusinessFromUser(supabase);

        if (authError || !business) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { phone, message } = await request.json();

        if (!phone || !message) {
            return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
        }

        const sent = await SendMessage(phone, message, business.id);

        return NextResponse.json({ success: true, message: sent });
    } catch (error) {
        console.error('Error sending message:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to send message', details: message }, { status: 500 });
    }
}
