import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-card',
  standalone: false,
  templateUrl: './progress-card.component.html',
  styleUrl: './progress-card.component.css'
})
export class ProgressCardComponent {
  @Input() title = 'Progress';
  @Input() description = '';
  @Input() percentage = 0;
  @Input() valueLabel = '0%';

  get clampedPercentage(): number {
    return Math.max(0, Math.min(100, this.percentage));
  }
}
