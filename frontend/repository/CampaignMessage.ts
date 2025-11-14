import { ICampaignMessage } from '../dto/ICampaignMessage';

export class CampaignMessage implements ICampaignMessage {
  id: number;
  campaign_id: string;
  content: string;

  constructor(id: number, campaign_id: string, content: string) {
    this.id = id;
    this.campaign_id = campaign_id;
    this.content = content;
  }
}
