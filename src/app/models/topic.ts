import {Model} from './model';
import {User} from './user';
import {Category} from './category';

export class Topic extends Model {
  title: string;
  body: string;
  totalViews?: number;
  totalComments?: number;
  unreadComments?: number;
  updates?: number;
  order: number;
  slug: string;
  user?: User;
  acl: User[];
  category?: Category;
  active?: boolean;
  private?: boolean;
  pinned?: boolean;
}

export class EditableTopic extends Topic {
}
