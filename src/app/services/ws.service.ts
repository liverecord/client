import { Injectable } from '@angular/core';
import {Observable, Subscribable, Subject, Observer,  interval } from 'rxjs';
import {StorageService} from './storage.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';


@Injectable()
export class WebSocketService  {
  public subject: WebSocketSubject<Frame>;
  public status: Subject<any>;
  public live: boolean;

  readonly url = 'ws://' + window.location.hostname + ':8000/ws';

  constructor(private store: StorageService) {
    this.live = false;
    this.status = new Subject<any>();
    this.create();
    interval(10000).subscribe(() => {
      this.isOpen();
    });
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
          this.live = true;
          this.status.next(this.live);
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
            this.live = false;
            this.status.next(this.live);
            this.create();
          }
        },
        () => {
          console.log('ws complete');
          this.live = false;
          this.status.next(this.live);
        },
      );
    }
    return this.subject;
  }

  isOpen(): boolean {
    if (! this.subject) {
      this.live = false;
    }
    this.status.next(this.live);
    return this.live;
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
    if (typeof frame['requestId'] === 'undefined') {
      frame.requestId = '';
    }
    frame.data = JSON.stringify(frame.data);
    return this.subject.next((frame));
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
  CommentSave = 'CommentSave',
  CommentList = 'CommentList',
  ResetPassword = 'ResetPassword',
  User = 'User'
}

export interface Frame {
  type: FrameType;
  data: any;
  requestId?: string;
}
