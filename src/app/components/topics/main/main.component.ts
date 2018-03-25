import { Component, OnInit } from '@angular/core';
import {WebSocketService} from '../../../services/ws.service';

@Component({
  selector: 'lr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {
  public connected: boolean;
  constructor(protected webSocketService: WebSocketService) {
    this.connected = false;
  }

  ngOnInit() {
    this.webSocketService.status.subscribe((v) => {
      this.connected = v;
    });
  }

}
