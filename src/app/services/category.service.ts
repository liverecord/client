import { Injectable } from '@angular/core';
import {Category} from '../models/category';
import {FrameType, WebSocketService} from './ws.service';
import {Observable, of,  Subject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable()
export class CategoryService {

  categories: Category[];
  categoriesSubject: Subject<Category[]>;
  slug: string;

  constructor(private webSocketService: WebSocketService, private storage: StorageService) {
    ///  public subject: Subject<any>;
    this.categories = [];
    this.categoriesSubject = new Subject<Category[]>();
    const categories = storage.get('categories');
    if (categories && categories instanceof Array) {
      this.categories = categories.map(item => <Category>Category.fromObject(item));
      this.next();
    }
    this.webSocketService.next({
      type: FrameType.CategoryList,
      data: {}
    });
    this.webSocketService.subscribe(frame => {
      if (frame.type === FrameType.CategoryList) {
        console.log('cats:', frame.data);
        this.categories = frame.data.map(item => <Category>Category.fromObject(item));
        this.setSlug();
      }
    });
    console.log('CategoryService constructor');
  }

  private setSlug() {
    this.categories.map((item) => {
      item.active = (item.slug === this.slug);
      return item;
    });
    this.next();
  }

  next() {
    this.categoriesSubject.next(this.categories);
    this.storage.set('categories', this.categories);
  }

  getCategories(): Subject<Category[]> {
    return this.categoriesSubject;
  }

  setActive(slug: string) {
    console.log('setActive', slug);
    this.slug = slug;
    this.setSlug();
  }
}
