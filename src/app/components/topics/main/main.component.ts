import { Component, OnInit } from '@angular/core';
import {WebSocketService} from '../../../services/ws.service';
import { Topic } from '../../../models/topic';

@Component({
  selector: 'lr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {
  public connected: boolean;
  public topic: Topic;
  constructor(protected webSocketService: WebSocketService) {
    this.connected = false;
  }

  topicSelected(t) {
    this.topic = t;
  }

  ngOnInit() {
    this.webSocketService.status.subscribe((v) => {
      this.connected = v;
    });
  }

}
