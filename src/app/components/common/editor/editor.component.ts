import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import {ContenteditableDirective} from './contenteditable.directive';
import { UploadFile } from '../../../models/file';
import { Frame, FrameType, WebSocketService } from '../../../services/ws.service';
import { Subject } from 'rxjs';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, last, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'lr-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.styl'],
})

export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() html: string;
  @Input() placeholder: string;
  @Output() htmlChange = new EventEmitter<string>();
  @Output() change = new EventEmitter<string>();

  @ViewChild(ContenteditableDirective, { static: true })
  private contentEditable: ContenteditableDirective;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  private previousHtml = '';
  uploads: UploadFile[];

  isUploadHelperDisplayed: boolean;

  toolbar: any[];

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
        return selection.anchorNode;
      }
    } else {
      return selection;
    }
  }

  destruct() {
    //
  }

  constructor(
    private webSocketService: WebSocketService,
    private el: ElementRef
  ) {
    this.uploads = [];
    this.isUploadHelperDisplayed = false;
    console.log('Editor initiated');

    this.toolbar = [
      {active: true,  command: 'bold', fa: 'bold', hotKey: 'Ctrl+B'},
      {active: false, command: 'italic', fa: 'italic', hotKey: 'Ctrl+I'},
      {active: false, command: 'underline', fa: 'underline', hotKey: 'Ctrl+U'},

      {active: false, command: 'insertOrderedList', fa: 'list-ol', hotKey: 'Ctrl+Shift+;'},
      {active: false, command: 'insertUnorderedList', fa: 'list-ul', hotKey: 'Ctrl+Shift+L'},

      {active: false, command: 'picture', fa: 'picture-o', hotKey: 'Ctrl+G'},
      {active: false, command: 'createLink', fa: 'link', hotKey: 'Ctrl+K'},
      {active: false, command: 'unlink', fa: 'chain-broken', hotKey: 'Ctrl+Shift+K'},

      {active: false, command: 'pre', fa: 'code', hotKey: 'Ctrl+M'},

      {active: false, command: 'kbd', fa: 'keyboard-o', hotKey: 'Ctrl+Shift+M'},
      {active: false, command: 'blockquote', fa: 'quote-left', hotKey: 'Ctrl+Q'},
      {active: false, command: 'subscript', fa: 'subscript', hotKey: ''},
      {active: false, command: 'superscript', fa: 'superscript', hotKey: ''},

      {active: false, command: 'indent', fa: 'indent', hotKey: 'Ctrl+]'},
      {active: false, command: 'outdent', fa: 'outdent', hotKey: 'Ctrl+['},

      {active: false, command: 'removeFormat', fa: 'eraser', hotKey: 'Ctrl+D'},
      {active: false, command: 'insertParagraph', fa: 'paragraph', hotKey: 'Ctrl+P'},

    ];
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
          'pre': 'pre',
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
    this.webSocketService
      .subject
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(this.frameListener.bind(this));
    // this is fallback to sync whatever event wasn't fired right away
    setInterval(() => this.update(), 1000);
    setTimeout(() => {
      this.contentEditable.moveCaret();
      this.refreshState();
    }, 1000);
    this.contentEditable.moveCaret();
    this.refreshState();
  }

  ngOnDestroy() {
    console.log('Editor ngOnDestroy');
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  private frameListener(frame: Frame) {
    switch (frame.type) {
      case FrameType.CancelUpload:
        const cancelledUpload = <UploadFile>UploadFile.fromObject(frame.data);
        const cancelledUploadFileIndex = this.getUploadIndex(cancelledUpload);
        if (cancelledUploadFileIndex >= 0) {
          this.uploads.splice(cancelledUploadFileIndex, 1);
        }
        break;
      case FrameType.File:
        const f = UploadFile.fromObject(frame.data);
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
    }
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
    const ne = document.querySelector('.editor');
    const udh = document.querySelector('.upload-drop-here');
    const onEnterUpload = fromEvent(ne, 'dragenter');
    const onEnterUploadHere = fromEvent(udh, 'dragenter');
    const onLeaveUpload = fromEvent(document, 'dragleave');
    const stream = merge(onEnterUpload, onEnterUploadHere, onLeaveUpload.pipe(
      debounceTime(100)
    ));
    stream
      .pipe(
        debounceTime(200)
      )
      .subscribe(
        (e) => {
          console.log(e);
          this.isUploadHelperDisplayed = (e.type === 'dragenter');
        },
        () => {
          this.isUploadHelperDisplayed = false;
        });
  }

  mapKey(key: string): string {
    return key
      .replace('Ctrl+', '⌘')
      .replace('Shift+', '⇧');
  }

  onDrop($event) {
    console.log('topic.detail', $event);
    this.isUploadHelperDisplayed = false;

    if ($event.dataTransfer.files.length > 0) {
      $event.preventDefault();
      this.uploadFiles($event.dataTransfer.files);
    }
  }

  displayDragAccept($event) {
   // this.isUploadHelperDisplayed = true;
  }

  hideDragAccept($event) {
   // this.isUploadHelperDisplayed = false;
  }

  onFileSelect($event) {
    this.uploadFiles($event.target.files);
  }

  uploadFile(file) {
    const f = UploadFile.fromObject({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModifiedDate: file.lastModifiedDate,
      loaded: 0,
      uploaded: 0,
      uploadStartedDate: Date.now(),
    });
    f.calculateProgressPercent();
    const uploadFileIndex = this.getUploadIndex(f);
    if (uploadFileIndex < 0) {
      this.uploads.push(f);
    }
    // actual upload
    const fr = new FileReader();
    fr.addEventListener('load', (e) => {
      this.webSocketService.next({
        type: FrameType.File,
        data: {
          name: file.name,
          size: file.size,
          loaded: file.size,
          type: file.type,
          lastModifiedDate: file.lastModifiedDate,
        }
      });
      if (fr.result !== null && fr.result instanceof ArrayBuffer) {
        this.webSocketService.next(fr.result);
      }
    });

    fr.addEventListener('onabort', (a) => {
      alert('File read cancelled');
    });
    fr.addEventListener('onerror', (a) => {
      alert('Error while reading the file. ' + a.type);
    });

    fr.addEventListener('progress', (p) => {
      f.loaded = p.loaded;
      f.calculateProgressPercent();
    });

    fr.addEventListener('onloadend', (e) => {
     f.loaded = f.size;
     f.calculateProgressPercent();
    });
    fr.readAsArrayBuffer(file);
  }

  uploadFiles(files) {
    for (let i = 0; i < files.length; i++) {
      this.uploadFile(files[i]);
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
    const editor = this.el.nativeElement.querySelector('.editor');
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
  ie.setAttribute('href', href);
  ie.setAttribute('target', '_blank');
  ie.setAttribute('rel', 'nofollow');
  ie.innerText = anchor;
  return ie.outerHTML;
}
