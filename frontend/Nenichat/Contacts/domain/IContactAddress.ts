export interface IContactAddress {
    id: number;
    contact_id: number;
    address: string;
    label: string | null;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
}
