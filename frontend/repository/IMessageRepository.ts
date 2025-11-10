import { IMessage } from './IMessage';

export interface IMessageRepository {
  findById(id: string): Promise<IMessage | null>;
  save(message: Partial<IMessage>): Promise<IMessage>;
  list(offset: number, limit: number): Promise<IMessage[]>;
  findByChatId(chat_id: string, offset: number, limit: number): Promise<IMessage[]>;
}