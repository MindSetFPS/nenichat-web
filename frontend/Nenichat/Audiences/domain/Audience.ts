import { IAudience } from './IAudience';

export class Audience implements IAudience {
    id: number;
    name: string;
    description?: string;
    created_at: Date;

    constructor(id: number, name: string, description: string | undefined, created_at: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_at = created_at;
    }
}
