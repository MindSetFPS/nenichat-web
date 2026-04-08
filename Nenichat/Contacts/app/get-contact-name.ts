import { IContact } from "../domain/IContact";
import { IChat } from "@/Nenichat/Chats/domain/IChat";

/**
 * Gets the most appropriate name or identifier for a contact or chat.
 * 
 * Logic priority:
 * 1. Contact's manual name (contact_name)
 * 2. Chat's name (useful for groups or unknown contacts)
 * 3. Contact's pushname (WhatsApp display name)
 * 4. Contact's phone number
 * 5. Contact's LID
 * 6. Fallback to string if input is just an identifier string
 * 
 * @param contact - The contact object or a string identifier
 * @param chat - The chat object (optional)
 * @returns {string} The resolved name or identifier
 */
export function getContactName(contact?: IContact | string | null, chat?: IChat | null): string {
    if (typeof contact === "string") {
        return contact;
    }

    if (contact?.contact_name) {
        return contact.contact_name;
    }

    if (chat?.name) {
        return chat.name;
    }

    if (contact) {
        return contact.pushname || contact.phone_number || contact.lid || "";
    }

    return "";
}

/**
 * Gets a display name for a contact.
 * Priority: pushname > contact_name > phone_number > lid > "Sin nombre"
 */
export function getContactDisplayName(contact: IContact | undefined | null): string {
    if (!contact) return "";
    return contact.pushname ?? contact.contact_name ?? contact.phone_number ?? contact.lid ?? "Sin nombre";
}

/**
 * Gets the phone number or LID for a contact.
 */
export function getContactPhone(contact: IContact | undefined | null): string {
    if (!contact) return "";
    return contact.phone_number ?? contact.lid ?? "";
}
