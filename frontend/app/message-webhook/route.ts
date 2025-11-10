import { IWebhookEvent, WebhookEvent } from "@/dto/IWebhookEvent";
import { Message } from "@/repository/Message";
import { Contact } from "@/repository/Contact";
import { messageRepository } from "@/repository/MessageRepository";
import { contactRepository } from "@/repository/ContactRepository";
import { chatRepository } from "@/repository/ChatRepository";

export async function GET(request: Request) {
    const userts = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
    ]
    return new Response(JSON.stringify(userts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function POST(request: Request) {
    const body: IWebhookEvent = await request.json();
    const webhookEvent = new WebhookEvent(body);

    // Ignore non-message events
    if (webhookEvent.isGroup() || webhookEvent.isAck() || !webhookEvent.isMessage()) {
        return new Response(null, { status: 200 });
    }

    const messageData = webhookEvent.message;
    if (!messageData) {
        return new Response(null, { status: 200 });
    }

    const getOrCreateContact = async (phoneNumber: string, pushname: string | null, isMe: boolean = false) => {
        let contact = await contactRepository.findByPhoneNumber(phoneNumber);
        if (!contact) {
            const newContact = new Contact(
                null,
                phoneNumber,
                null,
                null,
                pushname || null,
                null,
                isMe,
                new Date(),
                new Date()
            );
            contact = await contactRepository.save(newContact);
        }
        return contact;
    };

    const getOrCreateChat = async (contactId: bigint) => {
        let chat = await chatRepository.findById(contactId);
        if (!chat) {
            chat = await chatRepository.save({ id: contactId, is_group: false });
        }
        return chat;
    };

    let senderContact: Contact;
    let chatContact: Contact; // The contact that defines the chat

    if (webhookEvent.isSentByMe()) {
        senderContact = await getOrCreateContact(webhookEvent.sender_id!, webhookEvent.pushname, true);
        chatContact = await getOrCreateContact(webhookEvent.chat_id!, null, false);
    } else { // isSentByCustomer
        senderContact = await getOrCreateContact(webhookEvent.chat_id!, webhookEvent.pushname, false);
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

    return new Response(null, { status: 200 });
}