import { db } from './db';
import { TasksRegistry } from './tasks';
import { ScheduledTask } from './types';

export async function executeTask(task: ScheduledTask) {
    const executionId = await db.createExecutionRecord(task);
    await db.setExecutionRunning(executionId);

    try {
        const taskSummary = await TasksRegistry[task.task_type].handle(task, executionId);
        await db.setExecutionCompleted(executionId, taskSummary);

    } catch (error: any) {
        console.error(`Execution ${executionId} failed:`, error);
        await db.setExecutionFailed(executionId, error.message);
    }
}
