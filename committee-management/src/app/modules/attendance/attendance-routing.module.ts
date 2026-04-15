import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceListComponent } from './attendance-list/attendance-list.component';
import { AttendanceMarkComponent } from './attendance-mark/attendance-mark.component';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  { path: '', component: AttendanceListComponent },
  {
    path: 'mark',
    component: AttendanceMarkComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
