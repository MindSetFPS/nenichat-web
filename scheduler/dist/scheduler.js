"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const cron_parser_1 = require("cron-parser");
const db_1 = require("./db");
const executor_1 = require("./executor");
class Scheduler {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.POLL_INTERVAL_MS = 10000; // Check every 10 seconds
    }
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
    async checkTasks() {
        try {
            console.log('Checking for due tasks...');
            // Select tasks that are enabled and due to run
            // We process them inside a transaction or simply lock them if we had multiple scheduler instances
            // For this simple version, we'll assume single instance or optimistic locking via separate updates
            const res = await db_1.db.query(`
        SELECT * FROM scheduled_tasks 
        WHERE enabled = true 
          AND (next_run_at <= NOW() OR next_run_at IS NULL)
      `);
            const tasks = res.rows;
            console.log(`Found ${tasks.length} tasks to run.`);
            for (const task of tasks) {
                await this.processTask(task);
            }
        }
        catch (error) {
            console.error('Error during poll:', error);
        }
    }
    async processTask(task) {
        // 1. Calculate next run time
        let nextRun = null;
        let shouldDisable = false;
        try {
            if (task.frequency_type === 'recurring' && task.cron_expression) {
                const interval = cron_parser_1.CronExpressionParser.parse(task.cron_expression);
                nextRun = interval.next().toDate();
            }
            else if (task.frequency_type === 'once') {
                // Run once, so no next run. We might want to disable it after.
                shouldDisable = true;
            }
            // 2. Update the task record immediately to prevent double-execution by next poll
            // (If we had multiple pods, we'd do use FOR UPDATE SKIP LOCKED or set a 'locking' status)
            // For 'once' tasks, we might disable them or set next_run_at to NULL/far future
            await db_1.db.query(`UPDATE scheduled_tasks 
         SET last_run_at = NOW(), 
             next_run_at = $1,
             enabled = $2,
             updated_at = NOW()
         WHERE id = $3`, [nextRun, !shouldDisable, task.id]);
            // 3. Create execution record
            const executionRes = await db_1.db.query(`INSERT INTO task_executions (task_id, status) VALUES ($1, 'pending') RETURNING id`, [task.id]);
            const executionId = executionRes.rows[0].id;
            // 4. Trigger execution (fire and forget from scheduler's perspective, but executor handles DB updates)
            (0, executor_1.executeTask)(task, executionId);
        }
        catch (err) {
            console.error(`Failed to process task scheduling logic for task ${task.id}`, err);
        }
    }
}
exports.Scheduler = Scheduler;
