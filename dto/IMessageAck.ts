export interface IMessageAck {
  event: "message.ack";
  payload: {
    chat_id: string;
    from: string;
    ids: string[];
    receipt_type: string;
    receipt_type_description: string;
    sender_id: string;
  };
  timestamp: string;
}
