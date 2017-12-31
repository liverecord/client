import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IndexComponent} from './components/common/index/index.component';
import {MainComponent} from './components/topics/main/main.component';
import {ListComponent} from './components/users/list/list.component';
import {UserLoginComponent} from './components/users/login/login.component';
import {UserViewComponent} from './components/users/view/view.component';
import {SettingsComponent} from './components/users/settings/settings.component';
import {TopicEditComponent} from './components/topics/topic.edit/topic.edit.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'topics', component: MainComponent },
  { path: 'topics/new', component: TopicEditComponent },
  { path: 'topics/:slug', component: MainComponent },
  { path: 'topics/:slug/edit', component: TopicEditComponent },
  { path: 'users', component: ListComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'users/login', component: UserLoginComponent },
  { path: 'users/:slug', component: UserViewComponent },
  { path: '**', component: IndexComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
