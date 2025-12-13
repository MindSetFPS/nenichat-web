import { IWebhookEvent, WebhookEvent } from "@/dto/IWebhookEvent";
import { Message } from "@/Nenichat/Messages/domain/Message";
import { Contact } from "@/Nenichat/Contacts/domain/Contact";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { getOrCreateChat } from "@/Nenichat/Chats/app/getOrCreateChat";

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
        senderContact = await contactRepository.getOrCreateContact(webhookEvent.sender_id!);
        chatContact = await contactRepository.getOrCreateContact(webhookEvent.chat_id!);
    } else { // isSentByCustomer
        senderContact = await contactRepository.getOrCreateContact(webhookEvent.chat_id!);
        chatContact = senderContact;
    }
    const chat = await getOrCreateChat(chatContact);

    const message = new Message(
        messageData.id!,
        chat.id!,
        senderContact.id!,
        messageData.text || "",
        messageData.replied_id,
        messageData.quoted_message,
        new Date()
    );

    try {
        await messageRepository.save(message);
    } catch (error) {
        console.error({ "Error saving message:": error, "messageData": messageData });
    }

    return new Response(null, { status: 200 });
}
