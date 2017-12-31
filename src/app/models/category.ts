import {Model} from './model';

export class Category extends Model {
  name: string;
  description: string;
  active: boolean;
  updates: number;
  order: number;
  slug?: string;
}
