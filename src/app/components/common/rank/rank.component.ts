import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../../models/user';

@Component({
  selector: 'lr-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.styl']
})
export class RankComponent implements OnInit {
  @Input('user') user: User;

  constructor() { }

  ngOnInit() {
  }

}
