import { IMessage } from './IMessage';
import { IMessageRepository } from './IMessageRepository';
import { Message } from './Message';
import { sql } from './db';

export class MessageRepository implements IMessageRepository {
  constructor(private sql: any) {}

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
    const result: any[] = await this.sql`SELECT * FROM messages WHERE id = ${id}`;

    if (result.length === 0) {
      return null;
    }
    return this.toMessage(result[0]);
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
      const result: any[] = await this.sql`
        UPDATE messages
        SET
          chat_id = ${messageToUpdate.chat_id},
          sender_id = ${messageToUpdate.sender_id},
          text_content = ${messageToUpdate.text_content},
          replied_to_message_id = ${messageToUpdate.replied_to_message_id},
          quoted_message_text = ${messageToUpdate.quoted_message_text}
        WHERE id = ${existingMessage.id}
        RETURNING *
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to save message.');
      }
      return this.toMessage(result[0]);
    } else {
      // Insert new message
      if (!chat_id || !sender_id) {
          throw new Error('chat_id and sender_id must be provided for a new message.');
      }
      const result: any[] = await this.sql`
        INSERT INTO messages (id, chat_id, sender_id, text_content, replied_to_message_id, quoted_message_text)
        VALUES (${id}, ${chat_id}, ${sender_id}, ${text_content || null}, ${replied_to_message_id || null}, ${quoted_message_text || null})
        RETURNING *
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to save message.');
      }
      return this.toMessage(result[0]);
    }
  }

  async list(offset: number, limit: number): Promise<IMessage[]> {
    const messages: any[] =
      await this.sql`SELECT * FROM messages ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`;

    return messages.map((d) => this.toMessage(d));
  }

  async findByChatId(chat_id: string, offset: number, limit: number): Promise<IMessage[]> {
    const messages: any[] =
      await this.sql`SELECT * FROM messages WHERE chat_id = ${chat_id} ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`;

    return messages.map((d) => this.toMessage(d));
  }
}

export const messageRepository = new MessageRepository(sql);
