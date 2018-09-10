import {Injectable} from '@angular/core';
import {FrameType, WebSocketService} from './ws.service';
import {EditableTopic, Topic} from '../models/topic';
import {User} from '../models/user';
import {Comment} from '../models/comment';
import {Observable} from 'rxjs';

@Injectable()
export class TopicService {
  constructor(private webSocketService: WebSocketService) {
  }

  getTopics(options?: any): Observable<Topic[]> {
    if (options !== null) {
      this.webSocketService.next({
        type: FrameType.TopicList,
        data: options
      });
    }
    return Observable.create((observer) => {
      this.webSocketService.subscribe(frame => {
        if (frame.type === FrameType.TopicList) {
          frame.data.map((item) => {
            return Topic.fromObject(item);
          });
          observer.next(frame.data);
        }
      });
    });
  }

  getTopic(slug?: string): Observable<Topic> {
    if (slug) {
      this.webSocketService.next({
        type: FrameType.Topic,
        data: {slug: slug},
      });
    }
    return Observable.create((observer) => {
      this.webSocketService.subscribe(frame => {
        if (frame.type === FrameType.Topic) {
          observer.next(Topic.fromObject(frame.data));
        }
      });
    });
  }


  saveTopic(topic: Topic): Observable<EditableTopic> {
    this.webSocketService.next({
      type: FrameType.TopicUpdate,
      data: topic,
    });
    return Observable.create((observer) => {
      this.webSocketService.subscribe(frame => {
        if (frame.type === FrameType.TopicUpdate) {
          observer.next(EditableTopic.fromObject(frame.data));
        }
      });
    });
  }

  saveComment(comment: Comment, requestId: string) {
    this.webSocketService.next({
      type: FrameType.CommentSave,
      data: comment,
      requestId: requestId
    });
  }
}
