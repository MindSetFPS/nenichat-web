import { IMessage } from './IMessage';

export class Message implements IMessage {
  constructor(
    public id: string,
    public chat_id: bigint,
    public sender_id: bigint,
    public text_content: string | null,
    public replied_to_message_id: string | undefined,
    public quoted_message_text: string | undefined,
    public created_at: Date
  ) { }
}