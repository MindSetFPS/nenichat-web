/**
 * Next.js API route handler for GET requests.
 * The list of audiences a contact is assigned to.
 * It filters the table audience_contacts by contact_id
 */

import { NextResponse } from "next/server";
import { audienceContactRepository } from "@/Nenichat/Audiences/infra/persistance/AudienceContactRepository";
import { IAudienceUpdate } from "@/Nenichat/Audiences/dto/IAudienceUpdate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const contactAudiences = await audienceContactRepository.findByContactId(BigInt(id));
    return NextResponse.json(contactAudiences);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { audienceUpdates } = await request.json() as { audienceUpdates: IAudienceUpdate[] };

    audienceUpdates.forEach((audienceUpdate) => {

        console.log(audienceUpdate);

        if (audienceUpdate.action == "add") {
            audienceContactRepository.addContactToAudiences(id, [audienceUpdate.audience_id]);
        }

        if (audienceUpdate.action == "remove") {
            audienceContactRepository.removeContactFromAudience(audienceUpdate.audience_id, id);
        }
    })

    return NextResponse.json({ message: "Audiences added successfully" });
}
