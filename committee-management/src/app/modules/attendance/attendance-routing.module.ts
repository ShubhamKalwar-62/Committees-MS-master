import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceListComponent } from './attendance-list/attendance-list.component';
import { AttendanceMarkComponent } from './attendance-mark/attendance-mark.component';
import { AttendanceQrSessionComponent } from './attendance-qr-session/attendance-qr-session.component';
import { AttendanceScanComponent } from './attendance-scan/attendance-scan.component';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  { path: '', component: AttendanceListComponent },
  {
    path: 'mark',
    component: AttendanceMarkComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  },
  {
    path: 'qr-session',
    component: AttendanceQrSessionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  },
  {
    path: 'scan',
    component: AttendanceScanComponent,
    canActivate: [RoleGuard],
    data: { roles: ['STUDENT'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
