import {Component, OnInit, Input, Output, EventEmitter, AfterViewInit, SimpleChanges, ViewChild} from '@angular/core';
import {of} from 'rxjs/observable/of';
import {IntervalObservable} from 'rxjs/observable/IntervalObservable';
import {ContenteditableDirective} from './contenteditable.directive';


@Component({
  selector: 'lr-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.styl'],
})

export class EditorComponent implements OnInit, AfterViewInit {
  @Input('html') html: string;
  @Output() htmlChange = new EventEmitter<string>();
  @Output('change') change = new EventEmitter<string>();

  @ViewChild(ContenteditableDirective)
  private contentEditable: ContenteditableDirective;

  private previousHtml = '';

  toolbar = [
    {active: true,  command: 'bold', fa: 'bold', hotKey: 'Ctrl+B'},
    {active: false, command: 'italic', fa: 'italic', hotKey: 'Ctrl+I'},
    {active: false, command: 'underline', fa: 'underline', hotKey: 'Ctrl+U'},

    {active: false, command: 'insertOrderedList', fa: 'list-ol', hotKey: 'Ctrl+Shift+;'},
    {active: false, command: 'insertUnorderedList', fa: 'list-ul', hotKey: 'Ctrl+Shift+L'},

    {active: false, command: 'picture', fa: 'picture-o', hotKey: 'Ctrl+G'},
    {active: false, command: 'createLink', fa: 'link', hotKey: 'Ctrl+K'},
    {active: false, command: 'unlink', fa: 'chain-broken', hotKey: 'Ctrl+Shift+K'},

    {active: false, command: 'code', fa: 'code', hotKey: 'Ctrl+M'},
    {active: false, command: 'kbd', fa: 'keyboard-o', hotKey: 'Ctrl+Shift+M'},
    {active: false, command: 'blockquote', fa: 'quote-left', hotKey: 'Ctrl+Q'},
    {active: false, command: 'subscript', fa: 'subscript', hotKey: ''},
    {active: false, command: 'superscript', fa: 'superscript', hotKey: ''},

    {active: false, command: 'indent', fa: 'indent', hotKey: 'Ctrl+]'},
    {active: false, command: 'outdent', fa: 'outdent', hotKey: 'Ctrl+['},

    {active: false, command: 'removeFormat', fa: 'eraser', hotKey: 'Ctrl+D'},
    {active: false, command: 'insertParagraph', fa: 'paragraph', hotKey: 'Ctrl+P'},

  ];

  static getSpecifiedElement(node, tagName) {
    // console.log('item.command', node);

    if (tagName) {
      if (node) {
        if (node.nodeName === 'DIV') {
          return false;
        } else if (node.nodeName === tagName.toUpperCase()) {
          return node;
        } else {
          return EditorComponent.getSpecifiedElement(node.parentNode, tagName);
        }
      }
    }
    return false;
  }

  static getSelectionStart(): any {
    const node = document.getSelection().anchorNode;
    return (node.nodeType === 3 ? node.parentNode : node);
  }

  constructor() {  }

  format(command, $event) {
    $event.preventDefault();
    this.contentEditable.format(command);
    this.refreshState();
  }

  refreshState() {
    if (document.activeElement === document.querySelector('div.editor')) {
      this.toolbar.map(function(item) {
        const pn = {
          'createLink': 'a',
          'kbd': 'kbd',
          'blockquote': 'blockquote',
          'code': 'code'
        };
        if (pn[item.command]) {
          item.active = EditorComponent.getSpecifiedElement(
            EditorComponent.getSelectionStart(),
            pn[item.command]
          ) !== false;
          // console.log('item.command', item.command, item.active);
        } else {
          item.active = document.queryCommandState(item.command);
        }
      });
    }
  }

  update() {
    if (this.previousHtml !== this.html) {
      this.htmlChange.emit(this.html);
      this.change.emit(this.html);
      this.previousHtml = this.html;
    }
    this.refreshState();
  }

  ngOnInit() {
    // this is fallback to sync whatever event wasn't fired right away
    (new IntervalObservable(1000)).subscribe(() => {
      this.update();
    });
    setTimeout(() => {
      this.contentEditable.moveCaret();
      this.refreshState();

    }, 1000);
    this.contentEditable.moveCaret();

    this.refreshState();
  }

  ngAfterViewInit() {
    this.refreshState();
  }

  mapKey(key: string): string {
    return key
      .replace('Ctrl+', '⌘')
      .replace('Shift+', '⇧');
  }

}
