import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './core/landing-page/landing-page.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingPageComponent },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'faculty',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['FACULTY'] }
  },
  {
    path: 'student/events',
    loadChildren: () => import('./modules/events/events.module').then((m) => m.EventsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STUDENT'] }
  },
  {
    path: 'student/tasks',
    loadChildren: () => import('./modules/tasks/tasks.module').then((m) => m.TasksModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STUDENT'] }
  },
  {
    path: 'student/attendance',
    loadChildren: () => import('./modules/attendance/attendance.module').then((m) => m.AttendanceModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STUDENT'] }
  },
  {
    path: 'student/announcements',
    loadChildren: () => import('./modules/announcements/announcements.module').then((m) => m.AnnouncementsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STUDENT'] }
  },
  {
    path: 'student/committees',
    loadChildren: () => import('./modules/committees/committees.module').then((m) => m.CommitteesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STUDENT'] }
  },
  {
    path: 'student',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STUDENT'] }
  },
  {
    path: 'dashboard',
    component: LandingPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'events',
    loadChildren: () => import('./modules/events/events.module').then((m) => m.EventsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'] }
  },
  {
    path: 'committees',
    loadChildren: () => import('./modules/committees/committees.module').then((m) => m.CommitteesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  },
  {
    path: 'tasks',
    loadChildren: () => import('./modules/tasks/tasks.module').then((m) => m.TasksModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'] }
  },
  {
    path: 'attendance',
    loadChildren: () => import('./modules/attendance/attendance.module').then((m) => m.AttendanceModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'] }
  },
  {
    path: 'announcements',
    loadChildren: () => import('./modules/announcements/announcements.module').then((m) => m.AnnouncementsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'] }
  },
  { path: '**', redirectTo: 'landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
