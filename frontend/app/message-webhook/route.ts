import { IWebhookEvent, WebhookEvent } from "@/dto/IWebhookEvent";
import { Message } from "@/Nenichat/Messages/domain/Message";
import { Contact } from "@/Nenichat/Contacts/domain/Contact";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { chatRepository } from "@/Nenichat/Chats/infra/persistance/ChatRepository";

const getOrCreateChat = async (contactId: bigint) => {
    let chat = await chatRepository.findById(contactId);
    if (!chat) {
        chat = await chatRepository.save({ id: contactId, is_group: false });
    }
    return chat;
};

export async function GET(request: Request) {
    return new Response("Message Webhook Endpoint", { status: 200 });
}

export async function POST(request: Request) {
    const body: IWebhookEvent = await request.json();
    const webhookEvent = new WebhookEvent(body);

    if (!webhookEvent.isMessage()) {
        return new Response(null, { status: 200 });
    }

    const messageData = webhookEvent.message;
    if (!messageData) {
        return new Response(null, { status: 200 });
    }

    let senderContact: Contact;
    let chatContact: Contact; // The contact that defines the chat

    if (webhookEvent.isSentByMe()) {
        // senderContact = await getOrCreateContact(webhookEvent.sender_id!, webhookEvent.pushname, true);
        senderContact = await contactRepository.getOrCreateContact(webhookEvent.sender_id!);
        // chatContact = await getOrCreateContact(webhookEvent.chat_id!, null, false);
        chatContact = await contactRepository.getOrCreateContact(webhookEvent.chat_id!);
    } else { // isSentByCustomer
        // senderContact = await getOrCreateContact(webhookEvent.chat_id!, webhookEvent.pushname, false);
        senderContact = await contactRepository.getOrCreateContact(webhookEvent.chat_id!);
        chatContact = senderContact;
    }
    const chat = await getOrCreateChat(chatContact.id!);

    const message = new Message(
        messageData.id!,
        chat.id!,
        senderContact.id!,
        messageData.text || "",
        messageData.replied_id,
        messageData.quoted_message,
        new Date()
    );

    await messageRepository.save(message);

    console.log(message.sender_id.toString() + " : " + message.text_content);
    return new Response(null, { status: 200 });
}