import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './core/landing-page/landing-page.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'events',
    loadChildren: () => import('./modules/events/events.module').then((m) => m.EventsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'committees',
    loadChildren: () => import('./modules/committees/committees.module').then((m) => m.CommitteesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadChildren: () => import('./modules/tasks/tasks.module').then((m) => m.TasksModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'attendance',
    loadChildren: () => import('./modules/attendance/attendance.module').then((m) => m.AttendanceModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'announcements',
    loadChildren: () => import('./modules/announcements/announcements.module').then((m) => m.AnnouncementsModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
