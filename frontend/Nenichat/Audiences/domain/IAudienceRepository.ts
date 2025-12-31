import { IAudience } from './IAudience';

export interface IAudienceRepository {
  findById(id: number): Promise<IAudience | null>;
  getByIds(ids: number[]): Promise<IAudience[]>;
  findAll(): Promise<IAudience[]>;
  delete(id: number): Promise<void>;
  create(audience: Omit<IAudience, 'id' | 'created_at'>): Promise<IAudience>;
}