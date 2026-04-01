import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-reusable-form-field',
  standalone: false,
  templateUrl: './reusable-form-field.component.html',
  styleUrl: './reusable-form-field.component.css'
})
export class ReusableFormFieldComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';

}
