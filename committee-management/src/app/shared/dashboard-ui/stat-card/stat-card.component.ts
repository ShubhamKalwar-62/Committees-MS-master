import { Component, EventEmitter, Input, Output } from '@angular/core';

type StatTone = 'blue' | 'indigo' | 'green' | 'amber' | 'gray';

@Component({
  selector: 'app-stat-card',
  standalone: false,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  @Input() title = 'Metric';
  @Input() value = '--';
  @Input() icon = 'insights';
  @Input() subtitle = '';
  @Input() trend = 'Live';
  @Input() tone: StatTone = 'blue';
  @Output() cardClick = new EventEmitter<void>();

  get toneClasses(): string {
    switch (this.tone) {
      case 'indigo':
        return 'bg-indigo-100 text-indigo-700';
      case 'green':
        return 'bg-emerald-100 text-emerald-700';
      case 'amber':
        return 'bg-amber-100 text-amber-700';
      case 'gray':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  onCardClick(): void {
    this.cardClick.emit();
  }
}
