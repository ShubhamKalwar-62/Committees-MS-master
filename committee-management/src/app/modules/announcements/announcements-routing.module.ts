import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnnouncementCreateComponent } from './announcement-create/announcement-create.component';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';

const routes: Routes = [
  { path: '', component: AnnouncementListComponent },
  { path: 'create', component: AnnouncementCreateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnouncementsRoutingModule { }
