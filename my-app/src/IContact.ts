export interface IContact {
  id: bigint;
  phone_number: string;
  pushname: string | null;
  created_at: Date;
  updated_at: Date;
}
