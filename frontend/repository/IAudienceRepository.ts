import { IAudience } from '../dto/IAudience';

export interface IAudienceRepository {
    create(audience: IAudience): Promise<IAudience>;
    findById(id: number): Promise<IAudience | null>;
    findAll(): Promise<IAudience[]>;
    update(audience: IAudience): Promise<IAudience>;
    delete(id: number): Promise<void>;
    search(query: string): Promise<IAudience[]>;
}
