import { Component, OnInit } from '@angular/core';
import {TopicService} from '../../../services/topic.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {EditableTopic, Topic} from '../../../models/topic';
import {Title} from '@angular/platform-browser';
import {UserService} from '../../../services/user.service';
import {User} from '../../../models/user';
import {Comment} from '../../../models/comment';

@Component({
  selector: 'lr-topic-detail',
  templateUrl: './topic.detail.component.html',
  styleUrls: ['./topic.detail.component.styl']
})
export class TopicDetailComponent implements OnInit {

  topic: Topic;
  user: User;
  sending: boolean;
  sendButtonActive: boolean;
  advancedCompose: boolean;
  comment: Comment;
  topicAbsoluteUrl: string;

  constructor(private topicService: TopicService,
              private route: ActivatedRoute,
              private titleService: Title,
              private userService: UserService) {
    this.sending = false;
    this.sendButtonActive = false;
    this.advancedCompose = false;
  }

  ngOnInit() {
    this.topicAbsoluteUrl = encodeURIComponent(window.location.toString());
    this.comment = new Comment();
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
        this.topic = topic;
        this.titleService.setTitle(topic.title);
        this.topicAbsoluteUrl = encodeURIComponent(window.location.hostname + '/topics/' + this.topic.slug);
    });

  }

  saveDraft() {}

  switchAdvancedCompose() {
    this.advancedCompose = !this.advancedCompose;
  }

  sendComment() {

  }
}
