import {Model} from './model';

export class UploadFile extends Model {
  name: string;
  type: string;
  uploadStartedDate: Date;
  lastModifiedDate: Date;
  path: string;
  size: number;
  loaded: number;
  uploaded: number;
  remaining: number;
  speed: string;
  progressPercent: string;
  status: string;

  progress(): number {
    this.remaining = this.size - (this.uploaded || 0);
    if (this.size > 0) {
      if (this.uploaded > 0) {
        this.loaded = this.size;
      }
      const loaded = (this.loaded || 0) / this.size; // from file system
      const uploaded = (this.uploaded || 0) / this.size; // actually received from webserver
      return loaded * 0.1 + uploaded * 0.9;
    }
    return 1;
  }

  /**
   * // X remaining @ speed
   * @return {string}
   */
  calculateSpeed(): string {
    const now = Date.now();
    const upt = this.uploadStartedDate.getTime();
    const passed = now - upt;
    if (this.uploaded > 0 && passed > 0) {
      const rateBps = this.uploaded / passed * 1000;
      let rate = 0;
      let scale = 'B';
      if (rateBps > 2 ** 10) {
        scale = 'kB';
        rate = rateBps / 2 ** 10;
      } else if (rateBps > 2 ** 20) {
        scale = 'MB';
        rate = rateBps / 2 ** 20;
      } else if (rateBps > 2 ** 30) {
        scale = 'GB';
        rate = rateBps / 2 ** 30;
      } else {
        rate = rateBps;
      }
      this.speed = Math.round(rate) + ' ' + scale + 'ps';
    } else {
      this.speed = '0 Bps';
    }
    return this.speed;
  }
  calculateProgressPercent(): string {
    this.progressPercent = (this.progress() * 100).toString(10) + '%';
    this.calculateSpeed();
    return this.progressPercent;
  }
}
