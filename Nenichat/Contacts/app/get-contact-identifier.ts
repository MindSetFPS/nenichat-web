import { IContact } from "../domain/IContact";

export function getContactIdentifier(contact: IContact) {
    return contact.contact_name || contact.pushname || contact.phone_number || contact.lid
}