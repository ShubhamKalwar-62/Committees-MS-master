import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Announcement, AnnouncementType } from '../../../models/announcement.model';
import { Event } from '../../../models/event.model';
import { Task } from '../../../models/task.model';
import { AnnouncementService } from '../../../services/announcement.service';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-announcement-create',
  standalone: false,
  templateUrl: './announcement-create.component.html',
  styleUrl: './announcement-create.component.css'
})
export class AnnouncementCreateComponent {
  private fb = inject(FormBuilder);

  events: Event[] = [];
  tasks: Task[] = [];
  loadingReferenceOptions = false;
  saving = false;
  errorMessage = '';

  announcementForm = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(5)]],
    type: ['general' as AnnouncementType, [Validators.required]],
    referenceId: [null as number | null],
    important: [false],
    committeeId: [1],
    userId: [1]
  });

  constructor(
    private announcementService: AnnouncementService,
    private eventService: EventService,
    private notificationService: NotificationService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateReferenceValidation(this.selectedType);
    this.announcementForm.controls.type.valueChanges.subscribe((type) => {
      const resolvedType = (type || 'general') as AnnouncementType;
      this.updateReferenceValidation(resolvedType);

      if (resolvedType === 'general') {
        this.announcementForm.controls.referenceId.setValue(null);
        return;
      }

      this.loadReferenceOptions(resolvedType);
    });
  }

  get selectedType(): AnnouncementType {
    return (this.announcementForm.controls.type.value || 'general') as AnnouncementType;
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const payload = this.buildCreatePayload();
    this.saving = true;
    this.errorMessage = '';
    this.announcementService.createAnnouncement(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.add({
          title: 'Announcement Published',
          message: 'Announcement published successfully.',
          level: 'success',
          actionRoute: '/announcements'
        });
        this.router.navigate(['/announcements']);
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.message || 'Unable to publish announcement. Verify type, reference, committee, and user values.';
        this.errorMessage = message;
        this.notificationService.add({
          title: 'Announcement Publish Failed',
          message,
          level: 'error',
          actionRoute: '/announcements/create'
        });
      }
    });
  }

  private buildCreatePayload(): Announcement {
    const raw = this.announcementForm.getRawValue();
    const type = (raw.type || 'general') as AnnouncementType;
    const referenceId = raw.referenceId == null ? null : Number(raw.referenceId);

    return {
      message: raw.message || '',
      type,
      referenceId: type === 'general' ? null : (Number.isFinite(referenceId) ? referenceId : null),
      important: Boolean(raw.important),
      read: false,
      committeeId: raw.committeeId == null ? undefined : Number(raw.committeeId),
      userId: raw.userId == null ? undefined : Number(raw.userId)
    };
  }

  private updateReferenceValidation(type: AnnouncementType): void {
    const referenceControl = this.announcementForm.controls.referenceId;
    if (type === 'event' || type === 'task') {
      referenceControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      referenceControl.clearValidators();
    }

    referenceControl.updateValueAndValidity({ emitEvent: false });
  }

  private loadReferenceOptions(type: AnnouncementType): void {
    this.loadingReferenceOptions = true;
    if (type === 'event') {
      this.eventService.getEvents().subscribe({
        next: (items: Event[]) => {
          this.loadingReferenceOptions = false;
          this.events = items || [];
        },
        error: () => {
          this.loadingReferenceOptions = false;
          this.events = [];
        }
      });
      return;
    }

    this.taskService.getTasks().subscribe({
      next: (items: Task[]) => {
        this.loadingReferenceOptions = false;
        this.tasks = items || [];
      },
      error: () => {
        this.loadingReferenceOptions = false;
        this.tasks = [];
      }
    });
  }

}
