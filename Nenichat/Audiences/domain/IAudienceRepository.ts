import { IAudience } from './IAudience';

export interface IAudienceRepository {
  findById(id: number): Promise<IAudience | null>;
  getByIds(ids: number[]): Promise<IAudience[]>;
  findAll(): Promise<IAudience[]>;
  create(audience: Omit<IAudience, 'id' | 'created_at'>): Promise<IAudience>;
}