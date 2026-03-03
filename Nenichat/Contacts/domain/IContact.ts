export interface IContact {
  id: number | null; // supabase id
  business_id: number;
  phone_number: string | null;
  lid: string | null; // local id
  username: string | null;
  pushname: string | null;
  contact_name: string | null;
  is_user: boolean;
  is_hidden: boolean;

  created_at: Date;
  updated_at: Date;
}
