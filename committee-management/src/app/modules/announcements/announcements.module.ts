import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AnnouncementsRoutingModule } from './announcements-routing.module';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { AnnouncementCreateComponent } from './announcement-create/announcement-create.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    AnnouncementListComponent,
    AnnouncementCreateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    AnnouncementsRoutingModule
  ]
})
export class AnnouncementsModule { }
