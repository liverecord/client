import { Injectable } from '@angular/core';

export enum Storages {
  Local = 'local',
  Session = 'session'
}

@Injectable()
export class StorageService {

  storageArea = Storages.Local;
  constructor() { }

  set(key: string, value: any) {
    const svalue = JSON.stringify(value);
    switch (this.storageArea) {
      case Storages.Local:
        localStorage.setItem(key, svalue);
        break;

      case Storages.Session:
        sessionStorage.setItem(key, svalue);
        break;
    }
    return this;
  }

  get(key: string): any {
    let v;
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
    } else {
      return v;
    }
  }

  remove(key: string) {
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
    let v = localStorage.getItem(key);
    if (v === null) {
      v = sessionStorage.getItem(key);
    }
    if (typeof v === 'string') {
      return JSON.parse(v);
    } else {
      return v;
    }
  }
}
