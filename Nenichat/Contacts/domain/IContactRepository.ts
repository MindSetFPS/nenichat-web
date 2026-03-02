import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { Message } from '@/Nenichat/Messages/domain/Message';
import IContactWithLastMessage from '../app/dtos/IContactWithLastMessage';

export interface IContactRepository {
  findById(businessId: number, id: number): Promise<IContact | null>;
  findByPhoneNumber(businessId: number, phoneNumber: string): Promise<IContact | null>;
  findByLid(businessId: number, lid: string): Promise<IContact | null>;
  findMe(businessId: number): Promise<IContact | null>;

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
   * Saves a batch of contacts (creates or updates).
   *
   * - Contacts with 'phone_number' are upserted based on 'phone_number'.
   * - Contacts with 'lid' (and no 'phone_number') are upserted based on 'lid'.
   *
   * @param contacts An array of partial IContact objects to save.
   */
  saveBatch(contacts: Partial<IContact>[]): Promise<void>;

  /**
   * Retrieves a paginated list of contacts.
   * @param businessId The ID of the business.
   * @param offset The number of contacts to skip.
   * @param limit The maximum number of contacts to return.
   * @returns A promise that resolves to an array of contacts.
   */
  list(businessId: number, offset: number, limit: number): Promise<IContact[]>;

  /**
   * Finds contacts that are candidates for merging.
   * A contact is a candidate if either its phone_number or lid is null.
   * @param businessId The ID of the business.
   * @param offset The number of contacts to skip.
   * @param limit The maximum number of contacts to return.
   * @returns A promise that resolves to an object containing the contacts and the total count.
   */
  findMergeCandidates(businessId: number, offset: number, limit: number): Promise<{ contacts: IContact[]; total: number }>;

  /**
   * Merges multiple secondary contacts into a primary contact.
   * All related records (chats, messages, audience_contacts, recipients) will be
   * re-assigned to the primary contact. Secondary contacts will be deleted.
   * @param primaryContactId The ID of the contact to merge into.
   * @param secondaryContactIds An array of IDs of contacts to be merged and then deleted.
   * @returns A promise that resolves when the merge operation is complete.
   */
  mergeContacts(businessId: number, primaryContactId: number, secondaryContactIds: number[]): Promise<void>;

  /**
   * Retrieves an existing contact by LID or phone number, or creates a new one if not found.
   * @param businessId The ID of the business.
   * @param contactId The LID or phone number of the contact.
   * @returns A promise that resolves to the found or newly created contact.
   */
  getOrCreateContact(businessId: number, contactId: string): Promise<IContact>;

  /**
   * Sets the contact property "is_user" as true for the given userId, meaning this contact represents the user themselves.
   * All other contacts will have their "is_user" property set to false.
   * @param userId The ID of the contact to set as the user.
   */
  setMe(businessId: number, userId: number): Promise<IContact>;
  /**
   * Retrieves the most recent contacts who have sent messages.
   * @param businessId The ID of the business.
   * @param limit The maximum number of contacts to return.
   * @returns A promise that resolves to an array of contacts ordered by their latest message.
   */
  findRecentContacts(businessId: number, limit: number): Promise<IContact[]>;

  /**
   * Retrieves a list of contacts with their last message.
   * @param businessId The ID of the business.
   * @param offset The number of contacts to skip.
   * @param limit The maximum number of contacts to return.
   * @returns A promise that resolves to an array of contacts with their last message.
   */
  getContactsWithLastMessage(businessId: number, offset: number, limit: number): Promise<IContactWithLastMessage[]>;


  /**
   * updates a row in hidden_contacts table
   * @param contactIdToHide The ID of the contact to hide.
   */
  hideContact(businessId: number, contactIdToHide: number): Promise<void>;

  /**
   * Retrieves a list of hidden contacts.
   * @param businessId The ID of the business.
   * @param offset The number of contacts to skip.
   * @param limit The maximum number of contacts to return.
   * @returns A promise that resolves to an array of hidden contacts.
   */
  getHiddenContacts(businessId: number, offset: number, limit: number): Promise<IContact[]>;

  /**
   * Retrieves a hidden contact by ID.
   * @param contactId The ID of the contact to retrieve.
   * @returns A promise that resolves to the hidden contact.
   */
  isContactHidden(businessId: number, contactId: number): Promise<boolean>;

  /**
   * unhide a contact
   * @param contactId The ID of the contact to unhide.
   */
  unhideContact(businessId: number, contactId: number): Promise<void>;
  count(businessId: number): Promise<number>;
  search(businessId: number, query: string, limit: number): Promise<IContact[]>;
}
