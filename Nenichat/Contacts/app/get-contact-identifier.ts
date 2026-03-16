import { IContact } from "../domain/IContact";

export function getContactIdentifier(contact: IContact | string) {
    if (typeof contact === "string") {
        return contact
    }
    return contact.contact_name || contact.pushname || contact.phone_number || contact.lid
}

export function getContactDisplayName(contact: IContact | undefined | null): string {
    if (!contact) return ""
    return contact.pushname ?? contact.contact_name ?? contact.phone_number ?? contact.lid ?? "Sin nombre"
}

export function getContactPhone(contact: IContact | undefined | null): string {
    if (!contact) return ""
    return contact.phone_number ?? contact.lid ?? ""
}