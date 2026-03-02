import { IChat } from './IChat';

export class Chat implements IChat {
  constructor(
    public jid: string,
    public name: string,
    public last_message_time: Date,
    public ephemeral_expiration: number,
    public is_group: boolean,
    public created_at: Date,
    public updated_at: Date
  ) { }
}
