import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'lr-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.styl']
})
export class RestoreComponent implements OnInit {
  submitted = false;
  disabled = false;
  status = 'unknown';

  // displayForm
  // displaySuccess
  // displayMissing
  // displayError

  restoreData = {
    email: ''
  };

  constructor(private userService: UserService) {

  }

  ngOnInit() {
    this.userService.restorePasswordSubscription().subscribe(frame => this.status = frame.data);
  }

  onSubmit() {
    this.submitted = true;
    this
      .userService
      .restorePassword(this.restoreData.email);
  }
}
