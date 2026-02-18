export interface IChat {
  id: string;
  name: string;
  last_message_time: Date;
  ephemeral_expiration: number;
  is_group: boolean;
  created_at: Date;
  updated_at: Date;
}
