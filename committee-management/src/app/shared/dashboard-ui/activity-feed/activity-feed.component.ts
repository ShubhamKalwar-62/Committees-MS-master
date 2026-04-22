import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ActivityTone = 'info' | 'success' | 'warning' | 'neutral';

export type ActivityFeedItem = {
  time: string;
  text: string;
  tone?: ActivityTone;
  icon?: string;
  meta?: string;
};

@Component({
  selector: 'app-activity-feed',
  standalone: false,
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.css'
})
export class ActivityFeedComponent {
  @Input() items: ActivityFeedItem[] = [];
  @Input() emptyMessage = 'No activity available.';
  @Input() interactive = true;
  @Output() itemSelected = new EventEmitter<ActivityFeedItem>();

  getToneClasses(tone?: ActivityTone): string {
    switch (tone) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  onItemSelected(item: ActivityFeedItem): void {
    if (!this.interactive) {
      return;
    }

    this.itemSelected.emit(item);
  }
}
