import { Component } from '@angular/core';
import { Announcement } from '../../../models/announcement.model';
import { AnnouncementService } from '../../../services/announcement.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-announcement-list',
  standalone: false,
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.css'
})
export class AnnouncementListComponent {
  announcements: Announcement[] = [];

  constructor(private announcementService: AnnouncementService, private authService: AuthService) {}

  get canCreateAnnouncement(): boolean {
    return this.authService.canManageCreationActions();
  }

  ngOnInit(): void {
    this.announcementService.getAnnouncements().subscribe((announcements) => {
      this.announcements = announcements;
    });
  }

  getAnnouncementTitle(message: string): string {
    const normalized = (message || '').trim();
    if (!normalized) {
      return 'Institution Notice';
    }

    const [firstLine] = normalized.split(/[.!?\n]/);
    const baseTitle = (firstLine || normalized).trim();
    if (baseTitle.length <= 52) {
      return baseTitle;
    }

    return `${baseTitle.slice(0, 52)}...`;
  }

  getAnnouncementPreview(message: string): string {
    const normalized = (message || '').trim();
    if (!normalized) {
      return 'No announcement details available.';
    }

    if (normalized.length <= 120) {
      return normalized;
    }

    return `${normalized.slice(0, 120)}...`;
  }

  formatDate(value: string | undefined): string {
    if (!value) {
      return 'Recent update';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
