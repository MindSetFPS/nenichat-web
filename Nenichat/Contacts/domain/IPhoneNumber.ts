/**
 * Represents a globally unique phone number entry.
 * Phone numbers are independent of any business, allowing the same
 * phone number to be associated with multiple businesses via the
 * `contacts` table.
 */
export interface IPhoneNumber {
    id: number;
    phone_number: string;
    created_at: Date;
}
