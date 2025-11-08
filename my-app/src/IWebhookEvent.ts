export interface IMessageAckPayload {
  chat_id: string;
  from: string;
  ids: string[];
  receipt_type: string;
  receipt_type_description: string;
  sender_id: string;
}

export interface IMessageContent {
  text: string;
  id: string;
  replied_id: string;
  quoted_message: string;
}

/**
 * Represents a generic event from the webhook.
 * It can be a message acknowledgement, a new message, or other event types.
 * The optional properties will only be present for certain event types.
 */
export interface IWebhookEvent {
  // Fields for a message acknowledgement event
  event?: "message.ack" | string;
  payload?: IMessageAckPayload;

  // Fields for an incoming message event
  chat_id?: string;
  from?: string;
  message?: IMessageContent;
  pushname?: string;
  sender_id?: string;

  // Common field present in all events
  timestamp: string; // ISO 8601 date string
}

export class WebhookEvent implements IWebhookEvent {
  event?: "message.ack" | string;
  payload?: IMessageAckPayload;
  chat_id?: string;
  from?: string;
  message?: IMessageContent;
  pushname?: string;
  sender_id?: string;
  timestamp: string;

  constructor(data: IWebhookEvent) {
    this.event = data.event;
    this.payload = data.payload;
    this.chat_id = data.chat_id;
    this.from = data.from;
    this.message = data.message;
    this.pushname = data.pushname;
    this.sender_id = data.sender_id;
    this.timestamp = data.timestamp;
  }

  /**
   * Checks if the event is a message acknowledgement.
   */
  isAck(): boolean {
    return this.event === 'message.ack';
  }

  /**
   * Checks if the event is an incoming message.
   */
  isMessage(): boolean {
    return !!this.message;
  }
}
