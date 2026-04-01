import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-reusable-card',
  standalone: false,
  templateUrl: './reusable-card.component.html',
  styleUrl: './reusable-card.component.css'
})
export class ReusableCardComponent {

  @Input() title = '';
  @Input() subtitle = '';
}
