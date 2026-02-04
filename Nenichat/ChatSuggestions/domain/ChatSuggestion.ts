import { IChatSuggestion } from './IChatSuggestion';

export class ChatSuggestion implements IChatSuggestion {
  constructor(
    public id: bigint,
    public chat_id: bigint,
    public message_id: string,
    public suggestion: string,
    public is_selected: boolean,
    public created_at: Date
  ) {}
}