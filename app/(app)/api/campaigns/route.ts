import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseCampaignRepository } from '@/Nenichat/Campaigns/infra/persistance/SupabaseCampaignRepository';
import { getBusinessFromUser } from '@/lib/user-auth';
import { CronExpressionParser } from 'cron-parser'
import { ICampaignRequest } from '@/Nenichat/Campaigns/dto/ICampaignRequest';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const campaignRepository = new SupabaseCampaignRepository(supabase);

  try {
    const body = await request.json() as ICampaignRequest;
    const {
      name,
      description,
      audienceIds,
      message,
      run_at,
      interval,
      dayOfMonth,
      dayOfWeek,
      frequency_type,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // run_at is a timestamp
    const runAtDate = new Date(run_at);

    // get only hour and minute
    const hour = runAtDate.getHours();
    const minute = runAtDate.getMinutes();

    let nextRunAt = null;
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
      try {
        const cronInterval = CronExpressionParser.parse(cronExpression);
        nextRunAt = cronInterval.next().toDate();
      } catch (e) {
        console.error("Error parsing cron expression:", e);
      }
    }

    await campaignRepository.create(business.id, {
      name,
      description,
      task_type: 'message-campaign',
      frequency_type: frequency_type as "recurring" | "once",
      cron_expression: cronExpression,
      run_at: runAtDate,
      payload: { message, audienceIds },
      enabled: true,
      last_run_at: undefined,
      next_run_at: nextRunAt || undefined
    });

    return NextResponse.json("Campaign created successfully", { status: 201 });
  } catch (error: any) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign', details: error.message }, { status: 500 });
  }
}
