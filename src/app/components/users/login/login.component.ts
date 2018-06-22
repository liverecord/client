import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'lr-user-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.styl']
})
export class UserLoginComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    console.log(this.router);
  }

}
