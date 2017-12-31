import {Model} from './model';
import {User} from './user';

export class Topic extends Model {
  title: string;
  description: string;
  body: string;
  total_views?: number;
  total_comments?: number;
  order: number;
  slug?: string;
}

export class EditableTopic extends Topic {
  acl: User[];
  private: boolean;
  category?: number;
}
