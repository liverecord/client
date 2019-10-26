import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { StorageService } from '../../../services/storage.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'lr-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.styl']
})
export class SettingsComponent implements OnInit {
  profile?: User;
  sending: boolean;
  constructor(private userService: UserService,
              private storage: StorageService,
              private titleService: Title) {
    this.sending = false;
    // this.profile = new User();
  }

  ngOnInit() {
    this.titleService.setTitle('Settings');
    this.userService
      .getUser(true)
      .subscribe(u => this.profile = u);
  }

  saveSettings() {
    if (this.profile) {
      this.sending = true;
      this.userService.updateUser(this.profile, this.profile.id.toString());
      this.sending = false;
    }
  }

  signOut() {
    this.userService.signOut();
  }

  forgetDevice() {
    if (confirm('All your settings, drafts and sign in data will be destroyed on this device!\n\nAre you wish to continue?')) {
      this.storage.clear();
    }
  }
}
