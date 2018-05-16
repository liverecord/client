import {Model} from './model';

export class UploadFile extends Model {
  name: string;
  type: string;
  lastModifiedDate: Date;
  path: string;
  size: number;
  uploaded: number;
  progressPercent: string;

  progress(): number {
    if (this.size > 0) {
      return this.uploaded / this.size;
    }
    return 0;
  }
  calculateProgressPercent(): string {
    this.progressPercent = (this.progress() * 100).toString(10) + '%';
    return this.progressPercent;
  }
}
