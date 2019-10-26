/// <reference path="../../../node_modules/@types/webrtc/RTCPeerConnection.d.ts" />

import { Injectable } from '@angular/core';
import { Frame, FrameType, WebSocketService } from './ws.service';
import { User } from '../models/user';
import { UserService } from './user.service';
import { LrPeer } from './lrpeer';

@Injectable()
export class ConferenceService {
  public peers: LrPeer[];
  public user: User;

  constructor(
    private ws: WebSocketService,
    private userService: UserService
  ) {
    this.peers = [];
    this.userService.getUser(true).subscribe(user => this.user = user);

    this.ws.subscribe( async frame => {
      console.log('<< ConferenceService', frame.type, frame.data);
      switch (frame.type) {
        case FrameType.CallInit:
          if (!this.getPeerByRemoteUserId(frame.data.remoteUser.id)) {
            const lp = new LrPeer(this.ws, this.user.uiData(), frame.data.remoteUser);
            this.peers.push(lp);
            await lp.start();
            // await this.startCall();
          }
          break;
        case FrameType.CallCandidate:
        case FrameType.CallLocalDescription:
          if (frame.data.localUser.id === this.user.id) {
            let lp = this.getPeerByRemoteUserId(frame.data.remoteUser.id);
            if (!lp) {
              lp = new LrPeer(this.ws, this.user.uiData(), frame.data.remoteUser);
              this.peers.push(lp);
            }
            await lp.onmessage(frame);
          }
          break;
          /*if (frame.data.localUser.id === this.user.id) {
            let lp = this.getPeerByRemoteUserId(frame.data.remoteUser.id);
            if (!lp) {
              lp = new LrPeer(this.ws, this.user.uiData(), frame.data.remoteUser);
              this.peers.push(lp);
            }
            await lp.onmessage(frame);
          }
          break;*/
        case FrameType.CallStop:
          if (frame.data.remoteUser.id) {
            let lp = this.getPeerByRemoteUserId(frame.data.remoteUser.id);
            if (lp) {
              await lp.stop();
              this.peers.splice(this.peers.indexOf(lp), 1);
              lp = null;
              if (this.peers.length === 0) {
                LrPeer.localStream.getTracks().map(t => t.stop());
                LrPeer.localStream = null;
              }
            }
          }
          break;
      }
    });
  }
  getPeerByRemoteUserId(remoteUserId: number): LrPeer {
    return this.peers.find((peer: LrPeer) => peer.remoteUser.id === remoteUserId);
  }

  getPeerByLocalUserId(localUserId: number): LrPeer {
    return this.peers.find((peer: LrPeer) => peer.localUser.id === localUserId);
  }

  async startCall() {
    this.ws.next(<Frame>{
      type: FrameType.CallInit,
      data: {
        topic: 1,
        remoteUser: this.user.uiData()
      }
    });
  }

  stopCall() {
    this.ws.next(<Frame>{
      type: FrameType.CallStop,
      data: {
        topic: 1,
        remoteUser: this.user.uiData()
      }
    });
    this.peers.map(peer => peer.stop());
    LrPeer.localStream.getTracks().map(t => t.stop());
    LrPeer.localStream = null;
    this.peers = [];
  }
}
