import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { getBusinessFromUser } from '@/lib/user-auth';
import { IContact } from "@/Nenichat/Contacts/domain/IContact";

/**
 * Syncs contacts from the WhatsApp API
 * Note: this probably no longer works. initiallyh loaded contacts fron the only
 * one instance of gowapp that we had, now that we implemented multi gowapp instance for 
 * each customer, must be refactored to take that in consideration
 */
export async function GET() {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);

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
                    business_id: business.id,
                    contact_name: name || undefined,
                    pushname: name || undefined,
                    is_user: false
                };

                if (isLid) {
                    newContactData.lid = jid;
                } else {
                    newContactData.phone_number = jid.split('@')[0];
                }

                contactsToSave.push(newContactData);
            }

            if (contactsToSave.length > 0) {
                try {
                    await contactRepository.saveBatch(contactsToSave);
                    console.log(`Successfully synced ${contactsToSave.length} contacts for business ${business.id}.`);
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
