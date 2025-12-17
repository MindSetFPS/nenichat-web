import { db } from './src/db';

async function seed() {
    console.log('Seeding test data...');

    // 1. One-off task due now
    await db.query(`
    INSERT INTO scheduled_tasks (name, frequency_type, run_at, payload, enabled, next_run_at)
    VALUES (
      'Test One-off Task', 
      'once', 
      NOW(), 
      '{"requests": [{"method": "GET", "url": "https://google.com"}]}', 
      true, 
      NOW()
    );
  `);

    // 2. Recurring task (every minute)
    // Cron for every minute: * * * * *
    await db.query(`
    INSERT INTO scheduled_tasks (name, frequency_type, cron_expression, payload, enabled, next_run_at)
    VALUES (
      'Test Recurring Task', 
      'recurring', 
      '* * * * *', 
      '{"requests": [{"method": "GET", "url": "https://example.com"}]}', 
      true, 
      NOW()
    );
  `);

    console.log('Seeded tasks. Run "npm run dev" to start scheduler.');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
