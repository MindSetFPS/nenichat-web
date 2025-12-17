"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTask = executeTask;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("./db");
function getActiveProducts() {
    return db_1.db.query(`SELECT * FROM products WHERE active = true`);
}
async function getAudiences(task) {
    const audiencesIds = await db_1.db.query(`SELECT * FROM campaign_audiences WHERE campaign_id = $1`, [task.id]);
    const audiences = await db_1.db.query(`SELECT * FROM audiences WHERE id IN ($1)`, [audiencesIds.rows.map((row) => row.audience_id)]);
    return audiences;
}
async function executeTask(task, executionId) {
    try {
        // 1. Query currently available products active products
        const products = await getActiveProducts();
        // 2. Generate message
        const text = `Hola, hoy tenemos los siguientes productos disponibles: ${products.rows.map((product) => product.name).join(', ')}`;
        // 3. Fetch audiences from campaign_audiences table 
        const audiences = await getAudiences(task);
        let failureCount = 0;
        const requests = audiences.rows.map((audience) => audience.members.length);
        const results = [];
        // 4. Loop through audiences
        for (const audience of audiences.rows) {
            // 5. Wait a random interval of time
            const randomInterval = Math.floor(Math.random() * 10000);
            await new Promise(resolve => setTimeout(resolve, randomInterval));
            // 6. Loop through members of audience
            for (const member of audience.members) {
                // 7. Post request to send message
                const response = await axios_1.default.post('https://api.whatsapp.com/v1/messages', {
                    to: member.phone,
                    type: 'text',
                    text: {
                        body: text
                    }
                });
                if (response.status !== 200) {
                    failureCount++;
                    results.push({
                        phone: member.phone,
                        status: 'failed',
                        error: response.statusText
                    });
                }
                else {
                    console.log(`Message sent to ${member.phone}`);
                }
                const randomInterval = Math.floor(Math.random() * 10000);
                await new Promise(resolve => setTimeout(resolve, randomInterval));
            }
        }
        // value Update status to running
        await db_1.db.query(`UPDATE task_executions SET status = 'running' WHERE id = $1`, [executionId]);
        const logSummary = JSON.stringify({
            total: requests.length,
            success: requests.length - failureCount,
            failed: failureCount,
            details: results // potentially truncate this if it's too huge
        });
        await db_1.db.query(`UPDATE task_executions 
       SET status = 'completed', completed_at = NOW(), log = $2 
       WHERE id = $1`, [executionId, logSummary]);
    }
    catch (error) {
        console.error(`Execution ${executionId} failed:`, error);
        await db_1.db.query(`UPDATE task_executions 
       SET status = 'failed', completed_at = NOW(), log = $2 
       WHERE id = $1`, [executionId, error.message]);
    }
}
