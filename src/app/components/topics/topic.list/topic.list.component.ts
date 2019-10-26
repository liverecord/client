import { Component, OnInit } from '@angular/core';
import {TopicService} from '../../../services/topic.service';
import {Observable} from 'rxjs';
import {Topic} from '../../../models/topic';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import { switchMap } from 'rxjs/internal/operators';
import { FrameType, WebSocketService } from '../../../services/ws.service';
import { Comment } from '../../../models/comment';

@Component({
  selector: 'lr-topic-list',
  templateUrl: './topic.list.component.html',
  styleUrls: ['./topic.list.component.styl']
})
export class TopicListComponent implements OnInit {
  topics: Topic[];
  topicsObservable: Observable<Topic[]>;
  category: string;
  activeTopicSlug: string;
  activeCategorySlug: string;
  activeFilter: string;
  topicsSearchTermField: FormControl;

  filters = {
    page: '1',
    term: '',
    section: 'newTopics',
    category: '-'
  };

  constructor(
    private webSocketService: WebSocketService,
    private topicService: TopicService,
    private route: ActivatedRoute,
    private router: Router) {
    this.topics = [];
    this.activeTopicSlug = '';
    this.activeCategorySlug = '-';
    this.activeFilter = '';
  }

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
    return t.acl && t.acl.length > 0;
  }

  isSection(name: string) {
    return this.filters.section === name;
  }

  prepareFilters(section: string) {
    const filters = { ...this.filters};
    filters.section = section;
    return filters;
  }

  filterTopics(topics: Topic[]) {
    this.topics = topics.filter((topic) => {
      if (this.activeCategorySlug.length > 0) {
        return topic.category.slug === this.activeCategorySlug || this.activeCategorySlug === '-';
      }
      return true;
    });
  }

  ngOnInit() {
    this.filters.section = 'newTopics';

    this.topicsSearchTermField = new FormControl('');
    this.topicsSearchTermField
      .valueChanges
      .subscribe(term => {
        this.filters.term = term;
        this.router.navigate(
          [this.activeCategorySlug, this.activeTopicSlug],
          {
            queryParams: this.filters
          }
        );
      });

    this.topicsObservable = this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.activeCategorySlug = this.filters.category = params.get('category') || '';
          return this.topicService.getTopics(this.filters);
        })
      );

    this.topicsObservable.subscribe((topics) => {
      this.filterTopics(topics);
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
      this.filters.category = this.activeCategorySlug = next.get('category') || '';
    });


    this.webSocketService.subscribe(frame => {
      console.log('topic list!', frame.type);
      if (frame.type === FrameType.CommentSave) {
        const comment = <Comment>Comment.fromObject(frame.data);
        this.topics = this.topics.map((topic) => {
          if (comment.topicId === topic.id) {
            console.log('topic.user.id', topic.user.id, 'comment.user.id', comment.user.id);
            if (this.activeTopicSlug === topic.slug) {
              topic.unreadComments = 0;
            } else {
              topic.unreadComments += 1;
            }
          }
          return topic;
        });
      }
    });
  }
}
