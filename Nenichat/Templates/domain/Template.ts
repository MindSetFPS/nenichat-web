import { ITemplate } from './ITemplate';

export class Template implements ITemplate {
  id: string;
  business_id: number;
  name: string;
  message: string;
  created_at: string;
  updated_at: string;

  constructor(data: ITemplate) {
    this.id = data.id;
    this.business_id = data.business_id;
    this.name = data.name;
    this.message = data.message;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
