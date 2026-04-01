import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-reusable-button',
  standalone: false,
  templateUrl: './reusable-button.component.html',
  styleUrl: './reusable-button.component.css'
})
export class ReusableButtonComponent {
  @Input() label = 'Submit';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant = 'primary';
  @Input() disabled = false;
}
