import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-donut-chart',
  standalone: false,
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.css'
})
export class DonutChartComponent {
  @Input() title = 'Donut Metric';
  @Input() value = '0%';
  @Input() subtitle = '';
  @Input() percentage = 0;
  @Input() color = '#4f46e5';

  get clampedPercentage(): number {
    return Math.max(0, Math.min(100, this.percentage));
  }

  get ringStyle(): string {
    return `conic-gradient(${this.color} 0 ${this.clampedPercentage}%, #e2e8f0 ${this.clampedPercentage}% 100%)`;
  }
}
