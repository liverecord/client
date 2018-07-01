import { Component, Input, OnInit} from '@angular/core';
import {EditableTopic, Topic} from '../../../models/topic';
import {CategoryService} from '../../../services/category.service';
import {Category} from '../../../models/category';
import {Observable,  Subject } from 'rxjs';
import {User} from '../../../models/user';
import {StorageService} from '../../../services/storage.service';
import {UserService} from '../../../services/user.service';
import {TopicService} from '../../../services/topic.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'lr-topic-edit',
  templateUrl: './topic.edit.component.html',
  styleUrls: ['./topic.edit.component.styl']
})
export class TopicEditComponent implements OnInit {

  @Input()
  topic: EditableTopic = {
    category: <Category>{id: 0, name: 'not selected', slug: ''},
    acl: [],
    private: false,
    title: '',
    body: '',
    slug: '',
    order: 0,
    id: null
  };

  userSearchTerm = '';

  userSearchTermField: FormControl;
  isEditing = false;
  submitted = false;
  disabled = false;
  sendButtonActive = true;
  userSearchActive = false;
  showSearchResults = false;
  focusedAclUser?: User;

  categoriesObservable: Subject<Category[]>;
  categories: Category[];
  searchResults: User[];
  cachedSearchResults: User[];
  topicEditForm: FormGroup;


  constructor(public categoryService: CategoryService,
              private route: ActivatedRoute,
              private router: Router,
              private store: StorageService,
              private userService: UserService,
              private titleService: Title,
              private topicService: TopicService) {
    this.categoryService.getCategories().subscribe(c => this.categories = c);

    this.userService.getUser(true).subscribe(u => {
      this.topic.user = u;
    });
  }

  ngOnInit() {
    this.titleService.setTitle('✎');

    this.categoryService.next();
    this.cachedSearchResults = [];
    this.focusedAclUser = null;
    this.userService.getUsers(null).subscribe((users) => {
      this.cachedSearchResults = users;
      this.updateSearchResults();
    });
    this.loadDraft();

    this.userSearchTermField = new FormControl('');
    this.userSearchTermField
      .valueChanges
      .subscribe(term => {
        this.runSearch(term);
      });

    this
      .route
      .paramMap
      .pipe(
        switchMap((params: ParamMap) => this.topicService.getTopic(params.get('slug')))
      ).subscribe((topic: Topic) => {

      if (this.route.snapshot.params['slug'] === topic.slug) {
        this.topic = topic;
        this.isEditing = true;
        this.titleService.setTitle('✎ ' + topic.title);
      }
    });
  }
  cancel() {
   if (this.isEditing) {
     this.router.navigate([this.topic.category.slug + '/' + this.topic.slug]);
   } else {
     this.router.navigate(['/']);
   }
  }
  loadDraft() {
    if (!this.topic.id) {
      const topic = this.store.get(this.sid());
      if (topic) {
        this.topic = Object.assign(new Topic(), topic);
      }
    }
  }
  saveDraft() {
    this.store.set(this.sid(), this.topic);
  }

  discardDraft() {
    this.store.remove(this.sid());
  }

  private updateSearchResults() {
    this.searchResults = this.cachedSearchResults.filter(user => {
      return !this.inArray(user, this.topic.acl);
    });
    this.showSearchResults = this.searchResults.length > 0 && this.userSearchActive;
    if (!this.focusedAclUser && this.searchResults.length > 0) {
      this.focusedAclUser = this.searchResults[0];
    }
  }

  showSearch() {
    this.userSearchActive = true;
    this.runSearch();
  }

  hideSearch() {
    this.userSearchActive = false;
    setTimeout(() => this.updateSearchResults(), 200);
  }

  userSearchKeyDown($event) {
    console.log($event);
    let index = this.searchResults.indexOf(this.focusedAclUser);
    switch ($event.keyCode) {
      case 38: // up
        index--;
        if (index < 0) {
          index = this.searchResults.length - 1;
        }
        $event.preventDefault();
        break;
      case 40: // down
        index++;
        if (index > this.searchResults.length - 1) {
          index = 0;
        }
        $event.preventDefault();
        break;
      case 13: // Enter
        this.addToAcl(this.focusedAclUser);
        $event.preventDefault();
        break;
      case 27: // Escape
        this.hideSearch();
        break;
      case 8: // Backspace
        if (this.userSearchTermField.value === '') {
          this.topic.acl.pop();
        }
        break;
    }
    if (index !== -1 &&  this.searchResults[index]) {
      this.focusedAclUser = this.searchResults[index];
    } else {
      this.runSearch();
    }
    try {
      setTimeout(() => {
        const el = document.querySelector('.acl-list-box .focus img');
        if (el) {
          el.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
        }
      }, 100);
    } catch (e) {
      //
    }
  }

  formUpdate(e) {
    console.log(e, this.topicEditForm);
  }

  onSubmit() {
    // topicEditForm
    this.saveDraft();
    if (this.sendButtonActive === true) {
      this.sendButtonActive = false;
      this.topicService
        .saveTopic(this.topic)
        .subscribe(t => {
        this.discardDraft();
        this.topic = t;
        this.sendButtonActive = true;
        this.router.navigate([t.category.slug + '/' + t.slug]);
      });
    }
  }

  docClick() {
    //
  }

  trackById(i, v) {
    return v.id;
  }

  private sid(): string {
    if (this.topic.id) {
      return 'topic' + this.topic.id + 'Draft';
    } else {
      return 'topic0Draft';
    }
  }


  runSearch(term = null) {
    const options = {
      term: term || this.userSearchTermField.value,
      exclude: this.topic.acl.reduceRight((a, u: User) => {
        a.push(u.id);
        return a;
      }, [])
    };
    this.userService
      .getUsers(options);
  }

  setAclFocus(item: User) {
    this.focusedAclUser = item;
  }

  isFocused(item: User): boolean {
    return this.focusedAclUser.id === item.id;
  }

  addToAcl(user: User) {
    if (!this.inArray(user, this.topic.acl)) {
      this.topic.acl.push(user);
    }
    this.updateSearchResults();
    this.saveDraft();
  }

  inArray(user: User, arr: User[]): boolean {
    return arr.some(item => {
      return item.id === user.id;
    });
  }

  protected compareById(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  removeFromAcl(user: User) {
    this.topic.acl = this.topic.acl.filter(item => user.id !== item.id);
    this.updateSearchResults();
    this.saveDraft();
  }

}
