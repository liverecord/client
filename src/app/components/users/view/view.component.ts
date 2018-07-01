import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import {FrameType, WebSocketService} from '../../../services/ws.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {Observable} from 'rxjs';
import { switchMap} from 'rxjs/internal/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'lr-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.styl']
})
export class UserViewComponent implements OnInit {

  userInfo: User;
  user$: Observable<User>;

  slug: string;
  constructor(private userService: UserService,
              private webSocketService: WebSocketService,
              private route: ActivatedRoute,
              private titleService: Title) {

  }

  ngOnInit() {
    this.titleService.setTitle('Settings');

    this.user$ = this
      .route
      .paramMap
      .pipe(
        switchMap((params: ParamMap) => this.userService.getUserInfo(params.get('slug')))
      );

    this.user$.subscribe((u) => this.titleService.setTitle(u.name));
  }

}
