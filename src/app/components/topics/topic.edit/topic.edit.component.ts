import {Component, Input, OnInit} from '@angular/core';
import {EditableTopic} from '../../../models/topic';
import {CategoryService} from '../../../services/category.service';
import {Category} from '../../../models/category';
import {Observable} from 'rxjs/Observable';
import {User} from '../../../models/user';

@Component({
  selector: 'lr-topic-edit',
  templateUrl: './topic.edit.component.html',
  styleUrls: ['./topic.edit.component.styl']
})
export class TopicEditComponent implements OnInit {

  @Input()
  topic: EditableTopic = {
    category: null,
    acl: [],
    private: false,
    title: '',
    body: 'hello <b>my friend, <i>is</i> cool</b> super',
    description: '',
    order: 0,
    id: null
  };

  lookupEmail = '';
  editing = false;
  submitted = false;
  disabled = false;
  sendButtonActive = false;
  showSearchResults = false;

  categoriesObservable: Observable<Category[]>;
  searchResults: Observable<User[]>;

  constructor(public categoryService: CategoryService) {
    this.categoriesObservable = this.categoryService.getCategories();
  }

  ngOnInit() {
    this.categoriesObservable = this.categoryService.load();
  }

  onSubmit() {
    //
  }

  docClick() {
    //
  }

  runSearch() {
    //
  }

  addToAcl() {
    //
  }

  removeFromAcl(user) {
    //
  }

}
