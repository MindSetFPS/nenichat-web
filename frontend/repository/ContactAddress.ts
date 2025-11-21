import { IContactAddress } from '../dto/IContactAddress';

export class ContactAddress implements IContactAddress {
    constructor(
        public id: number,
        public contact_id: number,
        public address: string,
        public label: string | null,
        public is_default: boolean,
        public created_at: Date,
        public updated_at: Date
    ) { }
}
