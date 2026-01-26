import { Pool } from 'pg';
import { IMessage } from '../../domain/IMessage';
import { IMessageRepository } from '../../domain/IMessageRepository';
import { Message } from '../../domain/Message';
import { pool } from '../../../Shared/infra/persistance/db';
import { IMessageWithSender } from '@/Nenichat/Messages/domain/IMessageWithSender';
import { IContact } from '../../../Contacts/domain/IContact';
import { IMessagesReport } from '../../domain/IMessagesReport';
import { Contact } from '../../../Contacts/domain/Contact';

export class MessageRepository implements IMessageRepository {
  constructor(private pool: Pool) { }

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

  async listWithSender(offset: number, limit: number): Promise<IMessageWithSender[]> {
    const result = await this.pool.query(
      `SELECT 
        m.id,
        m.chat_id,
        m.sender_id,
        m.text_content,
        m.replied_to_message_id,
        m.quoted_message_text,
        m.created_at,
        c.id as sender_contact_id,
        c.contact_name, 
        c.pushname, 
        c.username, 
        c.phone_number,
        c.lid,
        c.is_user,
        c.created_at as sender_created_at,
        c.updated_at as sender_updated_at
      FROM messages m
      LEFT JOIN contacts c ON m.sender_id = c.id
      ORDER BY m.created_at DESC, m.id DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map((d) => {
      const message: IMessage = {
        id: d.id,
        chat_id: d.chat_id,
        sender_id: d.sender_id,
        text_content: d.text_content,
        replied_to_message_id: d.replied_to_message_id,
        quoted_message_text: d.quoted_message_text,
        created_at: d.created_at,
      };

      const sender: IContact | undefined = d.sender_contact_id ? new Contact(
        d.sender_contact_id,
        d.phone_number,
        d.lid,
        d.username,
        d.pushname,
        d.contact_name,
        d.is_user,
        d.sender_created_at,
        d.sender_updated_at
      ) : undefined;

      return { ...message, sender };
    });
  }

  async findByChatId(chat_id: string, offset: number, limit: number): Promise<IMessage[]> {
    const result = await this.pool.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3',
      [chat_id, limit, offset]
    );

    return result.rows.map((d) => this.toMessage(d));
  }

  async findByChatIdWithSender(chat_id: string, offset: number, limit: number): Promise<IMessageWithSender[]> {
    const result = await this.pool.query(
      `SELECT 
        m.id,
        m.chat_id,
        m.sender_id,
        m.text_content,
        m.replied_to_message_id,
        m.quoted_message_text,
        m.created_at,
        c.id as sender_contact_id,
        c.contact_name, 
        c.pushname, 
        c.username, 
        c.phone_number,
        c.lid,
        c.is_user,
        c.created_at as sender_created_at,
        c.updated_at as sender_updated_at
      FROM messages m
      LEFT JOIN contacts c ON m.sender_id = c.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC, m.id DESC 
      LIMIT $2 OFFSET $3`,
      [chat_id, limit, offset]
    );

    return result.rows.map((d) => {
      const message: IMessage = {
        id: d.id,
        chat_id: d.chat_id,
        sender_id: d.sender_id,
        text_content: d.text_content,
        replied_to_message_id: d.replied_to_message_id,
        quoted_message_text: d.quoted_message_text,
        created_at: d.created_at,
      };

      const sender: IContact | undefined = d.sender_contact_id ? new Contact(
        d.sender_contact_id,
        d.phone_number,
        d.lid,
        d.username,
        d.pushname,
        d.contact_name,
        d.is_user,
        d.sender_created_at,
        d.sender_updated_at
      ) : undefined;

      return { ...message, sender };
    });
  }

  async count(): Promise<number> {
    const result = await this.pool.query('SELECT COUNT(*) as count FROM messages');
    return Number(result.rows[0].count);
  }

  async getMessageCountPerDay(interval: number): Promise<IMessagesReport[]> {
    const result = await this.pool.query(
      `SELECT
        created_at::date as date,
        COUNT(id) as count
      FROM messages
      WHERE created_at >= NOW() - INTERVAL '${interval} days' AND messages.sender_id NOT IN (SELECT hidden_contact_id FROM hidden_contacts)
      GROUP BY created_at::date
      ORDER BY date ASC`
    );

    return result.rows.map((row) => ({
      date: new Date(row.date).toISOString().split('T')[0], // Format date as YYYY-MM-DD string
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * A function that searches for the last message sent by the contact
   * @param chat_id 
   * @returns IMessage
   */
  async getLastContactMessage(chat_id: BigInt): Promise<IMessage | null> {
    const result = await this.pool.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1',
      [chat_id]
    );
    return result.rows.length > 0 ? this.toMessage(result.rows[0]) : null;
  }
}

export const messageRepository = new MessageRepository(pool);
