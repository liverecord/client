import {Model} from './model';
import {User} from './user';
import {Category} from './category';

export class Topic extends Model {
  title: string;
  body: string;
  total_views?: number;
  total_comments?: number;
  unread_comments?: number;
  updates?: number;
  order: number;
  slug: string;
  user?: User;
  acl: User[];
  category?: Category;
  active?: boolean;
  private?: boolean;
}

export class EditableTopic extends Topic {
}
