import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './components/common/header/header.component';
import {SigninComponent} from './components/common/signin/signin.component';
import {MainComponent} from './components/topics/main/main.component';
import {IndexComponent} from './components/common/index/index.component';
import {registerLocaleData} from '@angular/common';

import localeRu from '@angular/common/locales/ru';
import localeRuExtra from '@angular/common/locales/extra/ru';
import {UserService} from './services/user.service';
import {WebSocketService} from './services/ws.service';
import {StorageService} from './services/storage.service';
import { CategoryComponent } from './components/topics/category/category.component';
import { TopicListComponent } from './components/topics/topic.list/topic.list.component';
import { TopicDetailComponent } from './components/topics/topic.detail/topic.detail.component';
import { TopicEditComponent } from './components/topics/topic.edit/topic.edit.component';
import { UserViewComponent } from './components/users/view/view.component';
import { UserLoginComponent } from './components/users/login/login.component';
import { SettingsComponent } from './components/users/settings/settings.component';
import { ListComponent } from './components/users/list/list.component';
import { RankComponent } from './components/common/rank/rank.component';
import {CategoryService} from './services/category.service';
import { EditorComponent } from './components/common/editor/editor.component';
import { ContenteditableDirective } from './components/common/editor/contenteditable.directive';
import {TopicService} from './services/topic.service';

registerLocaleData(localeRu, localeRuExtra);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SigninComponent,
    MainComponent,
    IndexComponent,
    CategoryComponent,
    TopicListComponent,
    TopicDetailComponent,
    TopicEditComponent,
    UserViewComponent,
    UserLoginComponent,
    SettingsComponent,
    ListComponent,
    RankComponent,
    EditorComponent,
    ContenteditableDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    StorageService,
    WebSocketService,
    UserService,
    CategoryService,
    TopicService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
