import { Injectable } from '@angular/core';
import {Category} from '../models/category';
import {FrameType, WebSocketService} from './ws.service';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

@Injectable()
export class CategoryService {

  categories: Category[];
  slug: string;

  constructor(private webSocketService: WebSocketService) {
    this.categories = [];
    this.load();
  }

  load(): Observable<Category[]> {
    this.webSocketService.next({
      type: FrameType.CategoryList,
      data: {}
    });
    return Observable.create((observer) => {
      this.webSocketService.subscribe(frame => {
        console.log('cats:', frame.data);

        if (frame.type === FrameType.CategoryList) {
          frame.data.map((item) => {
            return Object.assign(new Category(), item);
          });
          this.categories = frame.data;
          this.setSlug();
          observer.next(this.categories);
        }
      });
    });
  }

  private setSlug() {
    this.categories.map((item) => {
      item.active = (item.slug === this.slug);
      return item;
    });
  }

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  setActive(slug: string): Observable<Category[]> {
    console.log('setActive', slug);
    this.slug = slug;
    this.setSlug();
    return of(this.categories);
  }
}
