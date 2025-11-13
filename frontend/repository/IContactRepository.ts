import { IContact } from './IContact';

export interface IContactRepository {
  findById(id: bigint): Promise<IContact | null>;
  findByPhoneNumber(phoneNumber: string): Promise<IContact | null>;
  findByLid(lid: string): Promise<IContact | null>;
  findMe(): Promise<IContact | null>;

  /**
   * Saves a contact (creates or updates).
   *
   * - If a contact with the given 'phone_number' or 'lid' exists, it's updated.
   * - Otherwise, a new contact is created.
   * - Requires 'phone_number' or 'lid' for finding the contact to update.
   *
   * @param contact A partial IContact object with the data to save.
   * @returns The saved contact, including any database-generated values.
   */
  save(contact: Partial<IContact>): Promise<IContact>;

  /**
   * Retrieves a paginated list of contacts.
   * @param offset The number of contacts to skip.
   * @param limit The maximum number of contacts to return.
   * @returns A promise that resolves to an array of contacts.
   */
  list(offset: number, limit: number): Promise<IContact[]>;
}
