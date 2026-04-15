import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SharedModule } from '../../shared/shared.module';
import { WorkspaceSectionComponent } from './workspace-section/workspace-section.component';
import { MailToolsComponent } from './mail-tools/mail-tools.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';


@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    WorkspaceSectionComponent,
    MailToolsComponent,
    StudentProfileComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
