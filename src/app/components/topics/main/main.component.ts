import { Component, OnInit } from '@angular/core';
import {WebSocketService} from '../../../services/ws.service';
import { Topic } from '../../../models/topic';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'lr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {
  public connected: boolean;
  public topic: Topic;
  public user: User;
  constructor(protected webSocketService: WebSocketService,
              private userService: UserService,
              private titleService: Title) {
    this.connected = false;
    this.titleService.setTitle('LiveRecord');
    userService.getUser().subscribe((u) => this.user = u);
  }

  topicSelected(t) {
    this.topic = t;
    this.titleService.setTitle(t.name);
  }

  ngOnInit() {
    this.webSocketService.status.subscribe((v) => {
      this.connected = v;
    });
  }

}
