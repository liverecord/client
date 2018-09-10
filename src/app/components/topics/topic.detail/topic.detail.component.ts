import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { TopicService } from '../../../services/topic.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Topic } from '../../../models/topic';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { Comment } from '../../../models/comment';
import { FrameType, WebSocketService } from '../../../services/ws.service';
import { StorageService } from '../../../services/storage.service';
import { switchMap } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';
import animations from './topic.detail.animations';

const TYPISTS_TIMEOUT = 10000;

@Component({
  selector: 'lr-topic-detail',
  templateUrl: './topic.detail.component.html',
  styleUrls: ['./topic.detail.component.styl'],
  animations: animations
})
export class TopicDetailComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() topicSubject = new EventEmitter<Topic>();

  topic: Topic;
  user: User;
  sending: boolean;
  sendButtonActive: boolean;
  topicDetailsBlockHeight: string;
  advancedCompose: boolean;
  comment: Comment;
  comments: Comment[];
  preparedComments: Comment[];
  topicAbsoluteUrl: string;
  requestId: string;
  loading: boolean;
  pagination: {
    page: number,
    pages: number,
    limit: number,
    total: number,
    left: number
  };
  typing$: Subject<Event>;
  typists: User[];
  typistsTimeouts: number[];

  constructor(private topicService: TopicService,
              private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              private store: StorageService,
              private webSocketService: WebSocketService,
              private userService: UserService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.topic = null;
    this.loading = false;
    this.sending = false;
    this.sendButtonActive = false;
    this.advancedCompose = false;
    this.topicDetailsBlockHeight = '90vh';
    this.pagination = <any>{
      page: <number>1,
      pages: <number>1,
      limit: <number>1,
      total: <number>0,
      left: <number>0
    };
    this.comment = new Comment();
    this.user = new User();
    this.comments = [];
    this.preparedComments = [];
    this.requestId = 'ttt';
    this.typists = [];
    this.typistsTimeouts = [];
    this.typing$ = new Subject<Event>();
  }

  ngOnInit() {
    this.topicAbsoluteUrl = encodeURIComponent(window.location.toString());
    this
      .userService
      .getUser(true)
      .subscribe((user: User) => {
        this.user = user;
        this.comment.user = this.user;
      });
    this.comment.body = '';

    this
      .route
      .paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.loading = true;
          this.topic = null;
          this.comments = [];
          return this.topicService.getTopic(params.get('slug'));
        }),
      ).subscribe((topic: Topic) => {
      this.saveDraft();
      this.comments = [];

      this.topic = topic;
      this.topicSubject.emit(topic);
      this.comment.topic = this.topic;
      this.comment.topicId = this.topic.id;
      this.titleService.setTitle(topic.title);
      this.comment.body = '';
      this.loadDraft();
      this.sendButtonActive = true;
      this.loading = false;
      if (this.topic && this.topic.category) {
        this.topicAbsoluteUrl = encodeURIComponent(
          window.location.protocol + '//' +
          window.location.host + '/' + this.topic.category.slug + '/' + this.topic.slug,
        );
      }
    });

    this.webSocketService.subscribe(frame => {
      let scroll = false;
      let comments = this.comments;
      switch (frame.type) {
        case FrameType.CommentList:
          frame.data.comments.map((item) => {
            return Comment.fromObject(item);
          });
          comments = this.comments.concat(frame.data.comments);
          this.pagination = frame.data.pagination;
          this.pagination.pages = Math.round(Math.ceil(this.pagination.total / this.pagination.limit));
          this.pagination.left = this.pagination.total - this.pagination.limit * this.pagination.page;
          this.pagination.left = this.pagination.left < 0 ? 0 : this.pagination.left;
          scroll = true;
          break;
        case FrameType.Comment:
        case FrameType.CommentSave:
          const comment = <Comment>Comment.fromObject(frame.data);
          comments.push(comment);
          if (this.typistsTimeouts[comment.user.id]) {
            window.clearTimeout(this.typistsTimeouts[comment.user.id]);
          }
          this.typists = this.typists.filter((t) => t.id !== comment.user.id);
          if (frame.requestId === this.requestId) {
            this.discardDraft();
            this.resetComment();
          }
          scroll = true;
          break;
        case FrameType.CommentTyping:
          if (this.topic.id === frame.data.topicId) {
            const typist = <User>frame.data.user;
            const typistIds = this.typists.map(c => c.id);
            if (!typistIds.includes(typist.id)) {
              this.typists.push(typist);
            }
            if (this.typistsTimeouts[typist.id]) {
              window.clearTimeout(this.typistsTimeouts[typist.id]);
            }
            this.typistsTimeouts[typist.id] = window.setTimeout(() => {
              this.typists = this.typists.filter((t) => t.id !== typist.id);
            }, TYPISTS_TIMEOUT);
            console.log('typistx', this.typists);
          }
          break;
      }
      comments = comments
        .filter((comment: Comment) => {
          if (comment.topicId === this.topic.id) {
            return comment;
          }
          return false;
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
      debounceTime(40),
    ).subscribe(() => {
      this.updateTopicHeight();
    });
    this.typing$.pipe(
      debounceTime(100)
    ).subscribe(() => {
      this.webSocketService.next({
        type: FrameType.CommentTyping,
        data: {
          topicId: this.topic.id,
          typist: this.user.id
        }
      });
    });
  }

  scrollToTheEnd() {
    this.updateTopicHeight(() => {
      const anchor = document.getElementById('topicAnchor');
      if (anchor) {
        anchor.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});
      }
    });
  }

  loadOlderComments() {
    this.webSocketService.next({
      type: FrameType.CommentList,
      data: {
        topicId: this.topic.id,
        page: this.pagination.page + 1
      }
    });
  }

  vote(comment: Comment, action: string) {
    //
  }

  loadDraft() {
    if (this.topic.id) {
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
    } else if (confirm('Commenting is for project members only. Would you like to join?')) {
      this.userService.redirectUrl = this.route.snapshot.url.join('/');
      this.router.navigate(['users', 'login']);
    }
  }

  ngOnDestroy() {
    this.comments = [];
    console.log('Topic Details ngOnDestroy');
  }

  updateTopicHeight(callback = null) {
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
      if (callback) {
        callback();
      }
    }, 10);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e) {
    if (
      this.store.get('sendCommentsCtrl') === 'Enter' && !e.shiftKey ||
      this.store.get('sendCommentsCtrl') !== 'Enter' && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
      if (e.keyCode === 13) {
        this.sendComment();
      }
    } else {
      this.typing$.next(e);
    }
    this.updateTopicHeight();
  }
}

