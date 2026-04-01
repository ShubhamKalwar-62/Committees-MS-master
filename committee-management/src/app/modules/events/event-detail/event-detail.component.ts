import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-event-detail',
  standalone: false,
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent {
  event?: Event;

  constructor(private route: ActivatedRoute, private eventService: EventService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      return;
    }

    this.eventService.getEventById(id).subscribe((event) => {
      this.event = event;
    });
  }

}
