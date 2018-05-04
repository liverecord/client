import { Component, OnInit } from '@angular/core';
import {CategoryService} from '../../../services/category.service';
import {Observable} from 'rxjs';
import {Category} from '../../../models/category';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'lr-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.styl']
})
export class CategoryComponent implements OnInit {

  categories: Category[];

  constructor(public categoryService: CategoryService, private route: ActivatedRoute) {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats)
    this.categoryService.setActive(
      this.route.snapshot.paramMap.get('category')
    );
  }

  ngOnInit() {
    this.route.paramMap.subscribe(next => {
      this.categoryService.setActive(next.get('category'));
    });
  }
}
