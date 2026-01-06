export interface ICampaignRequest {
    id: string;
    name: string;
    description: string;

    message: string;

    audienceIds: number[];
    interval: string;
    dayOfMonth: string;
    dayOfWeek: string;
    run_at: string;

    enabled: boolean;
    frequency_type: string;
    payload: any;
}