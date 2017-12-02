import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import {FrameType, WebSocketService} from '../../../services/ws.service';

@Component({
  selector: 'lr-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.styl']
})

export class HeaderComponent implements OnInit {
  user: User;
  isOpen: boolean;

  constructor(private userService: UserService, private webSocketService: WebSocketService) { }

  getUser(): void {
    this
      .userService
      .getUser()
      .subscribe(user => this.user = user);
  }

  ngOnInit() {
    this.isOpen = this.webSocketService.isOpen();
    this.getUser();
  }

}
