import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './components/common/index/index.component';
import { MainComponent } from './components/topics/main/main.component';
import { ListComponent } from './components/users/list/list.component';
import { UserLoginComponent } from './components/users/login/login.component';
import { UserViewComponent } from './components/users/view/view.component';
import { SettingsComponent } from './components/users/settings/settings.component';
import { TopicEditComponent } from './components/topics/topic.edit/topic.edit.component';
import { AuthorizedGuard } from './guards/authorized.guard';
import { UserService } from './services/user.service';
import { WebSocketService } from './services/ws.service';
import { StorageService } from './services/storage.service';
import { RestoreComponent } from './components/users/restore/restore.component';

const routes: Routes = [
  {path: '', component: MainComponent},
  {path: 'users', component: ListComponent},
  {path: 'settings', component: SettingsComponent, canActivate: [AuthorizedGuard] },
  {path: 'users/login', component: UserLoginComponent},
  {path: 'users/password/restore', component: RestoreComponent },
  {path: 'users/:slug', component: UserViewComponent},
  {path: ':category/new', component: TopicEditComponent, canActivate: [AuthorizedGuard]},
  {path: ':category/:slug', component: MainComponent},
  {path: ':category/:slug/edit', component: TopicEditComponent, canActivate: [AuthorizedGuard]},
  {path: 'topics/:slug/edit', component: TopicEditComponent, canActivate: [AuthorizedGuard]},
  {path: ':category', component: MainComponent},
  {path: '**', component: MainComponent  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: true})],
  providers: [AuthorizedGuard],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
