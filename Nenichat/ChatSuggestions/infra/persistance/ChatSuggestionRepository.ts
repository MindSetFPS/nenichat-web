import { Pool } from 'pg';
import { IChatSuggestion } from '../../domain/IChatSuggestion';
import { IChatSuggestionRepository } from '../../domain/IChatSuggestionRepository';
import { ChatSuggestion } from '../../domain/ChatSuggestion';
import { pool } from '../../../Shared/infra/persistance/db';

export class ChatSuggestionRepository implements IChatSuggestionRepository {
  constructor(private pool: Pool) {}

  private toChatSuggestion(data: {
    id: bigint;
    chat_id: bigint;
    message_id: string;
    suggestion: string;
    is_selected: boolean;
    created_at: Date;
  }): IChatSuggestion {
    if (!data) return data;
    return new ChatSuggestion(
      data.id,
      data.chat_id,
      data.message_id,
      data.suggestion,
      data.is_selected,
      data.created_at
    );
  }

  async create(chatSuggestion: Omit<IChatSuggestion, 'id' | 'created_at'>): Promise<IChatSuggestion> {
    const { chat_id, message_id, suggestion, is_selected } = chatSuggestion;

    const result = await this.pool.query(
      `
      INSERT INTO chat_suggestions (chat_id, message_id, suggestion, is_selected)
      VALUES (, $2, $3, $4)
      RETURNING *
      `,
      [chat_id, message_id, suggestion, is_selected || false]
    );

    if (!result || result.rows.length === 0) {
      throw new Error('Failed to create chat suggestion.');
    }

    return this.toChatSuggestion(result.rows[0]);
  }

  async findById(id: bigint): Promise<IChatSuggestion | null> {
    const result = await this.pool.query('SELECT * FROM chat_suggestions WHERE id = ', [id]);

    if (result.rows.length === 0) {
      return null;
    }
    return this.toChatSuggestion(result.rows[0]);
  }

  async findByChatId(chatId: bigint): Promise<IChatSuggestion[]> {
    const result = await this.pool.query(
      'SELECT * FROM chat_suggestions WHERE chat_id =  ORDER BY created_at ASC',
      [chatId]
    );

    return result.rows.map((d) => this.toChatSuggestion(d));
  }

  async findSelectedByChatId(chatId: bigint): Promise<IChatSuggestion[]> {
    const result = await this.pool.query(
      'SELECT * FROM chat_suggestions WHERE chat_id =  AND is_selected = true ORDER BY created_at ASC',
      [chatId]
    );

    return result.rows.map((d) => this.toChatSuggestion(d));
  }

  async updateSelection(id: bigint, isSelected: boolean): Promise<IChatSuggestion | null> {
    const result = await this.pool.query(
      `
      UPDATE chat_suggestions
      SET is_selected = 
      WHERE id = $2
      RETURNING *
      `,
      [isSelected, id]
    );

    if (!result || result.rows.length === 0) {
      return null;
    }

    return this.toChatSuggestion(result.rows[0]);
  }

  async delete(id: bigint): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM chat_suggestions WHERE id = ', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async deleteByChatId(chatId: bigint): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM chat_suggestions WHERE chat_id = ', [chatId]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const chatSuggestionRepository = new ChatSuggestionRepository(pool);