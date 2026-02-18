import { IAudience } from './IAudience';

export interface IAudienceRepository {
  findById(businessId: number, id: number): Promise<IAudience | null>;
  getByIds(businessId: number, ids: number[]): Promise<IAudience[]>;
  findAll(businessId: number): Promise<IAudience[]>;
  delete(businessId: number, id: number): Promise<void>;
  create(businessId: number, audience: Omit<IAudience, 'id' | 'business_id' | 'created_at'>): Promise<IAudience>;
}