import {Component, Input, OnInit} from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { AuthData } from '../../../models/authData';
import {FrameType, WebSocketService} from '../../../services/ws.service';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'lr-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.styl']
})


export class SigninComponent implements OnInit {

  @Input()
  authData: AuthData = {
    email: '',
    password: '',
    rememberMe: true,
  };

  submitted = false;
  disabled = false;

  user?: User;
  message: string;

  constructor(private userService: UserService, private webSocketService: WebSocketService) { }

  getUser(): void {
    this
      .userService
      .getUser()
      .subscribe(user => {
        this.user = user;
        console.log('signin userService getUser', user);
      });
  }

  signOut() {
    this.userService.signOut();
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.authData);
    this
      .userService
      .authorize(this.authData)
      .subscribe(authorizationResponse => {
        if (authorizationResponse.success) {
          //
        } else {
          this.message = authorizationResponse.message;
          this.submitted = false;
          this.authData.password = '';
        }

        console.log('signin userService getUser', authorizationResponse);
      });
  }

  ngOnInit() {
    this.submitted = false;
    this.disabled = !this.webSocketService.isOpen();
    this.message = '';
    this.getUser();
  }

}
