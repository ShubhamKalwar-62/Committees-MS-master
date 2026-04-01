import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendanceMarkComponent } from './attendance-mark/attendance-mark.component';
import { AttendanceListComponent } from './attendance-list/attendance-list.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    AttendanceMarkComponent,
    AttendanceListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    AttendanceRoutingModule
  ]
})
export class AttendanceModule { }
