import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  standalone: false,
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.css'
})
export class SectionCardComponent {
  @Input() title = 'Section';
  @Input() subtitle = '';
  @Input() badge = '';
}
