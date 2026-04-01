import { Component } from '@angular/core';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-event-list',
  standalone: false,
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent {
  events: Event[] = [];
  infoMessage = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getEvents().subscribe((events) => (this.events = events));
  }

  register(eventId: number | undefined): void {
    if (!eventId) {
      return;
    }

    // Demo-friendly static user id, replace with current logged-in user id from token/profile.
    this.eventService.registerForEvent(eventId, 1).subscribe(() => {
      this.infoMessage = 'Registration submitted successfully.';
    });
  }

}
