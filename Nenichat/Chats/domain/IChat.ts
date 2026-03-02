import { IMessage } from "@/Nenichat/Messages/domain/IMessage";

interface IChat {
  /**********************************************************************************/
  /*  This can be a) a phone number + @s.whatsapp.net for users in contact library
  /*  b) an id + @g.us for groups
  /*  c) an id + @lid for users not in contacts library
  /*
  /**/ jid: string;
  /**********************************************************************************/

  name: string;
  last_message_time: Date;
  ephemeral_expiration: number;
  is_group: boolean;
  created_at: Date;
  updated_at: Date;
}

interface GoWappChatResponse {
  chat_info: IChat;

  pagination: {
    offset: number;
    limit: number;
    total: number;
  }

  data: IMessage[]
}

export type { IChat, GoWappChatResponse };