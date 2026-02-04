// Domain exports
export type { IChatSuggestion } from './domain/IChatSuggestion';
export { ChatSuggestion } from './domain/ChatSuggestion';
export type { IChatSuggestionRepository } from './domain/IChatSuggestionRepository';

// Infrastructure exports
export { ChatSuggestionRepository, chatSuggestionRepository } from './infra/persistance/ChatSuggestionRepository';

// App service exports
export {
  createChatSuggestion,
  getChatSuggestions,
  getSelectedChatSuggestions,
  updateSuggestionSelection,
  deleteChatSuggestion,
  deleteChatSuggestions
} from './app/chat-suggestion-service';