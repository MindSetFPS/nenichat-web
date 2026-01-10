export interface IAudienceUpdate {
    contact_id: string;
    audience_id: string;
    action: "add" | "remove";
}
