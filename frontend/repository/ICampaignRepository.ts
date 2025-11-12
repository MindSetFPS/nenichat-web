import { ICampaign } from '../dto/ICampaign';

export interface ICampaignRepository {
  findById(id: string): Promise<ICampaign | null>;
  create(campaign: Partial<ICampaign>): Promise<ICampaign>;
  update(campaign: Partial<ICampaign>): Promise<ICampaign>;
  list(offset: number, limit: number): Promise<ICampaign[]>;
}
