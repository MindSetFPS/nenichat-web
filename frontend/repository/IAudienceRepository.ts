import { IAudience } from '../dto/IAudience';

export interface IAudienceRepository {
  findById(id: number): Promise<IAudience | null>;
  findAll(): Promise<IAudience[]>;
  create(audience: Omit<IAudience, 'id' | 'created_at'>): Promise<IAudience>;
}