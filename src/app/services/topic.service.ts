import { Injectable } from '@angular/core';
import {WebSocketService} from './ws.service';

@Injectable()
export class TopicService {

  constructor(private webSocketService: WebSocketService) { }


}
