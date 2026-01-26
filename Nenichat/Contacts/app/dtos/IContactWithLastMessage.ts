import { IContact } from "../../domain/IContact";
import { Message } from "@/Nenichat/Messages/domain/Message";

export default interface IContactWithLastMessage extends IContact {
    last_message: Message | null;
}