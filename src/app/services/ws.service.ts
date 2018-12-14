import { Injectable } from '@angular/core';
import {Observable, Subscribable, Subject, Observer,  interval } from 'rxjs';
import {StorageService} from './storage.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable()
export class WebSocketService  {
  public subject: WebSocketSubject<Frame|ArrayBuffer>;
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
    console.log('WebSocketService created!');
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
      console.log('creating new WebSocket Connection');
      try {
        this.subject = webSocket({
          url: this.getWsUrl(),
          deserializer: function (e: MessageEvent) { console.log('deserializer'); return JSON.parse(e.data); },
          serializer: function (value: Frame | ArrayBuffer) {
            if (value instanceof ArrayBuffer) {
              console.log('serializer of FileUpload');
              return value;
            } else {
              console.log('serializer', value);
              return JSON.stringify(value);
            }
          },
        });
      } catch (e) {
        console.error('Error during websocket connection setup', e);
      }
      this.subject.subscribe(
        (frameFromServer: Frame) => {
          this.live = true;
          this.status.next(this.live);
          console.log('ws svc raw ffs', frameFromServer);

          if (frameFromServer.data && typeof frameFromServer.data === 'string') {
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

  unsubscribe() {
    return this.subject.unsubscribe();
  }

  /**
   * Send Frame to the server
   * @param f
   */
  next(f: Frame | ArrayBuffer) {
    if (!this.subject) {
      this.create();
    }
    if (f instanceof ArrayBuffer) {
      // we don't have to do anything here
    } else {
      if (typeof f['requestId'] === 'undefined') {
        f.requestId = '';
      }
      if (f.requestId === '') {
        f.requestId = this.createRequestId();
      }
      f.data = JSON.stringify(f.data);
    }
    return this.subject.next(f);
  }

  createRequestId(): string {
    function randoms(): string {
      return Math.random().toString(36).substring(2, 8);
    }
    return (randoms() + randoms() + randoms()).substr(0, 16);
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
  CommentTyping = 'CommentTyping',
  ResetPassword = 'ResetPassword',
  CallInit = 'CallInit',
  CallStop = 'CallStop',
  CallCandidate = 'CallCandidate',
  CallLocalDescription = 'CallLocalDescription',
  User = 'User',
  File = 'Upload',
  CancelUpload = 'CancelUpload',
}

export interface Frame {
  type: FrameType;
  data: any;
  requestId?: string;
}
