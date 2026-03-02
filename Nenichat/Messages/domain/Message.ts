import { IMessage } from './IMessage';

export class Message implements IMessage {
  /**
   * Creates an instance of Message.
   * @param id Unique identifier for the message.
   * @param chat_jid JID of the chat.
   * @param sender_jid JID of the sender.
   * @param content Text content of the message.
   * @param timestamp Message timestamp.
   * @param is_from_me Whether the message was sent by me.
   * @param media_type Type of media if applicable.
   * @param filename Filename if applicable.
   * @param url URL if applicable.
   * @param file_length Length of the file if applicable.
   * @param created_at Creation timestamp.
   * @param updated_at Last update timestamp.
   * @param replied_to_message_id Optional ID of the message being replied to.
   * @param quoted_message_text Optional text of the quoted message.
   */
  constructor(
    public id: string,
    public chat_jid: string,
    public sender_jid: string,
    public content: string | null,
    public timestamp: string,
    public is_from_me: boolean,
    public media_type: string,
    public filename: string,
    public url: string,
    public file_length: number,
    public created_at: string,
    public updated_at: string,
    public replied_to_message_id?: string,
    public quoted_message_text?: string
  ) { }
}