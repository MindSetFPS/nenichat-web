export interface NewCampaignData {
    name: string;
    description: string;
    message: string;
    runAt: Date | undefined;
    interval: string | undefined;
    frequency_type: 'once' | 'recurring';
    dayOfMonth: string | undefined;
    dayOfWeek: string | undefined;
    audienceIds: number[];
}