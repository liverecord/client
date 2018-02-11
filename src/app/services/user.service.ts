import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable } from 'rxjs/observable';
import { of } from 'rxjs/observable/of';
import { AuthData} from '../models/authData';
import {FrameType, WebSocketService} from './ws.service';
import { Storages, StorageService } from './storage.service';

@Injectable()
export class UserService {

  constructor(private webSocketService: WebSocketService, private store: StorageService) {
    this.init();
  }

  readonly emptyUser: User = Object.freeze({
    id: 0,
    name: '',
    online: false
  });

  user?: User = { ...this.emptyUser};

  authorizationResponse = {
    message: '',
    success: false
  };

  rememberMe = true;

  setUser(user: User) {
    for (const k in user) {
      if (k in user) {
        this.user[k] = user[k];
      }
    }
    console.log('setUser', this.user);
  }

  authorize(authData: AuthData) {
    this.rememberMe = authData.rememberMe;
    if (this.rememberMe) {
      this.store.storageArea = Storages.Local;
    } else {
      this.store.storageArea = Storages.Session;
    }
    this.webSocketService.next({
      type: FrameType.Auth,
      data: authData
    });
    return of(this.authorizationResponse);
  }

  getUser(): Observable<User> {
   return of(this.user);
  }

  getUserInfo(slug: string): Observable<User> {
    this.webSocketService.next({
      type: FrameType.UserInfo,
      data: {slug: slug}
    });
    return Observable.create((observer) => {
      this.webSocketService.subscribe(frame => {
        if (frame.type === FrameType.UserInfo) {
          observer.next(User.fromObject(frame.data));
        }
      });
    });
  }

  getUsers(options?: any): Observable<User[]> {
    if (options !== null) {
      this.webSocketService.next({
        type: FrameType.UserList,
        data: options
      });
      // return;
    }
    return Observable.create((observer) => {
      this.webSocketService.subscribe(frame => {
        if (frame.type === FrameType.UserList) {
          frame.data.map((item) => {
            return User.fromObject(item);
          });
          observer.next(frame.data);
        }
      });
    });
  }

  signOut() {
    this.setUser(this.emptyUser);
    this.user = { ...this.emptyUser};
    this.store.remove('jwt');
  }

  authUser(authData: AuthData): void {
    this.user.name = authData.email;
  }

  saveToken(jwt) {
    this.store.set('jwt', jwt);
  }

  init() {
    //
    this.webSocketService.subscribe(
      frame => {
        console.log('data', frame);

        switch (frame.type) {
          case FrameType.Auth:
            if (frame.data.jwt) {
              // store token
              this.saveToken(frame.data.jwt);
            }
            if (frame.data.user) {
              this.setUser(
                Object.assign(new User, frame.data.user)
              );
              this.authorizationResponse.success = true;
            }
            console.log('frame.data', frame.data);
            break;
          case FrameType.AuthError:
            this.authorizationResponse.message = frame.data;
            this.authorizationResponse.success = false;
            break;
        }
      },
      error => {
        console.log('error', error);
      },
      () => {
        console.log('complete');
      }
    );
  }

}
