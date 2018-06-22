import { ContenteditableDirective } from './contenteditable.directive';
import { ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

describe('ContenteditableDirective', () => {
  it('should create an instance', (private el, private sanitizer) => {
    const directive = ContenteditableDirective(el, sanitizer);
    expect(directive).toBeTruthy();
  });
});
