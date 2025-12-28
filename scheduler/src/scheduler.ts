import { parseExpression } from 'cron-parser';
import { db } from './db';
import { executeTask } from './executor';
import { ScheduledTask } from './types';


export class Scheduler {
    private isRunning = false;
    private intervalId: NodeJS.Timeout | null = null;
    private readonly POLL_INTERVAL_MS = 10000; // Check every 10 seconds

    start() {
        if (this.isRunning) {
            console.log('Scheduler is already running.');
            return;
        }
        this.isRunning = true;
        console.log('Starting scheduler...');

        // Initial check
        this.checkTasks();

        // Start polling Loop
        this.intervalId = setInterval(() => this.checkTasks(), this.POLL_INTERVAL_MS);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('Scheduler stopped.');
    }

    private async checkTasks() {
        try {
            console.log('Checking for due tasks...');
            // Select tasks that are enabled and due to run
            // We process them inside a transaction or simply lock them if we had multiple scheduler instances
            // For this simple version, we'll assume single instance or optimistic locking via separate updates

            const tasks = await db.getDueTasks();

            console.log(`Found ${tasks.length} tasks to run.`);

            for (const task of tasks) {
                console.log(task)
                await this.processTask(task);
            }
        } catch (error) {
            console.error('Error during poll:', error);
        }
    }

    private async processTask(task: ScheduledTask) {
        // 1. Calculate next run time
        let nextRun: Date | null = null;
        let isEnabled = true;

        try {
            if (task.frequency_type === 'recurring' && task.cron_expression) {
                const interval = parseExpression(task.cron_expression);
                nextRun = interval.next().toDate();
            } else if (task.frequency_type === 'once') {
                // Run once, so no next run. We might want to disable it after.
                isEnabled = false;
            }

            // 2. Update the task record immediately to prevent double-execution by next poll
            // For 'once' tasks, we might disable them or set next_run_at to NULL/far future
            await db.updateTask(task, nextRun, isEnabled);

            // 3. Trigger execution (fire and forget from scheduler's perspective, but executor handles DB updates)
            executeTask(task);

        } catch (err) {
            console.error(`Failed to process task scheduling logic for task ${task.id}`, err);
        }
    }
}
