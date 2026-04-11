import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SharedModule } from '../shared/shared.module';
import { RoleWorkspaceComponent } from './role-workspace/role-workspace.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LandingPageComponent,
    RoleWorkspaceComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    LandingPageComponent,
    RoleWorkspaceComponent
  ]
})
export class CoreModule { }
