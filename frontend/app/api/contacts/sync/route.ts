import { NextResponse } from "next/server";

import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";

/**
 * Syncs contacts from the WhatsApp API
 */
export async function GET() {
    try {
        const wappUrl = process.env.WAPP_URL;

        if (!wappUrl) {
            console.error("WAPP_URL environment variable is not set");
            return NextResponse.json(
                { error: "WAPP_URL is not configured" },
                { status: 500 }
            );
        }

        const response = await fetch("http://" + wappUrl + "/user/my/contacts");

        if (!response.ok) {
            console.error("Failed to fetch from WAPP_URL:", response.status, response.statusText);
            return NextResponse.json(
                { error: "Failed to fetch from WhatsApp API" },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.results && Array.isArray(data.results.data)) {
            const contactsToSave: Partial<IContact>[] = [];

            for (const contact of data.results.data) {
                const { jid, name } = contact;
                if (!jid) continue;


                const isLid = jid.endsWith('@lid');
                const newContactData: Partial<IContact> = {
                    contact_name: name || undefined,
                    pushname: name || undefined,
                };

                newContactData.is_user = false;

                if (isLid) {
                    newContactData.lid = jid;
                } else {
                    // Remove domain from JID to get phone number if it's not a LID
                    newContactData.phone_number = jid.split('@')[0];
                }

                contactsToSave.push(newContactData);
            }

            if (contactsToSave.length > 0) {
                try {
                    await contactRepository.saveBatch(contactsToSave);
                    console.log(`Successfully synced ${contactsToSave.length} contacts.`);
                } catch (err) {
                    console.error("Failed to save batch contacts:", err);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Contacts synced successfully",
            data
        });
    } catch (error) {
        console.error("Error syncing contacts:", error);
        return NextResponse.json(
            { error: "Failed to sync contacts" },
            { status: 500 }
        );
    }
}
