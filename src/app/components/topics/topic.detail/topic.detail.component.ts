import { Component, OnInit } from '@angular/core';
import {TopicService} from '../../../services/topic.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {Topic} from '../../../models/topic';

@Component({
  selector: 'lr-topic-detail',
  templateUrl: './topic.detail.component.html',
  styleUrls: ['./topic.detail.component.styl']
})
export class TopicDetailComponent implements OnInit {

  topic: Topic;

  constructor(private topicService: TopicService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParamMap
      .switchMap((params: ParamMap) => {
        return this.topicService.getTopic(params.get('slug'));
      }).subscribe(next => {
        this.topic = next;
    });

  }
}
