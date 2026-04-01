import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteeListComponent } from './committee-list/committee-list.component';
import { CommitteeDetailComponent } from './committee-detail/committee-detail.component';

const routes: Routes = [
  { path: '', component: CommitteeListComponent },
  { path: ':id', component: CommitteeDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommitteesRoutingModule { }
