import { IChat } from './IChat';

export class Chat implements IChat {
  constructor(
    public id: bigint,
    public is_group: boolean,
    public created_at: Date
  ) {}
}
