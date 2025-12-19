import { TaskPayload } from '@/Nenichat/Shared/domain/scheduled-task';
import { ICampaign } from './ICampaign';

export class Campaign implements ICampaign {
  id: number;
  name: string;
  description?: string;
  frequency_type: 'once' | 'recurring';
  interval?: string;
  day_of_month?: string;
  day_of_week?: string;

  run_at?: Date;
  executed_at?: Date;
  message?: string;
  created_at: Date;
  audienceIds?: number[];

  payload: {} | TaskPayload;
  enabled: boolean;
  updated_at: Date;

  constructor(
    id: number,
    name: string,
    created_at: Date,
    updated_at: Date,
    frequency_type: 'once' | 'recurring',
    payload: {} | TaskPayload,
    enabled: boolean,
    interval?: string,
    day_of_month?: string,
    day_of_week?: string,

    run_at?: Date,
    executed_at?: Date,
    description?: string,
    message?: string,
    audienceIds?: number[],
  ) {
    this.id = id;
    this.name = name;
    this.created_at = created_at;
    this.frequency_type = frequency_type;
    this.interval = interval;
    this.day_of_month = day_of_month;
    this.day_of_week = day_of_week;
    this.run_at = run_at;
    this.executed_at = executed_at;
    this.description = description;
    this.message = message;
    this.audienceIds = audienceIds;
    this.payload = payload;
    this.enabled = enabled;
    this.updated_at = updated_at;
  }
}
