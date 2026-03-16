import { IContact } from "../domain/IContact";

export type ContactIdentifier = string | number | IContact | undefined | null

export function findContactById(contacts: IContact[], id: string | number): IContact | undefined {
    return contacts.find(c => c.id?.toString() === id?.toString())
}

export function findContactByLid(contacts: IContact[], lid: string): IContact | undefined {
    return contacts.find(c => c.lid === lid)
}

export function findContactByPhone(contacts: IContact[], phone: string): IContact | undefined {
    return contacts.find(c => c.phone_number === phone)
}

export function normalizeContact(contacts: IContact[], value: ContactIdentifier): IContact | undefined {
    if (!value) return undefined
    if (typeof value === 'object') return value as IContact
    
    const strValue = String(value)
    
    return (
        findContactById(contacts, strValue) ||
        findContactByLid(contacts, strValue) ||
        findContactByPhone(contacts, strValue) ||
        undefined
    )
}
