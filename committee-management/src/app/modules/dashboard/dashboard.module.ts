import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SharedModule } from '../../shared/shared.module';
import { WorkspaceSectionComponent } from './workspace-section/workspace-section.component';
import { MailToolsComponent } from './mail-tools/mail-tools.component';


@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    WorkspaceSectionComponent,
    MailToolsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
