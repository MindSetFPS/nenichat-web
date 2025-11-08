import { IContact } from './IContact';

export interface IContactRepository {
  findByPhoneNumber(phoneNumber: string): Promise<IContact | null>;
  findById(id: bigint): Promise<IContact | null>;
  saveContact(contact: IContact): Promise<IContact>;
  saveContact(phoneNumber: string, pushname: string | null): Promise<IContact>;
}
