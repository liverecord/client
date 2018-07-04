import { Injectable } from '@angular/core';

export enum Storages {
  Local = 'local',
  Session = 'session'
}

@Injectable()
export class StorageService {

  storageArea = Storages.Local;
  constructor() { }
  prefix = 'lr_';

  private n(key: string): string {
    return this.prefix + key;
  }

  set(key: string, value: any) {
    key = this.n(key);
    const data = JSON.stringify(value);
    switch (this.storageArea) {
      case Storages.Local:
        localStorage.setItem(key, data);
        break;

      case Storages.Session:
        sessionStorage.setItem(key, data);
        break;
    }
    return this;
  }

  get(key: string): any {
    let v;
    key = this.n(key);
    switch (this.storageArea) {
      case Storages.Local:
        v = localStorage.getItem(key);
      break;

      case Storages.Session:
        v = sessionStorage.getItem(key);
      break;
    }
    if (typeof v === 'string') {
      return JSON.parse(v);
    }
    return v;
  }

  remove(key: string) {
    key = this.n(key);
    switch (this.storageArea) {
      case Storages.Local:
        localStorage.removeItem(key);
        break;
      case Storages.Session:
        sessionStorage.removeItem(key);
        break;
    }
  }

  first(key: string): any {
    key = this.n(key);
    let v = localStorage.getItem(key);
    if (v === null) {
      v = sessionStorage.getItem(key);
    }
    return JSON.parse(v);
  }

  clear() {
    switch (this.storageArea) {
      case Storages.Local:
        localStorage.clear();
        break;
      case Storages.Session:
        sessionStorage.clear();
        break;
    }
  }
}
