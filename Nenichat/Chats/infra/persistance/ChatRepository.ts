import { Pool } from 'pg';
import { IChat } from '../../domain/IChat';
import { IChatRepository } from '../../domain/IChatRepository';
import { Chat } from '../../domain/Chat';
import { pool } from '../../../Shared/infra/persistance/db';

export class ChatRepository implements IChatRepository {
  constructor(private pool: Pool) { }

  private toChat(data: any): IChat {
    if (!data) return data;
    return new Chat(
      data.id,
      data.name || 'Unknown',
      data.last_message_time || new Date(),
      data.ephemeral_expiration || 0,
      data.is_group,
      data.created_at || new Date(),
      data.updated_at || new Date()
    );
  }

  async findById(id: string): Promise<IChat | null> {
    const result = await this.pool.query('SELECT * FROM chats WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }
    return this.toChat(result.rows[0]);
  }

  async save(chat: Partial<IChat>): Promise<IChat> {
    const { id, is_group } = chat;

    if (!id) {
      throw new Error('Chat ID must be provided to save a chat.');
    }

    const existingChat = await this.findById(id);

    if (existingChat) {
      // Update existing chat
      const chatToUpdate = { ...existingChat, ...chat };
      const result = await this.pool.query(
        `
        UPDATE chats
        SET
          is_group = $1
        WHERE id = $2
        RETURNING *
      `,
        [chatToUpdate.is_group, existingChat.id]
      );
      if (!result || result.rows.length === 0) {
        throw new Error('Failed to save chat.');
      }
      return this.toChat(result.rows[0]);
    } else {
      // Insert new chat
      const result = await this.pool.query(
        `
        INSERT INTO chats (id, is_group)
        VALUES ($1, $2)
        RETURNING *
      `,
        [id, is_group || false]
      );
      if (!result || result.rows.length === 0) {
        throw new Error('Failed to save chat.');
      }
      return this.toChat(result.rows[0]);
    }
  }

  async list(offset: number, limit: number): Promise<IChat[]> {
    const result = await this.pool.query(
      'SELECT * FROM chats ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows.map((d) => this.toChat(d));
  }
}

export const chatRepository = new ChatRepository(pool);
