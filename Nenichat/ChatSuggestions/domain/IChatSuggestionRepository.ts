import { IChatSuggestion } from './IChatSuggestion';

export interface IChatSuggestionRepository {
  create(chatSuggestion: Omit<IChatSuggestion, 'id' | 'created_at'>): Promise<IChatSuggestion>;
  findById(id: bigint): Promise<IChatSuggestion | null>;
  findByChatId(chatId: bigint): Promise<IChatSuggestion[]>;
  findSelectedByChatId(chatId: bigint): Promise<IChatSuggestion[]>;
  updateSelection(id: bigint, isSelected: boolean): Promise<IChatSuggestion | null>;
  delete(id: bigint): Promise<boolean>;
  deleteByChatId(chatId: bigint): Promise<boolean>;
}