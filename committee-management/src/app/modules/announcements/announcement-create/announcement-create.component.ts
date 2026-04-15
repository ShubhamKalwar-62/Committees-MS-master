import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Announcement } from '../../../models/announcement.model';
import { AnnouncementService } from '../../../services/announcement.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-announcement-create',
  standalone: false,
  templateUrl: './announcement-create.component.html',
  styleUrl: './announcement-create.component.css'
})
export class AnnouncementCreateComponent {
  private fb = inject(FormBuilder);

  saving = false;
  errorMessage = '';

  announcementForm = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(5)]],
    committeeId: [1],
    userId: [1]
  });

  constructor(
    private announcementService: AnnouncementService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.announcementService.createAnnouncement(this.announcementForm.getRawValue() as Announcement).subscribe({
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
        const message = err?.error?.message || 'Unable to publish announcement. Check Committee ID/User ID values.';
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

}
