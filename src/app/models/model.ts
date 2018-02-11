export class Model {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  static fromObject(object: any): Model {
    return Object.assign(new Model(), object);
  }

  static fromJson(data: string): Model {
    return this.fromObject(JSON.parse(data));
  }
}
