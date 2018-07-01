import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { StorageService } from '../../../services/storage.service';
import { Title } from '@angular/platform-browser';
import { i18nExtract } from '@angular/compiler-cli/src/transformers/program';

@Component({
  selector: 'lr-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.styl']
})
export class SettingsComponent implements OnInit {
  profile: User;
  sending: boolean;
  constructor(private userService: UserService,
              private storage: StorageService,
              private titleService: Title) {
    this.sending = false;
    this.profile = new User();
  }

  ngOnInit() {
    this.titleService.setTitle('Settings');
    this.userService
      .getUser(true)
      .subscribe(u => this.profile = u);
  }

  saveGlobalSettings() {
    //
  }

  signOut() {
    this.userService.signOut();
  }

  forgetDevice() {
    this.storage.clear();
  }
}
