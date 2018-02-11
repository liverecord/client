import { Injectable } from '@angular/core';
import {Observable, Subscribable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Observer} from 'rxjs/Observer';
import { webSocket} from 'rxjs/observable/dom/webSocket';
import {StorageService} from './storage.service';

@Injectable()
export class WebSocketService  {
  public subject: Subject<any>;

  readonly url = 'ws://localhost:8000/ws';

  constructor(private store: StorageService) {
    this.create();
  }

  getWsUrl(): string {
    let url = this.url;
    const jwt = this.store.first('jwt');
    if (jwt !== null) {
      url = this.url + '?jwt=' + encodeURIComponent(jwt);
    }
    return url;
  }

  create(): Subject<any>  {
    console.log('connecting...');
    if (!this.subject) {
      this.subject = webSocket(this.getWsUrl());
      this.subject.subscribe(
        (frameFromServer) => {
          console.log('ws svc raw ffs', frameFromServer);

          if (frameFromServer.data) {
            frameFromServer.data = JSON.parse(frameFromServer.data);
          }
          console.log('ws decoded ffs', frameFromServer);
          return frameFromServer;
        },
        (err) => {
          console.log('ws error', err);
          if (['error', 'close'].indexOf(err.type) > -1) {
            this.subject = null;
            this.create();
          }
        },
        () => {console.log('ws complete'); },
      );
    }
    return this.subject;
  }

  isOpen(): boolean {
    return !this.subject.isStopped;
  }

  /**
   * Subscribe on WS updates
   * @param {(observerOrNext: any) => void} observerOrNext
   * @param {(error: any) => void} error
   * @param {() => void} complete
   * @returns {Subscription}
   */
  subscribe(observerOrNext?: (observerOrNext: any) => void,
            error?: (error: any) => void,
            complete?: () => void) {
    if (!this.subject) {
      this.create();
    }
    return this.subject.subscribe(observerOrNext, error, complete);
  }

  /**
   * Send Frame to the server
   * @param frame
   */
  next(frame: Frame) {
    if (!this.subject) {
      this.create();
    }
    frame.data = JSON.stringify(frame.data);
    return this.subject.next(JSON.stringify(frame));
  }
}

export enum FrameType {
  Ping = 'Ping',
  Auth = 'Auth',
  AuthError = 'AuthError',
  JWT = 'JWT',
  UserList = 'UserList',
  UserInfo = 'UserInfo',
  UserUpdate = 'UserUpdate',
  UserDelete = 'UserDelete',
  Category = 'Category',
  CategoryList = 'CategoryList',
  CategoryUpdate = 'CategoryUpdate',
  CategoryDelete = 'CategoryDelete',
  CategoryError = 'CategoryError',
  Topic = 'Topic',
  TopicUpdate = 'TopicSave',
  TopicList = 'TopicList',
  Comment = 'Comment',
  CommentList = 'CommentList',
  User = 'User'
}

export interface Frame {
  type: FrameType;
  data: any;
  requestId?: string;
}
