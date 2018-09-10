import { ContenteditableDirective } from './contenteditable.directive';
import { Component, ElementRef } from '@angular/core';
import { By, DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';


@Component({
  template: `
    <div contenteditable="true"><p>1</p></div>
  `
})
class TestComponent {
  html: string;
}
let fixture;
let des;

beforeEach(() => {
  fixture = TestBed.configureTestingModule({
    declarations: [ ContenteditableDirective, TestComponent ]
  })
    .createComponent(TestComponent);

  fixture.detectChanges(); // initial binding

  // all elements with an attached HighlightDirective
  des = fixture.debugElement.queryAll(By.directive(ContenteditableDirective));

});

it('should have three highlighted elements', () => {
  expect(des.length).toBe(1);
});
