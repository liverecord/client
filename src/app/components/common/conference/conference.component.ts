import { Component, OnInit } from '@angular/core';
import { ConferenceService, LrPeer } from '../../../services/conference.service';

@Component({
  selector: 'lr-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.styl']
})
export class ConferenceComponent implements OnInit {
  public peersArray: IterableIterator<LrPeer>;

  constructor(public conference: ConferenceService) {
    // this.peersArray = [];
  }

  ngOnInit() {
  }

  async start() {

    /**
     * 1. Retrive list of potential peers
     * 2. Send all of them invites and become a meeting host
     * 3. Listen for JOIN reply
     * 4. When JOIN reply comes in,
     *    init P2P connection with the peer:
     *    4.1 Add peer to peers list
     *    4.2 Start SDP exchange
     *
     *
     */


    await this.conference.startCall();
    // const localVideoEl = <HTMLVideoElement>document.getElementById('local');
    // localVideoEl.srcObject = LrPeer.localStream;
  }

  async hangup() {
    this.conference.stopCall();
  }
}
