import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Announcement } from '../../../models/announcement.model';
import { AnnouncementService } from '../../../services/announcement.service';

@Component({
  selector: 'app-announcement-create',
  standalone: false,
  templateUrl: './announcement-create.component.html',
  styleUrl: './announcement-create.component.css'
})
export class AnnouncementCreateComponent {
  private fb = inject(FormBuilder);

  saving = false;

  announcementForm = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(5)]],
    committeeId: [1],
    userId: [1]
  });

  constructor(private announcementService: AnnouncementService, private router: Router) {}

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.announcementService.createAnnouncement(this.announcementForm.getRawValue() as Announcement).subscribe(() => {
      this.saving = false;
      this.router.navigate(['/announcements']);
    });
  }

}
