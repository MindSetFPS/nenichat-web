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

  /**
   * Finds contacts that are candidates for merging.
   * A contact is a candidate if either its phone_number or lid is null.
   * @returns A promise that resolves to an array of incomplete contacts.
   */
  findMergeCandidates(): Promise<IContact[]>;

  /**
   * Merges multiple secondary contacts into a primary contact.
   * All related records (chats, messages, audience_contacts, recipients) will be
   * re-assigned to the primary contact. Secondary contacts will be deleted.
   * @param primaryContactId The ID of the contact to merge into.
   * @param secondaryContactIds An array of IDs of contacts to be merged and then deleted.
   * @returns A promise that resolves when the merge operation is complete.
   */
  mergeContacts(primaryContactId: bigint, secondaryContactIds: bigint[]): Promise<void>;

  /**
   * Sets the contact property "is_user" as true, meaning this contact represents the user themselves.
   */
  setMe(): Promise<void>;
}
