import { IContact } from './IContact';

export class Contact implements IContact {
  id: number | null;
  business_id: number;

  /** FK to the global phone_numbers table. */
  phone_number_id: number | null;
  /**
   * Virtual field — resolved via JOIN with phone_numbers.
   * Not persisted directly in the contacts table.
   */
  phone_number: string | null;
  lid: string | null;

  contact_name: string | null;
  pushname: string | null;
  username: string | null;
  is_user: boolean;
  is_hidden: boolean;

  created_at: Date;
  updated_at: Date;

  constructor(
    id: number | null,
    businessId: number,
    phoneNumberId: number | null,
    phoneNumber: string | null,
    lid: string | null,
    username: string | null,
    pushname: string | null,
    contactName: string | null,
    is_user: boolean,
    is_hidden: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.business_id = businessId;
    this.phone_number_id = phoneNumberId;
    this.phone_number = phoneNumber;
    this.lid = lid;
    this.username = username;
    this.pushname = pushname;
    this.contact_name = contactName;
    this.is_user = is_user;
    this.is_hidden = is_hidden;
    this.created_at = createdAt;
    this.updated_at = updatedAt;
  }
}
