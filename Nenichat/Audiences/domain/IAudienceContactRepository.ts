import { IContact } from '../../Contacts/domain/IContact';

export interface IAudienceContactRepository {
  findByAudienceId(audienceId: BigInt): Promise<IContact[]>;
  findAvailableContacts(audienceId: number | BigInt): Promise<IContact[]>;
  addContactToAudience(audienceId: string, contactId: string): Promise<void>;
  removeContactFromAudience(audienceId: string, contactId: string): Promise<void>;
  // cascade delete? 
  delete(audienceId: string): Promise<void>;
  updateAudienceMembers(audienceId: string, contactIds: string[]): Promise<void>;
}
