import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Event } from '../../../models/event.model';
import { Committee } from '../../../models/committee.model';
import { CommitteeService } from '../../../services/committee.service';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-event-create',
  standalone: false,
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.css'
})
export class EventCreateComponent {
  private fb = inject(FormBuilder);

  submitting = false;
  errorMessage = '';
  committees: Committee[] = [];

  eventForm = this.fb.group({
    eventName: ['', Validators.required],
    description: [''],
    eventDate: ['', Validators.required],
    location: ['', Validators.required],
    status: ['PLANNED'],
    maxParticipants: [50],
    committeeId: [1, Validators.required],
    categoryId: [null as number | null]
  });

  constructor(
    private eventService: EventService,
    private committeeService: CommitteeService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.committeeService.getCommittees().subscribe((committees) => {
      this.committees = committees;
      if (!this.eventForm.value.committeeId && committees.length > 0) {
        this.eventForm.patchValue({ committeeId: committees[0].id || 1 });
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.eventService.createEvent(this.eventForm.getRawValue() as Event).subscribe({
      next: () => {
        this.submitting = false;
        this.notificationService.add({
          title: 'Event Created',
          message: 'Event created successfully.',
          level: 'success',
          actionRoute: '/events'
        });
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.submitting = false;
        const message = err?.error?.message || 'Unable to create event. Check Committee ID and data values.';
        this.errorMessage = message;
        this.notificationService.add({
          title: 'Event Creation Failed',
          message,
          level: 'error',
          actionRoute: '/events/create'
        });
      }
    });
  }

}
