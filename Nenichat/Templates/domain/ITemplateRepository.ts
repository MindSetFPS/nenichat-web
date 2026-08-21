import { ITemplate } from './ITemplate';

export interface ITemplateRepository {
  list(businessId: number): Promise<ITemplate[]>;
  findById(businessId: number, id: string): Promise<ITemplate | null>;
  create(businessId: number, data: { name: string; message: string }): Promise<ITemplate>;
  update(businessId: number, id: string, data: { name: string; message: string }): Promise<ITemplate>;
  delete(businessId: number, id: string): Promise<void>;
}
