// A campaign is a scheduled task that sends a message to a list of audiences

import { ScheduledTask } from "@/Nenichat/Shared/domain/scheduled-task";

export interface ICampaign extends ScheduledTask {
  message?: string;
  audienceIds?: number[];
}
