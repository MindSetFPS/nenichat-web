import { ICampaign } from '../dto/ICampaign';

export class Campaign implements ICampaign {
  id: string;
  name: string;
  run_at?: string;
  description?: string;
  created_at: string;
  audienceIds?: number[];

  constructor(
    id: string,
    name: string,
    created_at: string,
    run_at?: string,
    description?: string,
    audienceIds?: number[]
  ) {
    this.id = id;
    this.name = name;
    this.created_at = created_at;
    this.run_at = run_at;
    this.description = description;
    this.audienceIds = audienceIds;
  }
}
