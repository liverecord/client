import {Model} from './model';
import {User} from './user';
import {Topic} from './topic';

export class Comment extends Model {
  user: User;
  topic: Topic;
  body: string;
}
