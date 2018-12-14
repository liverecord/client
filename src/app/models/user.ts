import {Model} from './model';

export class Notificatons {
  email: boolean;

  public constructor() {
    this.email = false;
  }
}

export class Settings {
  notifications: Notificatons;

  public constructor() {
    this.notifications = new Notificatons();
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


