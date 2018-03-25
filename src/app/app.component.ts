import { Component } from '@angular/core';
import {FrameType, WebSocketService} from './services/ws.service';
import {UserService} from './services/user.service';

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
    disconnected: false,
    connected: false
  };
  title = 'lr';
  theme = 'default';

  constructor (private webSocketService: WebSocketService, protected userService: UserService) {

    webSocketService.status.subscribe((v) => {
      console.log('status', v);
      this.appClass.connected = v;
      this.appClass.disconnected = !v;
    });
  }

  setWsStatus() {
    console.log('connected', this.appClass.connected);
  }

}
