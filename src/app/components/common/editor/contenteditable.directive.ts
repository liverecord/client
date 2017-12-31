import { Directive, ElementRef, Input, forwardRef, HostListener } from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import * as DOMPurify from 'dompurify';

@Directive({
  /* tslint:disable-next-line */
  selector: '[contenteditable]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ContenteditableDirective),
    }
  ]
})
export class ContenteditableDirective implements ControlValueAccessor {

  exOnChange: any;
  exOnTouched: any;

  constructor(private el: ElementRef, private sanitizer: DomSanitizer) {
    el.nativeElement.focus();
  }

  static wrapSelection(prefix, suffix: string): void {
    suffix = suffix || prefix;
    const selection = document.getSelection();
    let newHtml = '';
    if (selection.isCollapsed) {
      newHtml = prefix  + '&nbsp;' + suffix;
    } else {
      newHtml = prefix  + selection.toString() + suffix;
    }
    document.execCommand('insertHTML', false,
      newHtml);
  }

  @HostListener('paste', ['$event'])
  onPaste(e) {
    console.log(e);
    if (e.clipboardData.types.indexOf('text/html') > -1) {
      e.preventDefault(); // prevent pasting
      let s = e.clipboardData.getData('text/html');
      // we prefer ideal cleanup
      if (DOMPurify && window['DOMPurify'].isSupported) {
        s = DOMPurify.sanitize(s, {
            ALLOWED_TAGS: [
              'a', 'b', 'strong', 'i', 'em', 'q', 'kbd', 'span', 'sub', 'sup', 's',
              'img', 'video',
              'ol', 'ul', 'li',
              'p', 'br', 'blockquote', 'code', 'pre'
            ],

            ALLOWED_ATTR: [
              'lang',
              'language',
              'target',
              'href',
              'controls',
              'alt',
              'src'
            ]
          }
        ).trim();
      } else {
        s = this.linky(s);
      }
      document.execCommand('insertHTML', false, s);
    } else if (e.clipboardData.types.indexOf('text/plain') > -1) {
      e.preventDefault(); // prevent pasting
      let s = e.clipboardData.getData('text/plain');
      s = this.linky(s);
      document.execCommand('insertHTML', false, s);
    }
    this.updateModel();
  }

  @HostListener('mousedown')
  @HostListener('mouseup')
  @HostListener('drop')
  @HostListener('click')
  @HostListener('compositionend')
  @HostListener('dragend')
  @HostListener('change')
  onDragEnd() {
    this.updateModel();
  }

  @HostListener('keyup')
  onKeyUp() {
    this.updateModel();
  }

  @HostListener('cut')
  onCut() {
    this.updateModel();
  }

  @HostListener('change')
  onChange() {
    this.updateModel();
  }

  @HostListener('blur')
  onBlur(e) {
    this.updateModel();
    if (this.exOnTouched) {
      this.exOnTouched();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          this.format('bold');
          break;
        case 'i':
          e.preventDefault();
          this.format('italic');
          break;
        case 'u':
          e.preventDefault();
          this.format('underline');
          break;
        case 'd':
          e.preventDefault();
          this.format('removeFormat');
          break;
        case 'p':
          e.preventDefault();
          this.format('insertParagraph');
          break;
        case 'e':
          e.preventDefault();
          this.format('justifyCenter');
          break;
        case ';':
          e.preventDefault();
          this.format('insertOrderedList');
          break;
        case 'l':
          e.preventDefault();
          if (e.shiftKey) {
            this.format('insertUnorderedList');
          } else {
            this.format('justifyLeft');
          }
          break;
        case 'r':
          e.preventDefault();
          this.format('justifyRight');
          break;
        case 'j':
          e.preventDefault();
          this.format('justifyFull');
          break;
        case ']':
          e.preventDefault();
          this.format('indent');
          break;
        case '[':
          e.preventDefault();
          this.format('outdent');
          break;
        case 'q':
          e.preventDefault();
          this.format('blockquote');
          break;
        case 'm':
          e.preventDefault();
          if (e.shiftKey) {
            this.format('kbd');
          } else {
            this.format('code');
          }
          break;
        case 'g':
          e.preventDefault();
          this.format('picture');
          break;
        case 'k':
          e.preventDefault();
          if (e.shiftKey) {
            this.format('unlink');
          } else {
            this.format('createLink');
          }
          break;
        case 's':
          e.preventDefault();
          break;
      }
    } else if (e.keyCode === 9) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&emsp;');
    }
    console.log(e);
    this.updateModel();
  }

  moveCaret() {
    const el = this.el.nativeElement;
    const selection = window.getSelection();
    const range = document.createRange();
    selection.removeAllRanges();
    range.selectNodeContents(el);
    range.collapse(false);
    selection.addRange(range);
    el.focus();
  }

  format(command: string) {
    this.el.nativeElement.focus();
    switch (command) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        const r = document.execCommand('heading', false, command);
        if (r === false) {
          // wrapSelectionWithTag(command);
        }
        break;
      case 'code':
      case 'kbd':
        ContenteditableDirective.wrapSelection('<' + command + '>', '</' + command + '>');
        break;
      case 'pre':
      case 'blockquote':
        document.execCommand('formatBlock', false, command);
        break;
      case 'picture':
        const picture = prompt('Picture Url');
        if (picture) {
          document.execCommand(
            'insertHTML',
            false,
            '<img src="' + encodeURI(picture) + '">'
          );
        }
        break;
      case 'createLink':
        const link = prompt('Url');
        if (link) {
          document.execCommand(command, false, link);
        }
        break;
      default:
        document.execCommand(command, false);
    }
    this.updateModel();
    setTimeout(() => {
      this.updateModel();
    }, 25);
  }

  linky(s: string): string {
    //
    return s;
  }

  updateModel(): void {
    if (this.exOnChange) {
      this.exOnChange(this.el.nativeElement.innerHTML);
    }
  }

  get value(): any {
    return this.el.nativeElement.innerHTML;
  }

  set value(v: any) {
    this.el.nativeElement.innerHTML = v;
  }

  writeValue(obj: any): void {
    this.el.nativeElement.innerHTML = obj;
  }

  registerOnChange(fn: any): void {
    this.exOnChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.exOnTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

}
