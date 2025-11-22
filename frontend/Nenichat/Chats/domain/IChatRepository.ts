import { IChat } from './IChat';

export interface IChatRepository {
  findById(id: bigint): Promise<IChat | null>;
  save(chat: Partial<IChat>): Promise<IChat>;
  list(offset: number, limit: number): Promise<IChat[]>;
}
