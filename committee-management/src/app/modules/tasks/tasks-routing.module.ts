import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskListComponent } from './task-list/task-list.component';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  { path: '', component: TaskListComponent },
  {
    path: 'create',
    component: TaskCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  },
  { path: ':id', component: TaskDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
