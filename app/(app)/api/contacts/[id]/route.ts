import { NextRequest } from "next/server";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body: Partial<IContact> = await request.json();

        const contact = await contactRepository.findById(BigInt(id))
        contact!.contact_name = body!.contact_name!

        const contactUpdated = await contactRepository.save(contact!);

        return NextResponse.json(contactUpdated)
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const contact = await contactRepository.findById(BigInt(id));
        return NextResponse.json(contact);
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
