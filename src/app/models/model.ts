export class Model {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  static normalizeDate(object: any) {
    for (const prop in object)  {
      if (object.hasOwnProperty(prop) && prop.indexOf('edAt') > -1 && ! (object[prop] instanceof Date)) {
        object[prop] = new Date(object[prop]);
      }
    }
    return object;
  }

  static fromObject(object: any): Model {
    object = this.normalizeDate(object);
    return Object.assign(new Model(), object);
  }

  static fromJson(data: string): Model {
    let object = JSON.parse(data);
    object = this.normalizeDate(object);
    return this.fromObject(object);
  }
}
