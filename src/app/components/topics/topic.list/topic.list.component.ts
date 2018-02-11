import { Component, OnInit } from '@angular/core';
import {TopicService} from '../../../services/topic.service';
import {Observable} from 'rxjs/Observable';
import {Topic} from '../../../models/topic';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {map} from 'rxjs/operators/map';

@Component({
  selector: 'lr-topic-list',
  templateUrl: './topic.list.component.html',
  styleUrls: ['./topic.list.component.styl']
})
export class TopicListComponent implements OnInit {

  constructor(private topicService: TopicService, private route: ActivatedRoute) { }

  topics: Observable<Topic[]>;
  category: string;

  trackById(i, v) {
    return v.id;
  }

  selectTopic(t: Topic) {
    t.active = true;
  }

  ngOnInit() {

    this.topics = this.route.queryParamMap
      .switchMap((params: ParamMap) =>
        this.topicService.getTopics({
          category: params.get('category')
        }));

   // this.category = this.route.snapshot.params['category'];

    this.route.queryParamMap.subscribe(next => {
      this.category = next.get('category');
    });
/*
    this.route.queryParamMap.subscribe(next => {
      this.categoryService.setActive(next.get('category'));
    });*/
  }

}
