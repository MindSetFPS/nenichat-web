export interface IChatSuggestion {
  id: bigint;
  chat_id: bigint;
  message_id: string;
  suggestion: string;
  is_selected: boolean;
  created_at: Date;
}