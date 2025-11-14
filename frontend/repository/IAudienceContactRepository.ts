import { IContact } from './IContact';

export interface IAudienceContactRepository {
  findByAudienceId(audienceId: BigInt): Promise<IContact[]>;
  addContactToAudience(audienceId: string, contactId: string): Promise<void>;
  removeContactFromAudience(audienceId: string, contactId: string): Promise<void>;
  updateAudienceMembers(audienceId: string, contactIds: string[]): Promise<void>;
}
