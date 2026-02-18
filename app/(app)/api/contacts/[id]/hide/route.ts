import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { getBusinessFromUser } from '@/lib/user-auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);
    const { id } = await params;

    try {
        const contactId = Number(id);
        const contact = await contactRepository.findById(business.id, contactId);
        if (!contact) {
            return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
        }
        await contactRepository.hideContact(business.id, contactId);
        return NextResponse.json({ message: 'Contact hidden successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error hiding contact:', error);
        return NextResponse.json({ message: 'Error hiding contact' }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);
    const { id } = await params;
    const isHidden = await contactRepository.isContactHidden(business.id, Number(id));

    if (isHidden) {
        return NextResponse.json({ message: 'Contact is hidden' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Contact is not hidden' }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);
    const { id } = await params;
    try {
        const contactId = Number(id);
        const contact = await contactRepository.findById(business.id, contactId);
        if (!contact) {
            return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
        }
        await contactRepository.unhideContact(business.id, contactId);
        return NextResponse.json({ message: 'Contact unhidden successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error unhiding contact:', error);
        return NextResponse.json({ message: 'Error unhiding contact' }, { status: 500 });
    }
}
