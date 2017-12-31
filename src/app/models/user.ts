import {Model} from './model';

export class User extends Model {
  name: string;
  online: boolean;
  email?: string;
  picture?: string;
  slug?: string;
  rank?: number;
}
