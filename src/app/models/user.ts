import {Model} from './model';


export class Settings {
  notifications: number;

  public constructor() {
    this.notifications = 2;
  }
}

export class User extends Model {
  name: string;
  online: boolean;
  email?: string;
  gender?: string;
  picture?: string;
  slug?: string;
  about?: string;
  rank?: number;
  settings?: Settings;

  public constructor() {
    super();
    this.settings = new Settings();
    this.id = 0;
    this.name = '';
    this.slug = '';
  }

  public uiData (): User {
    return <User>{
      id: this.id,
      name: this.name,
      slug: this.slug,
      picture: this.picture
    };
  }
}


