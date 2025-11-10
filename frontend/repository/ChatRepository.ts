import { IChat } from './IChat';
import { IChatRepository } from './IChatRepository';
import { Chat } from './Chat';
import { sql } from './db';

export class ChatRepository implements IChatRepository {
  constructor(private sql: any) {}

  private toChat(data: any): IChat {
    if (!data) return data;
    return new Chat(
      data.id,
      data.is_group,
      data.created_at,
    );
  }

  async findById(id: bigint): Promise<IChat | null> {
    const result: any[] = await this.sql`SELECT * FROM chats WHERE id = ${id}`;

    if (result.length === 0) {
      return null;
    }
    return this.toChat(result[0]);
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
      const result: any[] = await this.sql`
        UPDATE chats
        SET
          is_group = ${chatToUpdate.is_group}
        WHERE id = ${existingChat.id}
        RETURNING *
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to save chat.');
      }
      return this.toChat(result[0]);
    } else {
      // Insert new chat
      const result: any[] = await this.sql`
        INSERT INTO chats (id, is_group)
        VALUES (${id}, ${is_group || false})
        RETURNING *
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to save chat.');
      }
      return this.toChat(result[0]);
    }
  }

  async list(offset: number, limit: number): Promise<IChat[]> {
    const chats: any[] =
      await this.sql`SELECT * FROM chats ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`;

    return chats.map((d) => this.toChat(d));
  }
}

export const chatRepository = new ChatRepository(sql);
