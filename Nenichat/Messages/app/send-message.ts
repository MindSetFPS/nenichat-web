import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { Message } from "../domain/Message";

export default async function SendMessage(phone: string, messageTextContent: string) {
    return
    // const res = await fetch("http://192.168.1.64:5100/send/message", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //         phone: phone,
    //         message: messageTextContent,
    //     }),
    // });

    // // get business id
    // let businessId = "";

    // // find the user contact
    // const me = await contactRepository.findMe(businessId);

    // // find the contact to send the message to
    // const contact = await contactRepository.findByPhoneNumber(phone); // chat_id is contact.id
    // let response = await res.json()

    // // Save incoming message
    // if (response.code === "SUCCESS") {
    //     const message: Message = new Message(
    //         response.results.message_id,
    //         contact!.id!,
    //         me!.id!,
    //         messageTextContent,
    //         undefined,
    //         undefined,
    //         new Date(),
    //     )
    //     await messageRepository.save(message)
    // } else {
    //     console.error("Failed to send message", response)
    // }
}