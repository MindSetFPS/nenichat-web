import { GoWappMessageRepository } from "../infra/api";
import type { IMessage } from "../domain/IMessage";

export default async function SendMessage(
    phone: string,
    messageTextContent: string,
    businessId: number,
): Promise<IMessage> {
    const wappRepo = new GoWappMessageRepository({ deviceId: String(businessId) });

    return wappRepo.save({
        chat_jid: phone,
        content: messageTextContent,
    });
}
