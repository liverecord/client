import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[lrVideoView]'
})
export class VideoViewDirective implements OnInit {
  @Input() public lrVideoView: MediaStream;
  constructor(private el: ElementRef) {
    console.log('VideoViewDirective', this.lrVideoView);
  }

  ngOnInit(): void {
    if (this.lrVideoView instanceof MediaStream) {
      console.log('mediastream!!!', this);
      // const videoElement = document.createElement('video');
      // videoElement.srcObject = this.lrVideoView;
      this.el.nativeElement.srcObject = this.lrVideoView;
    }
  }
}
