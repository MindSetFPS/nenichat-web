import { IMessage } from '@/repository/IMessage';
import { IContact } from '@/repository/IContact';

export interface IMessageWithSender extends IMessage {
  sender?: IContact;
}
