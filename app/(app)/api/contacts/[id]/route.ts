import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { getBusinessFromUser } from '@/lib/user-auth';
import { IContact } from "@/Nenichat/Contacts/domain/IContact";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);

    try {
        const { id } = await params;
        const body: Partial<IContact> = await request.json();

        const contact = await contactRepository.findById(business.id, Number(id))
        if (!contact) {
            return NextResponse.json({ message: "Contact not found" }, { status: 404 });
        }

        contact.contact_name = body.contact_name || contact.contact_name;
        // Add other fields as necessary

        const contactUpdated = await contactRepository.save(contact);

        return NextResponse.json(contactUpdated)
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);

    try {
        const { id } = await params;
        const contact = await contactRepository.findById(business.id, Number(id));
        if (!contact) {
            return NextResponse.json({ message: "Contact not found" }, { status: 404 });
        }
        return NextResponse.json(contact);
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
