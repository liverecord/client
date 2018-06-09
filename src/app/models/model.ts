export class Model {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  static normalizeDate(object: any): any {
    for (const prop in object)  {
      if (object.hasOwnProperty(prop) && (prop.indexOf('edAt') > -1 || prop.indexOf('edDate') > -1) && ! (object[prop] instanceof Date)) {
        object[prop] = new Date(object[prop]);
      }
    }
    return object;
  }

  static create<T>(c: {new(): T}): T {
    return new c();
  }

  static fromObject<T>(this: new() => T, object: any): T {
    object = Model.normalizeDate(object);
    return Object.assign(new this(), object);
  }

  static fromJson(data: string): Model {
    let object = JSON.parse(data);
    object = this.normalizeDate(object);
    return this.fromObject(object);
  }
}
