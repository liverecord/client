import { Frame, FrameType, WebSocketService } from './ws.service';
import { User } from '../models/user';
import { WEBRTC_CONF } from './webrtc.config';

export class LrPeer {
  static localStream: MediaStream;
  pc: RTCPeerConnection;
  public remoteStreams: ReadonlyArray<MediaStream>;

  static async getLocalStream() {
    if (!LrPeer.localStream) {
      LrPeer.localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    }
    return LrPeer.localStream;
  }

  static getLocalStreamUrl() {
    return URL.createObjectURL(this.localStream);
  }

  constructor(
    private ws: WebSocketService,
    public localUser: User,
    public remoteUser: User
  ) {
    // this.ws = ws;
    this.init();
    this.remoteStreams = [];
  }

  LocalStream(): MediaStream {
    return LrPeer.localStream;
  }

  init() {
    this.pc = null;
    /*this.ws.subscribe(async frame => {
     await this.onmessage(frame);
     });*/
    //
    this.pc = new RTCPeerConnection(WEBRTC_CONF);
    this.pc.onicecandidate = ({candidate}) => this.ws.next(<Frame>{
      type: FrameType.CallCandidate,
      data: {candidate, remoteUser: this.localUser, localUser: this.remoteUser}
    });

    this.pc.onnegotiationneeded = async () => {
      console.log('LrPeer onnegotiationneeded');
      try {
        await this.pc.setLocalDescription(await this.pc.createOffer());
        // send the offer to the other peer
        this.ws.next(<Frame>{
          type: FrameType.CallLocalDescription,
          data: {desc: this.pc.localDescription, remoteUser: this.localUser, localUser: this.remoteUser}
        });
      } catch (err) {
        console.error(err);
      }
    };

    // once media for a remote track arrives, show it in the remote video element
    this.pc.ontrack = (event: RTCTrackEvent) => {
      // don't set srcObject again if it is already set.
      this.remoteStreams = event.streams;
    };
  }


  async start() {
    if (!this.pc || this.pc.connectionState === 'closed' || this.pc.connectionState === 'failed') {
      this.init();
    }
    console.log('LrPeer connectionState', this.pc);
    try {
      // get a local stream, show it in a self-view and add it to be sent
      await LrPeer.getLocalStream();
      LrPeer.localStream.getTracks().forEach((track) => this.pc.addTrack(track, LrPeer.localStream));
    } catch (err) {
      console.error(err);
    }
  }

  async stop() {
    try {
      await this.pc.close();
      this.pc = null;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * When we retrieve the data payload matches LrPeer prop names
   * Event's localUserId is current local user id
   *
   * @param event
   */
  async onmessage(event) {
    console.log('LrPeer onmessage', event);
    const {desc, candidate, localUser, remoteUser} = event.data;
    if (this.localUser.id === remoteUser.id) {
      return;
    }
    console.log('LrPeer connectionState', this.pc);
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
          await LrPeer.getLocalStream();
          LrPeer.localStream.getTracks().forEach((track) => this.pc.addTrack(track, LrPeer.localStream));

          await this.pc.setLocalDescription(await this.pc.createAnswer());
          this.ws.next(<Frame>{
            type: FrameType.CallLocalDescription,
            data: {desc: this.pc.localDescription, remoteUser: this.localUser, localUser: this.remoteUser}
          });
          // signaling.send({desc: this.pc.localDescription});
        } else if (desc.type === 'answer') {
          await this.pc.setRemoteDescription(desc);
        } else {
          console.log(`LrPeer Unsupported SDP type: ${desc.type}. Your code may differ here.`);
        }
      } else if (candidate) {
        await this.pc.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
