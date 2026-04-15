import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnnouncementCreateComponent } from './announcement-create/announcement-create.component';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  { path: '', component: AnnouncementListComponent },
  {
    path: 'create',
    component: AnnouncementCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnouncementsRoutingModule { }
