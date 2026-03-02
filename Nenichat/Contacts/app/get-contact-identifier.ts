import { IContact } from "../domain/IContact";

export function getContactIdentifier(contact: IContact | string) {
    if (typeof contact === "string") {
        return contact
    }
    return contact.contact_name || contact.pushname || contact.phone_number || contact.lid
}