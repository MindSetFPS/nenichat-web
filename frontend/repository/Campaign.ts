import { ICampaign } from '../dto/ICampaign';

export class Campaign implements ICampaign {
  id: string;
  name: string;
  run_at?: string;
  executed_at?: string;
  description?: string;
  message?: string;
  created_at: string;
  audienceIds?: number[];

  constructor(
    id: string,
    name: string,
    created_at: string,
    run_at?: string,
    executed_at?: string,
    description?: string,
    message?: string,
    audienceIds?: number[]
  ) {
    this.id = id;
    this.name = name;
    this.created_at = created_at;
    this.run_at = run_at;
    this.executed_at = executed_at;
    this.description = description;
    this.message = message;
    this.audienceIds = audienceIds;
  }
}
