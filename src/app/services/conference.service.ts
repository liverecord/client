/// <reference path="../../../node_modules/@types/webrtc/RTCPeerConnection.d.ts" />

import { Injectable } from '@angular/core';
import { Frame, FrameType, WebSocketService } from './ws.service';
import { User } from '../models/user';

const WEBRTC_CONF = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {
      urls: 'turn:numb.viagenie.ca:3478',
      credential: 'g4839vEwGv7q3nf',
      username: 'philipp@zoonman.com',
    },
  ],
};

@Injectable()
export class ConferenceService {
  protected peer: LrPeer;

  constructor(private ws: WebSocketService) { }

  setup(selfView: HTMLVideoElement,  remoteView: HTMLVideoElement) {
    this.peer = new LrPeer(this.ws, selfView, remoteView);
    console.log('ws?', this.ws);
    this.ws.subscribe(async frame => {
      console.log('before onmessage', frame);
      await this.peer.onmessage(frame);
    });
  }

  startCall() {
    return this.peer.start();
  }

  stopCall() {
    return this.peer.stop();
  }
}



class LrPeer {
  pc: RTCPeerConnection;
  caller: User;
  signaling: User;
  selfView: HTMLVideoElement;
  remoteView: HTMLVideoElement;
  stream: MediaStream;
  constructor(private ws: WebSocketService, selfView: HTMLVideoElement,  remoteView: HTMLVideoElement) {
    this.ws = ws;
    this.selfView = selfView;
    this.remoteView = remoteView;

    this.init();
  }

  init() {
    this.pc = null;
    //
    this.pc = new RTCPeerConnection(WEBRTC_CONF);
    this.pc.onicecandidate = ({candidate}) => this.ws.next(<Frame>{
      type: FrameType.CallCandidate,
      data: {candidate}
    });

    this.pc.onnegotiationneeded = async () => {
      console.log('onnegotiationneeded');
      try {
        await this.pc.setLocalDescription(await this.pc.createOffer());
        // send the offer to the other peer
        this.ws.next(<Frame>{
          type: FrameType.CallLocalDescription,
          data: {desc: this.pc.localDescription}
        });
      } catch (err) {
        console.error(err);
      }
    };

    // once media for a remote track arrives, show it in the remote video element
    this.pc.ontrack = (event: RTCTrackEvent) => {
      // don't set srcObject again if it is already set.
      if (this.remoteView.srcObject) {
        return;
      }
      this.remoteView.srcObject = event.streams[0];
    };
  }

  async getStream() {
    if (!this.stream) {
      this.stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    }
    if (!this.selfView.srcObject) {
      this.selfView.srcObject = this.stream;
    }
  }

  async start() {
    if (!this.pc || this.pc.connectionState === 'closed' || this.pc.connectionState === 'failed') {
      this.init();
    }
    console.log('connectionState', this.pc);
    try {
      // get a local stream, show it in a self-view and add it to be sent
      await this.getStream();
      this.stream.getTracks().forEach((track) => this.pc.addTrack(track, this.stream));
      // this.pc.addStream(stream);
      this.selfView.srcObject = this.stream;
    } catch (err) {
      console.error(err);
    }
  }

  async stop() {
    try {
      await this.pc.close();
      this.pc = null;
      this.stream.getTracks().map(t => t.stop());
      this.stream = null;
    } catch (err) {
      console.error(err);
    }
  }

  async onmessage(event) {
    console.log('onmessage', event);
    const {desc, candidate} = event.data;
    console.log('connectionState', this.pc);
    if (!this.pc || this.pc.connectionState === 'closed' || this.pc.connectionState === 'failed') {
      this.init();
    }
    try {
      if (desc) {
        // if we get an offer, we need to reply with an answer
        if (desc.type === 'offer') {
          await this.pc.setRemoteDescription(desc);
          /*
          const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
          stream.getTracks().forEach((track) => this.pc.addTrack(track, stream));
          // this.pc.addStream(stream);
          */
          await this.getStream();
          this.stream.getTracks().forEach((track) => this.pc.addTrack(track, this.stream));

          await this.pc.setLocalDescription(await this.pc.createAnswer());
          this.ws.next(<Frame>{
            type: FrameType.CallLocalDescription,
            data: {desc: this.pc.localDescription}
          });
          // signaling.send({desc: this.pc.localDescription});
        } else if (desc.type === 'answer') {
          await this.pc.setRemoteDescription(desc);
        } else {
          console.log('Unsupported SDP type. Your code may differ here.');
        }
      } else if (candidate) {
        await this.pc.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
