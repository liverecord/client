import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable ,  of ,  Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthData } from '../models/authData';
import { FrameType, WebSocketService, Frame } from './ws.service';
import { Storages, StorageService } from './storage.service';
import { Router } from '@angular/router';
import { Comment } from '../models/comment';

@Injectable()
export class UserService {

  public authorized: boolean;
  public redirectUrl: string;
  user: User;
  userSubject?: Subject<User>;

  authorizationResponse = {
    message: '',
    success: false
  };

  rememberMe = true;

  constructor(private store: StorageService, private webSocketService: WebSocketService, private router: Router) {
    this.user = new User();
    this.authorized = this.isAuthorized();
    this.userSubject = new Subject<User>();
    this.webSocketService.subscribe(
      frame => {
        // console.log('data', frame);

        switch (frame.type) {
          case FrameType.Auth:
            if (frame.data.jwt) {
              // store token
              this.saveToken(frame.data.jwt);
            }
            if (frame.data.user) {
              this.setUser(
                User.fromObject(frame.data.user)
              );

              this.authorized = this.isAuthorized();
              this.authorizationResponse.success = true;
              if (this.redirectUrl) {
                this.router.navigate([this.redirectUrl]);
                this.redirectUrl = null;
              }
            }
            // console.log('frame.data', frame.data);
            break;
          case FrameType.AuthError:
            this.authorizationResponse.message = frame.data.message;
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


  public isAuthorized(): boolean {
    return this.user.id > 0;
  }

  setUser(user: User) {
    for (const k in user) {
      if (k in user) {
        this.user[k] = user[k];
      }
    }
    this.userSubject.next(this.user);
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

  getUser(remind?: boolean): Subject<User> {
    if (remind) {
      setTimeout(() => { this.userSubject.next(this.user); }, 50);
    }
    return this.userSubject;
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
    this.setUser(new User());
    // this.user = {...this.emptyUser};
    this.store.remove('jwt');
  }

  authUser(authData: AuthData): void {
    this.user.name = authData.email;
  }

  saveToken(jwt) {
    this.store.set('jwt', jwt);
  }

  restorePasswordSubscription(): any {
    return this
      .webSocketService
      .subject
      .pipe(
        filter(frame => 'type' in frame && frame.type === FrameType.ResetPassword)
      );
  }
  restorePassword(email: any) {
    this.webSocketService.next({
      type: FrameType.ResetPassword,
      data: email
    });
  }


  updateUser(user: User, requestId: string) {
    const {
      id,
      email,
      name,
      gender,
      about,
      settings
    } = user;
    this.webSocketService.next({
      type: FrameType.UserUpdate,
      data: {
        id,
        email,
        name,
        gender,
        about,
        settings
      },
      requestId: requestId
    });
  }
}
