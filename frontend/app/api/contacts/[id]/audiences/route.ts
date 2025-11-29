/**
 * Next.js API route handler for GET requests.
 * The list of audiences a contact is assigned to.
 * It filters the table audience_contacts by contact_id
 */

import { NextResponse } from "next/server";
import { audienceContactRepository } from "@/Nenichat/Audiences/infra/persistance/AudienceContactRepository";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const contactAudiences = await audienceContactRepository.findByContactId(BigInt(id));
    return NextResponse.json(contactAudiences);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { audiencesIds } = await request.json();
    await audienceContactRepository.addContactToAudiences(audiencesIds, id);
    return NextResponse.json({ message: "Audiences added successfully" });
}
