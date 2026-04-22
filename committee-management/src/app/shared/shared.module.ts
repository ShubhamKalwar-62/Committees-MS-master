import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReusableButtonComponent } from './reusable-button/reusable-button.component';
import { ReusableCardComponent } from './reusable-card/reusable-card.component';
import { ReusableFormFieldComponent } from './reusable-form-field/reusable-form-field.component';
import { StatCardComponent } from './dashboard-ui/stat-card/stat-card.component';
import { SectionCardComponent } from './dashboard-ui/section-card/section-card.component';
import { ActivityFeedComponent } from './dashboard-ui/activity-feed/activity-feed.component';
import { ProgressCardComponent } from './dashboard-ui/progress-card/progress-card.component';
import { DonutChartComponent } from './dashboard-ui/donut-chart/donut-chart.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';



@NgModule({
  declarations: [
    ReusableButtonComponent,
    ReusableCardComponent,
    ReusableFormFieldComponent,
    StatCardComponent,
    SectionCardComponent,
    ActivityFeedComponent,
    ProgressCardComponent,
    DonutChartComponent,
    EmptyStateComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ReusableButtonComponent,
    ReusableCardComponent,
    ReusableFormFieldComponent,
    StatCardComponent,
    SectionCardComponent,
    ActivityFeedComponent,
    ProgressCardComponent,
    DonutChartComponent,
    EmptyStateComponent
  ]
})
export class SharedModule { }
