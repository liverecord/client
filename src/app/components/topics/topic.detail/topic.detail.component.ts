import {Component, OnDestroy, OnInit} from '@angular/core';
import {TopicService} from '../../../services/topic.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {EditableTopic, Topic} from '../../../models/topic';
import {Title} from '@angular/platform-browser';
import {UserService} from '../../../services/user.service';
import {User} from '../../../models/user';
import {Comment} from '../../../models/comment';
import {FrameType, WebSocketService} from '../../../services/ws.service';
import {StorageService} from '../../../services/storage.service';

@Component({
  selector: 'lr-topic-detail',
  templateUrl: './topic.detail.component.html',
  styleUrls: ['./topic.detail.component.styl']
})
export class TopicDetailComponent implements OnInit, OnDestroy {

  topic: Topic;
  user: User;
  typists: User[];
  sending: boolean;
  sendButtonActive: boolean;
  advancedCompose: boolean;
  comment: Comment;
  comments: Comment[];
  preparedComments: Comment[];
  topicAbsoluteUrl: string;
  requestId: string;
  pagination: {
    page: 1,
    pages: 1,
    limit: 1,
    total: 0
  };

  constructor(private topicService: TopicService,
              private route: ActivatedRoute,
              private titleService: Title,
              private store: StorageService,
              private webSocketService: WebSocketService,
              private userService: UserService) {
    this.sending = false;
    this.sendButtonActive = false;
    this.advancedCompose = false;
  }

  ngOnInit() {
    this.topicAbsoluteUrl = encodeURIComponent(window.location.toString());
    this.comment = new Comment();
    this.comments = [];
    this.preparedComments = [];
    this.typists = [];
    this.requestId = 'ttt';
    this.pagination = {
      page: 1,
        pages: 1,
        limit: 1,
        total: 0
    };
    this
      .userService
      .getUser()
      .subscribe((user: User) => {
      this.user = user;
      this.comment.user = this.user;
    });
    this.comment.body = '';

    this
      .route
      .paramMap
      .switchMap((params: ParamMap) => {
        return this.topicService.getTopic(params.get('slug'));
      }).subscribe((topic: Topic) => {
        this.comments = [];

        this.topic = topic;
        this.comment.topic = this.topic;
        this.titleService.setTitle(topic.title);
        this.comment.body = '';
        this.loadDraft();
        this.sendButtonActive = true;

        this.topicAbsoluteUrl = encodeURIComponent(window.location.hostname + '/topics/' + this.topic.slug);
    });

    this.webSocketService.subscribe(frame => {

      switch (frame.type) {
        case FrameType.CommentList:
          frame.data.map((item) => {
            return Comment.fromObject(item);
          });
          this.comments = this.comments.concat(frame.data);
          break;
        case FrameType.Comment:
        case FrameType.CommentSave:
          this.comments.push(<Comment>Comment.fromObject(frame.data));
          if (frame.requestId === this.requestId) {
            this.discardDraft();
            this.resetComment();
          }
          break;
      }
      this.comments = this.comments.sort((a, b: Comment) => {
        return a.createdAt === b.createdAt ? 0 : (a.createdAt > b.createdAt ? 1 : -1);
      }).filter((comment: Comment) => {
        if (comment.topic.id === this.topic.id) {
          return comment;
        }

      });
    });
  }

  loadOlderComments() {

  }

  loadDraft() {
    if (!this.topic.id) {
      const comment = this.store.get(this.sid());
      if (comment) {
        this.comment.body = comment;
      }
    }
  }

  saveDraft() {
    this.store.set(this.sid(), this.comment.body);
  }

  discardDraft() {
    this.store.remove(this.sid());
  }

  resetComment() {
    this.comment.body = '';
    this.sending = false;
  }

  private sid(): string {
    if (this.topic && this.topic.id) {
      return 'topicComment' + this.topic.id + 'Draft';
    } else {
      return 'topicComment0Draft';
    }
  }
  switchAdvancedCompose() {
    this.advancedCompose = !this.advancedCompose;
  }

  sendComment() {
    if (!this.sending) {
      this.sending = true;
      this.topicService.saveComment(this.comment, this.requestId);
    }
  }

  ngOnDestroy() {
    this.comments = [];
  }
}
