import { GoWappMessageRepository } from "../infra/api";
import type { IMessage } from "../domain/IMessage";

export default async function SendMessage(
    phone: string,
    messageTextContent: string,
    businessId: number,
): Promise<IMessage> {
    const gowappUrl = `http://192.168.1.64/api/user/${businessId}`;
    const wappRepo = new GoWappMessageRepository(gowappUrl, "admin", "admin", String(businessId));

    return wappRepo.save({
        chat_jid: phone,
        content: messageTextContent,
    });
}
