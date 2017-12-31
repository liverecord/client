import { Component } from '@angular/core';
import {FrameType, WebSocketService} from './services/ws.service';

@Component({
  selector: 'lr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  connected = false;
  appClass = {
    'root': true,
    'flex-column': true,
    'default': true,
    connected: false
  };
  constructor (private webSocketService: WebSocketService) {
    // this.appClass.connected = this.webSocketService.isOpen();
  }

  title = 'lr';
  theme = 'default';

}
