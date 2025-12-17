import { ScheduledTask } from "./types";
import { db } from "./db";

interface ITaskHandler {
    handle(task: ScheduledTask, executionId: number): Promise<any>;
}

async function generateMessage(task: ScheduledTask) {
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
        phone: member.phone,
        message: text,
        reply_message_id: null,
        is_forwarded: false,
        duration: null
    }

    // use endpoint from env
    const response = await fetch(process.env.WHATSAPP_API_ENDPOINT + "/send/message", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            //   'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload)
    });

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

async function messageCampaignTask(task: ScheduledTask, executionId: number) {
    // 1. Generate message
    const text = await generateMessage(task);

    // 2. Fetch audiences from campaign_audiences table 
    const audiences = await db.getAudiences(task);

    let failureCount = 0;
    // Check if audiences.rows exists (in case of empty result)
    const audienceRows = audiences.rows || [];
    const requests = audienceRows.map((audience: any) => audience.members.length);
    const results: any[] = [];

    // 4. Loop through audiences
    for (const audience of audienceRows) {
        // 5. Wait a random interval of time
        const randomInterval = Math.floor(Math.random() * 10000);
        await new Promise(resolve => setTimeout(resolve, randomInterval));

        // 6. Loop through members of audience
        for (const member of audience.members) {
            // 7. Post request to send message
            const outcome = await sendWhatsAppMessage(member, text);

            if (!outcome.success) {
                failureCount++;
                results.push(outcome.errorItem);
            }

            const randomInterval = Math.floor(Math.random() * 10000);
            await new Promise(resolve => setTimeout(resolve, randomInterval));
        }
    }

    return JSON.stringify({
        total: requests.length,
        success: requests.length - failureCount, // this should be "succeeded" 
        failed: failureCount,
        details: results
    });
}
