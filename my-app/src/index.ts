import { Hono } from 'hono'
import { IWebhookEvent, WebhookEvent } from './IWebhookEvent'
import { ContactRepository } from './ContactRepository'

const contactRepo = new ContactRepository();

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/message-webhook', async (c) => {
  const contentType = c.req.header('content-type')
  if (contentType && contentType.includes('application/json')) {
    const rawEvent: IWebhookEvent = await c.req.json()
    const webhookEvent = new WebhookEvent(rawEvent);

    if (webhookEvent.isAck()) {
    } else if (webhookEvent.isMessage()) {
      // It's an incoming message
      console.log('It is a message event');
      let contact = await contactRepo.saveContact(webhookEvent.chat_id!, webhookEvent.pushname!)
      console.log(contact)
    }
  }
  return c.body(null, 200)
})

export default {
  port: 5101,
  fetch: app.fetch,
} 