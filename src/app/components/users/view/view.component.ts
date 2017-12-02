import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import {FrameType, WebSocketService} from '../../../services/ws.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'lr-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.styl']
})
export class UserViewComponent implements OnInit {

  userInfo: User;
  user$: Observable<User>;

  slug: string;
  constructor(private userService: UserService, private webSocketService: WebSocketService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.user$ = this.route.paramMap
      .switchMap((params: ParamMap) =>
        this.userService.getUserInfo(params.get('slug')));
  }

}
