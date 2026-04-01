import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableButtonComponent } from './reusable-button/reusable-button.component';
import { ReusableCardComponent } from './reusable-card/reusable-card.component';
import { ReusableFormFieldComponent } from './reusable-form-field/reusable-form-field.component';



@NgModule({
  declarations: [
    ReusableButtonComponent,
    ReusableCardComponent,
    ReusableFormFieldComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ReusableButtonComponent,
    ReusableCardComponent,
    ReusableFormFieldComponent
  ]
})
export class SharedModule { }
