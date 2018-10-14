import { Component, OnInit } from '@angular/core';
import { ConferenceService } from '../../../services/conference.service';

@Component({
  selector: 'lr-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.styl']
})
export class ConferenceComponent implements OnInit {

  constructor(private conference: ConferenceService) { }

  ngOnInit() {
    this.conference.setup(
      <HTMLVideoElement>document.getElementById('local'),
      <HTMLVideoElement>document.getElementById('remote')
    );

  }

  async start() {
    this.conference.startCall();
  }

  async hangup() {
    this.conference.stopCall();
  }
}
