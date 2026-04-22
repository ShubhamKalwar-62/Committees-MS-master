import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCreateComponent } from './event-create/event-create.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventListComponent } from './event-list/event-list.component';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  { path: '', component: EventListComponent },
  {
    path: 'create',
    component: EventCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  },
  {
    path: 'registrations/pending',
    component: PendingRegistrationsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  },
  { path: ':id', component: EventDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }
