import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteesRoutingModule } from './committees-routing.module';
import { CommitteeListComponent } from './committee-list/committee-list.component';
import { CommitteeDetailComponent } from './committee-detail/committee-detail.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    CommitteeListComponent,
    CommitteeDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CommitteesRoutingModule
  ]
})
export class CommitteesModule { }
