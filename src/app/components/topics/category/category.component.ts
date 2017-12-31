import { Component, OnInit } from '@angular/core';
import {CategoryService} from '../../../services/category.service';
import {Observable} from 'rxjs/Observable';
import {Category} from '../../../models/category';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'lr-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.styl']
})
export class CategoryComponent implements OnInit {

  categoriesObservable: Observable<Category[]>;

  constructor(public categoryService: CategoryService, private route: ActivatedRoute) {
    this.categoryService.setActive(
      this.route.snapshot.queryParamMap.get('category')
    );
  }

  ngOnInit() {
    this.categoriesObservable = this.categoryService.load();
    this.route.queryParamMap.subscribe(next => {
      this.categoryService.setActive(next.get('category'));
    });
  }
}
