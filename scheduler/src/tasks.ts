import { ScheduledTask } from "./types";
import { db } from "./db";

interface ITaskHandler {
    handle(task: ScheduledTask, executionId: number): Promise<any>;
}

async function generateMessage() {
    // 1. Query currently available active products
    const products = await db.getActiveProducts();

    // 2. Generate message
    const text =
        `Hola, hoy tenemos los siguientes productos disponibles: ${products.rows.map((product: any) => product.name).join(', ')}`;

    return text;
}

/**
 * Sends a WhatsApp message to a member.
 */
async function sendWhatsAppMessage(member: any, text: string) {
    const payload = {
        phone: member.phone_number,
        message: text,
        reply_message_id: null,
        is_forwarded: false,
        duration: null
    }

    let sendMessageUrl = process.env.WHATSAPP_API_ENDPOINT + "/send/message";
    console.log(sendMessageUrl)
    console.log(payload)
    // use endpoint from env
    const response = await fetch(sendMessageUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            //   'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload)
    });

    console.log(response)

    if (!response.ok) {
        return {
            success: false,
            errorItem: {
                phone: member.phone,
                status: 'failed',
                error: response.statusText
            }
        };
    }

    console.log(`Message sent to ${member.phone}`);
    return { success: true };
}

export const TasksRegistry: Record<string, ITaskHandler> = {
    'message-campaign': {
        handle: messageCampaignTask
    },
}

type MessageCampaignTask = Omit<ScheduledTask, "payload"> & {
    payload: {
        audienceIds: number[];
    }
}

async function messageCampaignTask(task: MessageCampaignTask, executionId: number) {
    // 1. Generate message
    const text = await generateMessage();
    console.log("text: ", text);

    // 2. Fetch audiences from campaign_audiences table 
    const audienceIds = task.payload.audienceIds;
    console.log("audienceIds: ", audienceIds);

    let failureCount = 0;
    // Check if audiences.rows exists (in case of empty result)
    let requestsCounter = 0;
    const results: any[] = [];

    // 4. Loop through audiences
    for (const audienceId of audienceIds) {
        // 5. Get members of audience
        const members = await db.getAudienceMembers(audienceId);

        // 6. Wait a random interval of time
        const randomInterval = Math.floor(Math.random() * 10000);
        await new Promise(resolve => setTimeout(resolve, randomInterval));

        // 7. Loop through members of audience
        for (const member of members) {
            // 8. Post request to send message
            console.log("member: ", member);
            const outcome = await sendWhatsAppMessage(member, text);

            if (!outcome.success) {
                failureCount++;
                results.push(outcome.errorItem);
            }

            const randomInterval = Math.floor(Math.random() * 10000);
            requestsCounter++;
            await new Promise(resolve => setTimeout(resolve, randomInterval));
        }
    }

    return JSON.stringify({
        total: requestsCounter,
        success: requestsCounter - failureCount, // this should be "succeeded" 
        failed: failureCount,
        details: results
    });
}
