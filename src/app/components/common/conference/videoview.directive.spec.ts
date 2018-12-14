import { VideoViewDirective } from './videoview.directive';
import { ElementRef } from '@angular/core';

describe('VideoViewDirective', () => {
  it('should create an instance', () => {
    const nativeEl = document.createElement('video');
    const el = new ElementRef(nativeEl);
    const directive = new VideoViewDirective(el);
    expect(directive).toBeTruthy();
  });
});
