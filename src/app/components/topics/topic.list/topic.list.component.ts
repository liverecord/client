import { Component, OnInit } from '@angular/core';
import {TopicService} from '../../../services/topic.service';
import {Observable} from 'rxjs/Observable';
import {Topic} from '../../../models/topic';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {map} from 'rxjs/operators/map';
import {FormControl} from '@angular/forms';
import {copyObj} from '@angular/animations/browser/src/util';

@Component({
  selector: 'lr-topic-list',
  templateUrl: './topic.list.component.html',
  styleUrls: ['./topic.list.component.styl']
})
export class TopicListComponent implements OnInit {
  constructor(private topicService: TopicService, private route: ActivatedRoute, private router: Router) { }

  topics: Observable<Topic[]>;
  category: string;
  activeTopicSlug: string;
  activeFilter: string;
  topicsSearchTermField: FormControl;

  filters = {
    page: '1',
    term: '',
    section: 'newTopics',
    category: ''
  };

  search() {
    //
  }

  trackById(i, v) {
    return v.id;
  }

  selectTopic(t: Topic) {
    t.active = true;
  }
  isTopicActive(t: Topic) {
    return this.activeTopicSlug === t.slug;
  }

  isTopicPrivate(t: Topic) {
    return t.acl && t.acl.length === 0;
  }

  isSection(name: string) {
    return this.filters.section === name;
  }

  prepareFilters(section: string) {
    const filters = { ...this.filters};
    filters.section = section;
    return filters;
  }

  ngOnInit() {
    this.filters.section = 'newTopics';

    this.topicsSearchTermField = new FormControl('');
    this.topicsSearchTermField
      .valueChanges
      .subscribe(term => {
        this.filters.term = term;
        this.router.navigate(
          ['topics', this.activeTopicSlug],
          {
            queryParams: this.filters
          }
        );
      });

    this.topics = this.route.queryParamMap
      .switchMap((params: ParamMap) => {
          this.filters.category = params.get('category') || '';
          return this.topicService.getTopics(this.filters);
      });

    this.route.queryParamMap.subscribe(next => {
      this.filters.category = next.get('category') || '';
      this.filters.section = next.get('section') || 'newTopics';
      this.filters.page = next.get('page') || '1';
      this.filters.term = next.get('term') || '';
      this.topicService.getTopics(this.filters);
    });

    this.route.paramMap.subscribe(next => {
      this.activeTopicSlug = next.get('slug') || '';
    });
  }
}
