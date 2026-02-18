import { IContact } from '../../Contacts/domain/IContact';
import { IAudience } from './IAudience';

export interface IAudienceContactRepository {
  findByAudienceId(businessId: number, audienceId: number): Promise<IContact[]>;
  findByContactId(businessId: number, contactId: number): Promise<IAudience[]>;
  findAvailableContacts(businessId: number, audienceId: number): Promise<IContact[]>;
  addContactToAudience(businessId: number, audienceId: number, contactId: number): Promise<void>;
  removeContactFromAudience(businessId: number, audienceId: number, contactId: number): Promise<void>;
  delete(businessId: number, audienceId: number): Promise<void>;
  updateAudienceMembers(businessId: number, audienceId: number, contactIds: number[]): Promise<void>;
}
