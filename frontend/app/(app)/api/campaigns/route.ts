
import { NextResponse } from 'next/server'
import { pool } from '@/Nenichat/Shared/infra/persistance/db'
import { CronExpressionParser } from 'cron-parser'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      audienceIds,
      message,
      runAt,
      interval,
      dayOfMonth,
      dayOfWeek,
      frequency_type,
    } = body;

    console.log(body);

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // runAt is a timestamp
    const runAtDate = new Date(runAt);

    // get only hour and minute
    const hour = runAtDate.getHours();
    const minute = runAtDate.getMinutes();

    // in my time zone merida mexico, the time set is 3:00 pm, however,
    // the Date object shows 21:00 or 9:00 pm
    // as long as it runs at the correct time, it's fine

    let lastRunAt = null; // null because we are creating it
    let nextRunAt = null;

    if (frequency_type === 'once') {
      // set run_at to runAt
      runAtDate.setHours(hour);
      runAtDate.setMinutes(minute);
    }

    let cronExpression = '';
    if (frequency_type === 'recurring') {
      // generate cron expression compatible with linux cron
      if (interval === 'daily') {
        cronExpression = `${minute} ${hour} * * *`;
      } else if (interval === 'weekly') {
        cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
      } else if (interval === 'monthly') {
        cronExpression = `${minute} ${hour} ${dayOfMonth} * *`;
      }
      // calculate next run from cron expression 
      console.log(cronExpression);
      const cronInterval = CronExpressionParser.parse(cronExpression);

      const nextRunAtDate = cronInterval.next().toDate();
      nextRunAt = nextRunAtDate;
    }

    console.log(body);
    console.log(runAtDate);
    console.log(nextRunAt);
    console.log(lastRunAt);

    // pool.query(
    //   `INSERT INTO scheduled_tasks 
    //   (name, description, task_type, frequency_type, cron_expression, run_at, payload, enabled, last_run_at, next_run_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    //   [name, description, 'campaign', interval, cronExpression, runAtDate, { message, audienceIds }, true, lastRunAt, nextRunAt, new Date(), new Date()]
    // );

    return NextResponse.json("it works", { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
