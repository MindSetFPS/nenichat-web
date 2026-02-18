import { chatRepository } from "../infra/persistance/ChatRepository";
import { Contact } from "../../Contacts/domain/Contact";

export const getOrCreateChat = async (contact: Contact) => {
    let chat = await chatRepository.findById(contact.id!.toString());
    const isGroup = contact.lid ? contact.lid.length >= 18 : false;
    // chat = await chatRepository.save({ id: contact.id!, is_group: isGroup });
    return chat;
};
