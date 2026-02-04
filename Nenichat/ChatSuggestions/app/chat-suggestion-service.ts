import { chatSuggestionRepository } from '../infra/persistance/ChatSuggestionRepository';
import { IChatSuggestion } from '../domain/IChatSuggestion';
import { formatConversationContext, generateManySuggestions } from '@/lib/suggestions';

/**
 * Creates a new chat suggestion and saves it to the database
 * @param chatId The chat ID to associate the suggestion with
 * @param messageId The message ID to associate the suggestion with
 * @param messages The messages to generate suggestions from
 * @param isSelected Whether the suggestion is selected (default: false)
 * @returns The created chat suggestion
 */
export async function createChatSuggestion(
  chatId: bigint,
  messageId: string,
  messages: any[],
  isSelected: boolean = false
): Promise<IChatSuggestion> {

  const prompt = formatConversationContext(messages)
  const suggestions = await generateManySuggestions(prompt)

  return await chatSuggestionRepository.create({
    chat_id: chatId,
    message_id: messageId,
    suggestion: suggestions[0],
    is_selected: isSelected
  });
}

/**
 * Gets all suggestions for a specific chat
 * @param chatId The chat ID
 * @returns Array of chat suggestions ordered by creation date
 */
export async function getChatSuggestions(chatId: bigint): Promise<IChatSuggestion[]> {
  return await chatSuggestionRepository.findByChatId(chatId);
}

/**
 * Gets only selected suggestions for a specific chat
 * @param chatId The chat ID
 * @returns Array of selected chat suggestions ordered by creation date
 */
export async function getSelectedChatSuggestions(chatId: bigint): Promise<IChatSuggestion[]> {
  return await chatSuggestionRepository.findSelectedByChatId(chatId);
}

/**
 * Updates the selection status of a chat suggestion
 * @param suggestionId The suggestion ID
 * @param isSelected The new selection status
 * @returns The updated chat suggestion or null if not found
 */
export async function updateSuggestionSelection(
  suggestionId: bigint,
  isSelected: boolean
): Promise<IChatSuggestion | null> {
  return await chatSuggestionRepository.updateSelection(suggestionId, isSelected);
}

/**
 * Deletes a chat suggestion
 * @param suggestionId The suggestion ID
 * @returns True if the suggestion was deleted, false otherwise
 */
export async function deleteChatSuggestion(suggestionId: bigint): Promise<boolean> {
  return await chatSuggestionRepository.delete(suggestionId);
}

/**
 * Deletes all suggestions for a specific chat
 * @param chatId The chat ID
 * @returns True if suggestions were deleted, false otherwise
 */
export async function deleteChatSuggestions(chatId: bigint): Promise<boolean> {
  return await chatSuggestionRepository.deleteByChatId(chatId);
}