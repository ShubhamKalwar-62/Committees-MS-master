import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-event-create',
  standalone: false,
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.css'
})
export class EventCreateComponent {
  private fb = inject(FormBuilder);

  submitting = false;

  eventForm = this.fb.group({
    eventName: ['', Validators.required],
    description: [''],
    eventDate: ['', Validators.required],
    location: ['', Validators.required],
    status: ['PLANNED'],
    maxParticipants: [50]
  });

  constructor(private eventService: EventService, private router: Router) {}

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.eventService.createEvent(this.eventForm.getRawValue() as Event).subscribe(() => {
      this.submitting = false;
      this.router.navigate(['/events']);
    });
  }

}
