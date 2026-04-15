import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkspaceSectionComponent } from './workspace-section/workspace-section.component';
import { MailToolsComponent } from './mail-tools/mail-tools.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'users',
    component: WorkspaceSectionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'], title: 'User Management', subtitle: 'Manage platform users, roles, and account statuses.' }
  },
  {
    path: 'events',
    component: WorkspaceSectionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'], title: 'Events', subtitle: 'Track upcoming events, registrations, and execution status.' }
  },
  {
    path: 'committees',
    component: WorkspaceSectionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'], title: 'Committees', subtitle: 'Maintain committee structure, members, and governance workflow.' }
  },
  {
    path: 'tasks',
    component: WorkspaceSectionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'], title: 'Tasks', subtitle: 'Monitor assignments, completion progress, and due date alerts.' }
  },
  {
    path: 'attendance',
    component: WorkspaceSectionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'], title: 'Attendance', subtitle: 'Review participation records and attendance compliance metrics.' }
  },
  {
    path: 'announcements',
    component: WorkspaceSectionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'], title: 'Announcements', subtitle: 'Publish updates and monitor audience engagement.' }
  },
  {
    path: 'mail-tools',
    component: MailToolsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'profile',
    component: StudentProfileComponent,
    canActivate: [RoleGuard],
    data: { roles: ['STUDENT'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
