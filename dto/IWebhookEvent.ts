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
 *
 * Schema notes (go-whatsapp-web-multidevice v9):
 * - Top-level `device_id` identifies the device that received the event.
 * - `sender_display_name` (when present) is the gateway-resolved sender label.
 */
export interface IWebhookEvent {
  // v9: device that emitted the event
  device_id?: string;

  // Fields for a message acknowledgement event
  event?: "message.ack" | string;
  payload?: IMessageAckPayload;

  // Fields for an incoming message event
  chat_id?: string;
  from?: string;
  message?: IMessageContent;
  pushname: string | null;
  sender_id?: string;
  sender_display_name?: string;

  // Common field present in all events
  timestamp: string;
}

export class WebhookEvent implements IWebhookEvent {
  device_id?: string;
  event?: "message.ack" | string;
  payload?: IMessageAckPayload;
  chat_id?: string;
  from?: string;
  message?: IMessageContent;
  pushname: string | null;
  sender_id?: string;
  sender_display_name?: string;
  timestamp: string;

  constructor(data: IWebhookEvent) {
    this.device_id = data.device_id;
    this.event = data.event;
    this.payload = data.payload;
    this.chat_id = data.chat_id;
    this.from = data.from;
    this.message = data.message;
    this.pushname = data.pushname;
    this.sender_id = data.sender_id;
    this.sender_display_name = data.sender_display_name;
    this.timestamp = data.timestamp;
  }


  // This confirmation logic is weak:
  // sender_id can be either a phone number of a lid
  // and there is no way to know which one is which
  // so we should save all mesages and all contacts
  // and then merge them later via ui
  isSentByMe(): boolean {
    return this.sender_id !== this.chat_id
  }

  isSentByCustomer(): boolean {
    return this.sender_id == this.chat_id
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

  /*  GROUPS
        When a message from a group is received, the `chat_id` represents the group's ID,
        whie the sender_id is is lid (local id ) for that user in that group.
  
        To tell if a message is from a group, check if sender-id is in from
    */
  isGroup(): boolean | undefined {
    if (!this.from || !this.sender_id) {
      return undefined;
    }
    return !this.from.includes(this.sender_id);
  }
}
