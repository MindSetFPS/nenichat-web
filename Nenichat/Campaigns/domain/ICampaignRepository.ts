import { ICampaign } from './ICampaign';

export interface ICampaignRepository {
  findById(businessId: number, id: string): Promise<ICampaign | null>;
  create(businessId: number, campaign: Partial<ICampaign>): Promise<ICampaign>;
  update(businessId: number, campaign: Partial<ICampaign>): Promise<ICampaign>;
  list(businessId: number, offset: number, limit: number): Promise<ICampaign[]>;
}
