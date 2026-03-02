export interface IMessage {
  id: string;
  chat_jid: string;
  sender_jid: string;
  content: string | null;
  timestamp: string;
  is_from_me: boolean;
  media_type: string;
  filename: string;
  url: string;
  file_length: number;
  created_at: string;
  updated_at: string;
  replied_to_message_id?: string;
  quoted_message_text?: string;
}