import { IContact } from './IContact';

export class Contact implements IContact {
  id: bigint;
  phone_number: string;
  pushname: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: bigint,
    phoneNumber: string,
    pushname: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.phone_number = phoneNumber;
    this.pushname = pushname;
    this.created_at = createdAt;
    this.updated_at = updatedAt;
  }
}
