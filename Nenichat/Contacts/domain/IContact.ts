export interface IContact {
  id: number | null; // supabase id
  business_id: number;
  /**
   * FK to the global `phone_numbers` table.
   * Null when the contact is known only by their WhatsApp `lid`.
   */
  phone_number_id: number | null;
  /**
   * The resolved phone number string, populated via JOIN with `phone_numbers`.
   * This is a virtual/read-only field — do not write it directly to the DB.
   */
  phone_number: string | null;
  lid: string | null; // local id (WhatsApp-specific, per business)
  username: string | null;
  pushname: string | null;
  contact_name: string | null;
  is_user: boolean;
  is_hidden: boolean;

  created_at: Date;
  updated_at: Date;
}
