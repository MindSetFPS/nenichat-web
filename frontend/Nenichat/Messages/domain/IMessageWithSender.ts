import { IMessage } from '@/Nenichat/Messages/domain/IMessage';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';

export interface IMessageWithSender extends IMessage {
  sender?: IContact;
}
