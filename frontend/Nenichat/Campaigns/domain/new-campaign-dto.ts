export interface NewCampaignData {
    name: string;
    description: string;
    message: string;
    runAt: Date | undefined;
    interval: string;
    frequency_type: 'once' | 'recurring';
    dayOfMonth: string | undefined;
    dayOfWeek: string;
    audienceIds: number[];
}