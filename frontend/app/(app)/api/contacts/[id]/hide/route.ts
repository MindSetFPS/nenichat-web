import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const contact = await contactRepository.findById(BigInt(id));
        if (!contact) {
            return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
        }
        await contactRepository.hideContact(BigInt(id));
        return NextResponse.json({ message: 'Contact hidden successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error hiding contact:', error);
        return NextResponse.json({ message: 'Error hiding contact' }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const contact = await contactRepository.isContactHidden(BigInt(id));

    if (contact) {
        return NextResponse.json({ message: 'Contact is hidden' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Contact is not hidden' }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const contact = await contactRepository.findById(BigInt(id));
        if (!contact) {
            return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
        }
        await contactRepository.unhideContact(BigInt(id));
        return NextResponse.json({ message: 'Contact unhidden successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error unhiding contact:', error);
        return NextResponse.json({ message: 'Error unhiding contact' }, { status: 500 });
    }
}
