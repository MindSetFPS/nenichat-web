import { IMessage } from './IMessage';
import { IMessagesReport } from './IMessagesReport';
import { IMessageWithSender } from './IMessageWithSender';

export interface IMessageRepository {
  findById(id: string): Promise<IMessage | null>;
  save(message: Partial<IMessage>): Promise<IMessage>;
  list(offset: number, limit: number): Promise<IMessage[]>;
  listWithSender(offset: number, limit: number): Promise<IMessageWithSender[]>;
  findByChatId(chat_id: string, offset: number, limit: number): Promise<IMessage[]>;
  findByChatIdWithSender(chat_id: string, offset: number, limit: number): Promise<IMessageWithSender[]>;
  count(): Promise<number>;
  getMessageCountPerDay(): Promise<IMessagesReport[]>;
}