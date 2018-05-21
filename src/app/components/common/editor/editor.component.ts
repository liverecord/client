import {Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild} from '@angular/core';
import {ContenteditableDirective} from './contenteditable.directive';
import { UploadFile } from '../../../models/file';
import { FrameType, WebSocketService } from '../../../services/ws.service';

@Component({
  selector: 'lr-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.styl'],
})

export class EditorComponent implements OnInit, AfterViewInit {
  @Input() html: string;
  @Output() htmlChange = new EventEmitter<string>();
  @Output('change') change = new EventEmitter<string>();

  @ViewChild(ContenteditableDirective)
  private contentEditable: ContenteditableDirective;

  private previousHtml = '';
  uploads: UploadFile[];

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
    const selection = document.getSelection();
    if (selection) {
      const node = selection.anchorNode;
      if (node) {
        return (node.nodeType === 3 ? node.parentNode : node);
      } else {
        return selection.baseNode;
      }
    } else {
      return selection;
    }
  }

  constructor(
    private webSocketService: WebSocketService,
  ) {
    this.uploads = [];
  }

  format(command, $event) {
    $event.preventDefault();
    this.contentEditable.format(command);
    this.refreshState();
  }

  refreshState() {
    if (document.activeElement === this.contentEditable.getNativeElement()) {
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
    setInterval(() => this.update(), 1000);
    setTimeout(() => {
      this.contentEditable.moveCaret();
      this.refreshState();
    }, 1000);
    this.contentEditable.moveCaret();
    this.refreshState();
    this.webSocketService.subscribe(frame => {
      switch (frame.type) {
        case FrameType.CancelUpload:
          const cancelledUpload = <UploadFile>UploadFile.fromObject(frame.data);
          const cancelledUploadFileIndex = this.getUploadIndex(cancelledUpload);
          if (cancelledUploadFileIndex >= 0) {
            this.uploads.splice(cancelledUploadFileIndex, 1);
          }
          break;
        case FrameType.File:
          const f = <UploadFile>UploadFile.fromObject(frame.data);
          f.calculateProgressPercent();
          const uploadFileIndex = this.getUploadIndex(f);
          if (uploadFileIndex < 0) {
            this.uploads.push(f);
          }
          if (f.path && f.path.length > 0 && f.uploaded === f.size) {
            this.focusEditor();
            let html = '';
            if (f.type.startsWith('image/', 0)) {
              html = createImage('http://localhost:8000' + f.path, f.name);
            } else if (f.type.startsWith('video/', 0)) {
              html = createVideo('http://localhost:8000' + f.path, f.name);
            } else {
              html = createLink('http://localhost:8000' + f.path, f.name);
            }
            document.execCommand('insertHTML', false,  html + ' ');
            this.uploads.splice(uploadFileIndex, 1);
          }
          break;
      }});
  }

  private getUploadIndex(f: UploadFile): number {
    let uploadFileIndex = -1;
    this.uploads.map((v, i) => {
      if (v.name === f.name && v.size === f.size && v.type === f.type) {
        v.uploaded = f.uploaded;
        v.calculateProgressPercent();
        uploadFileIndex = i;
      }
    });
    return uploadFileIndex;
  }
  ngAfterViewInit() {
    this.refreshState();
  }

  mapKey(key: string): string {
    return key
      .replace('Ctrl+', '⌘')
      .replace('Shift+', '⇧');
  }

  onDrop($event) {
    console.log('topic.detail', $event);
    if ($event.dataTransfer.files.length > 0) {
      $event.preventDefault();
      for (let i = 0; i < $event.dataTransfer.files.length; i++) {
        const fr = new FileReader();
        const file = $event.dataTransfer.files[i];
        fr.addEventListener('load', (e) => {
          console.log(e, fr.result, file, JSON.stringify(file));
          this.webSocketService.next({
            type: FrameType.File,
            data: {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModifiedDate: file.lastModifiedDate,
            }
          });
          this.webSocketService.next(fr.result);
        });
        fr.addEventListener('onabort', (a) => {
          console.log('onabort', a);
        });
        fr.addEventListener('progress', (p) => {
          console.log('progress', p);
        });
        fr.addEventListener('onloadend', (e) => {
          console.log('load', e);
        });
        fr.readAsArrayBuffer(file);
      }
    }
  }

  cancelUpload(index) {
    const file = this.uploads[index];
    this.webSocketService.next({
      type: FrameType.CancelUpload,
      data: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModifiedDate: file.lastModifiedDate,
      }
    });
    this.uploads.splice(index, 1);
  }

  focusEditor() {
    const editor = document.querySelector('.editor');
    if (editor instanceof HTMLElement) {
      editor.focus();
    }
  }
}


function createImage(src, alt) {
  const ie = document.createElement('img');
  ie.setAttribute('src', src);
  ie.setAttribute('alt', alt);
  return ie.outerHTML;
}

function createVideo(src, alt) {
  const ie = document.createElement('video');
  ie.setAttribute('src', src);
  ie.setAttribute('alt', alt);
  ie.setAttribute('controls', '');
  ie.setAttribute('preload', 'metadata');
  ie.setAttribute('width', '640');
  ie.setAttribute('height', '480');
  return ie.outerHTML;
}

function createLink(href, anchor) {
  const ie = document.createElement('a');
  ie.setAttribute('link', href);
  ie.setAttribute('target', '_blank');
  ie.setAttribute('rel', 'nofollow');
  ie.innerText = anchor;
  return ie.outerHTML;
}
