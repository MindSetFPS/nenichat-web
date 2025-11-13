import { Pool } from 'pg';
import { IMessage } from './IMessage';
import { IMessageRepository } from './IMessageRepository';
import { Message } from './Message';
import { pool } from './db';

export class MessageRepository implements IMessageRepository {
  constructor(private pool: Pool) {}

  private toMessage(data: any): IMessage {
    if (!data) return data;
    return new Message(
      data.id,
      data.chat_id,
      data.sender_id,
      data.text_content,
      data.replied_to_message_id,
      data.quoted_message_text,
      data.created_at
    );
  }

  async findById(id: string): Promise<IMessage | null> {
    const result = await this.pool.query('SELECT * FROM messages WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }
    return this.toMessage(result.rows[0]);
  }

  async save(message: Partial<IMessage>): Promise<IMessage> {
    const { id, chat_id, sender_id, text_content, replied_to_message_id, quoted_message_text } = message;

    if (!id) {
      throw new Error('Message ID must be provided to save a message.');
    }

    const existingMessage = await this.findById(id);

    if (existingMessage) {
      // Update existing message
      const messageToUpdate = { ...existingMessage, ...message };
      const result = await this.pool.query(
        `
        UPDATE messages
        SET
          chat_id = $1,
          sender_id = $2,
          text_content = $3,
          replied_to_message_id = $4,
          quoted_message_text = $5
        WHERE id = $6
        RETURNING *
      `,
        [
          messageToUpdate.chat_id,
          messageToUpdate.sender_id,
          messageToUpdate.text_content,
          messageToUpdate.replied_to_message_id,
          messageToUpdate.quoted_message_text,
          existingMessage.id,
        ]
      );
      if (!result || result.rows.length === 0) {
        throw new Error('Failed to save message.');
      }
      return this.toMessage(result.rows[0]);
    } else {
      // Insert new message
      if (!chat_id || !sender_id) {
          throw new Error('chat_id and sender_id must be provided for a new message.');
      }
      const result = await this.pool.query(
        `
        INSERT INTO messages (id, chat_id, sender_id, text_content, replied_to_message_id, quoted_message_text)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [id, chat_id, sender_id, text_content || null, replied_to_message_id || null, quoted_message_text || null]
      );
      if (!result || result.rows.length === 0) {
        throw new Error('Failed to save message.');
      }
      return this.toMessage(result.rows[0]);
    }
  }

  async list(offset: number, limit: number): Promise<IMessage[]> {
    const result = await this.pool.query(
      'SELECT * FROM messages ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows.map((d) => this.toMessage(d));
  }

  async findByChatId(chat_id: string, offset: number, limit: number): Promise<IMessage[]> {
    const result = await this.pool.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3',
      [chat_id, limit, offset]
    );

    return result.rows.map((d) => this.toMessage(d));
  }
}

export const messageRepository = new MessageRepository(pool);
