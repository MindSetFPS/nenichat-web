import { Scheduler } from './scheduler';
import dotenv from 'dotenv';
dotenv.config();

const scheduler = new Scheduler();

function start() {
    try {
        scheduler.start();
    } catch (error) {
        console.error('Failed to start scheduler:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('SIGINT received. Stopping scheduler...');
    scheduler.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Stopping scheduler...');
    scheduler.stop();
    process.exit(0);
});

start();
