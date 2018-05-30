import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
  Output,
  AfterViewInit,
} from '@angular/core';
import { TopicService } from '../../../services/topic.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EditableTopic, Topic } from '../../../models/topic';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { UploadFile } from '../../../models/file';
import { Comment } from '../../../models/comment';
import { Frame, FrameType, WebSocketService } from '../../../services/ws.service';
import { StorageService } from '../../../services/storage.service';
import { switchMap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/internal/operators';

@Component({
  selector: 'lr-topic-detail',
  templateUrl: './topic.detail.component.html',
  styleUrls: ['./topic.detail.component.styl'],
})
export class TopicDetailComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() topicSubject = new EventEmitter<Topic>();

  topic: Topic;
  user: User;
  typists: User[];
  sending: boolean;
  sendButtonActive: boolean;
  topicDetailsBlockHeight: string;
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
              private userService: UserService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.sending = false;
    this.sendButtonActive = false;
    this.advancedCompose = false;
    this.topicDetailsBlockHeight = '90vh';
  }


  ngOnInit() {
    this.topicAbsoluteUrl = encodeURIComponent(window.location.toString());
    this.comment = new Comment();
    this.user = new User();
    this.comments = [];
    this.preparedComments = [];
    this.typists = [];
    this.requestId = 'ttt';
    this.pagination = {
      page: 1,
      pages: 1,
      limit: 1,
      total: 0,
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
      .pipe(
        switchMap((params: ParamMap) => this.topicService.getTopic(params.get('slug'))),
      ).subscribe((topic: Topic) => {

      this.comments = [];

      this.topic = topic;
      this.topicSubject.emit(topic);
      this.comment.topic = this.topic;
      this.comment.topicId = this.topic.id;
      this.titleService.setTitle(topic.title);
      this.comment.body = '';
      this.loadDraft();
      this.sendButtonActive = true;

      this.topicAbsoluteUrl = encodeURIComponent(
        window.location.protocol + '//' +
        window.location.host + '/' + this.topic.category.slug + '/' + this.topic.slug,
      );
    });

    this.webSocketService.subscribe(frame => {
      let scroll = false;
      let comments = this.comments;
      switch (frame.type) {
        case FrameType.CommentList:
          frame.data.map((item) => {
            return Comment.fromObject(item);
          });
          comments = this.comments.concat(frame.data);
          scroll = true;
          break;
        case FrameType.Comment:
        case FrameType.CommentSave:
          comments.push(<Comment>Comment.fromObject(frame.data));
          if (frame.requestId === this.requestId) {
            this.discardDraft();
            this.resetComment();
          }
          scroll = true;
          break;
      }
      comments
        .filter((comment: Comment) => {
          if (comment.topicId === this.topic.id) {
            return comment;
          }
        })
        .sort((a, b: Comment) => {
          if (a.createdAt.getTime() === b.createdAt.getTime()) {
            return a.id > b.id ? 1 : -1;
          } else {
            return a.createdAt.getTime() > b.createdAt.getTime() ? 1 : -1;
          }
        });
      comments.reduce((acc, currentComment: Comment, commentIndex: number) => {
        const accumulatedCommentIds = acc.map(c => c.id);
        const foundCommentIndex = accumulatedCommentIds.indexOf(currentComment.id);
        if (foundCommentIndex > -1) {
          if (acc[foundCommentIndex].updatedAt.getTime() < currentComment.updatedAt.getDate()) {
            acc[foundCommentIndex] = currentComment;
          }
        } else {
          acc.push(currentComment);
        }
        return acc;
      }, []);
      this.comments = comments;
      if (scroll) {
        setTimeout(() => this.scrollToTheEnd(), 200);
      }
      this.updateTopicHeight();
    });
  }


  /**
   * DOM is getting ready at this stage
   */
  ngAfterViewInit() {
    fromEvent(window, 'resize').pipe(
      debounceTime(100),
    ).subscribe(() => {
      this.updateTopicHeight();
    });
  }

  scrollToTheEnd() {
    this.updateTopicHeight();
    const anchor = document.getElementById('topicAnchor');
    if (anchor) {
      anchor.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});
    }
  }

  loadOlderComments() {

  }

  vote(comment: Comment, action: string) {
    //
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
    setTimeout(() => {
      this.sending = false;
      this.updateTopicHeight();
    }, 200);

    this.focusEditor();
  }

  focusEditor() {
    const editor = document.querySelector('div.editor');
    if (editor instanceof HTMLElement) {
      editor.focus();
    }
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
    this.updateTopicHeight();
  }

  sendComment() {
    if (this.user && this.user.id > 0) {
      if (!this.sending) {
        this.sending = true;
        this.topicService.saveComment(this.comment, this.requestId);
      }
    } else {
      alert('You have to sign-in first');
    }
  }

  ngOnDestroy() {
    this.comments = [];
  }

  updateTopicHeight() {
    setTimeout(() => {
      const composeEl = document.querySelector('lr-editor');
      const headerEl = document.querySelector('lr-header');
      const topicCont = document.querySelector('div.topic-details');
      if (topicCont && composeEl && headerEl) {
        const topicDetailsBlockHeight = (
          window.innerHeight - composeEl.clientHeight - headerEl.clientHeight - 2
        ) + 'px';
        if (topicDetailsBlockHeight !== this.topicDetailsBlockHeight) {
          this.topicDetailsBlockHeight = topicDetailsBlockHeight;
          this.changeDetectorRef.markForCheck();
        }
      }
    }, 10);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.keyCode === 13) {
        this.sendComment();
      }
    }
    this.updateTopicHeight();
  }
}

