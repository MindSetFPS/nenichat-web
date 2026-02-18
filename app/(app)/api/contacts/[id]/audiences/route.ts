import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import { SupabaseAudienceContactRepository } from "@/Nenichat/Audiences/infra/persistance/SupabaseAudienceContactRepository";
import { IAudienceUpdate } from "@/Nenichat/Audiences/dto/IAudienceUpdate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const audienceContactRepository = new SupabaseAudienceContactRepository(supabase);

    try {
        const contactAudiences = await audienceContactRepository.findByContactId(business.id, Number(id));
        return NextResponse.json(contactAudiences);
    } catch (error: any) {
        console.error("Error fetching contact audiences:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const audienceContactRepository = new SupabaseAudienceContactRepository(supabase);
    const { audienceUpdates } = await request.json() as { audienceUpdates: IAudienceUpdate[] };

    try {
        for (const audienceUpdate of audienceUpdates) {
            if (audienceUpdate.action === "add") {
                await audienceContactRepository.addContactToAudience(
                    business.id,
                    Number(audienceUpdate.audience_id),
                    Number(id)
                );
            } else if (audienceUpdate.action === "remove") {
                await audienceContactRepository.removeContactFromAudience(
                    business.id,
                    Number(audienceUpdate.audience_id),
                    Number(id)
                );
            }
        }
        return NextResponse.json({ message: "Audiences updated successfully" });
    } catch (error: any) {
        console.error("Error updating contact audiences:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
