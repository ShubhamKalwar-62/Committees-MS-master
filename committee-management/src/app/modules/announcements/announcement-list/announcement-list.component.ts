import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  activeGeneralAnnouncement?: Announcement;
  loading = true;
  errorMessage = '';

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private router: Router
  ) {}

  get canCreateAnnouncement(): boolean {
    return this.authService.canManageCreationActions();
  }

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.announcementService.getAnnouncements().subscribe({
      next: (announcements) => {
        this.loading = false;
        this.announcements = (announcements || []).sort((left, right) => {
          return this.toTime(right.createdAt) - this.toTime(left.createdAt);
        });
      },
      error: () => {
        this.loading = false;
        this.announcements = [];
        this.errorMessage = 'Unable to load announcements right now. Please refresh and try again.';
      }
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

  getTypeLabel(announcement: Announcement): string {
    const type = announcement.type || 'general';
    if (type === 'event') {
      return 'Event';
    }
    if (type === 'task') {
      return 'Task';
    }

    return 'General';
  }

  getTypeChipClasses(announcement: Announcement): string {
    const type = announcement.type || 'general';
    if (type === 'event') {
      return 'bg-emerald-50 text-emerald-700';
    }
    if (type === 'task') {
      return 'bg-amber-50 text-amber-700';
    }

    return 'bg-blue-50 text-blue-700';
  }

  getCtaLabel(announcement: Announcement): string {
    const type = announcement.type || 'general';
    if (type === 'event') {
      return 'Register Now';
    }
    return 'View Details';
  }

  onActionClick(announcement: Announcement): void {
    const type = announcement.type || 'general';
    const referenceId = Number(announcement.referenceId);

    if (type === 'event' && Number.isFinite(referenceId) && referenceId > 0) {
      this.router.navigate(['/events', referenceId]);
      return;
    }

    if (type === 'task' && Number.isFinite(referenceId) && referenceId > 0) {
      this.router.navigate(['/tasks', referenceId]);
      return;
    }

    this.activeGeneralAnnouncement = announcement;
  }

  closeGeneralAnnouncementModal(): void {
    this.activeGeneralAnnouncement = undefined;
  }

  markAsRead(announcement: Announcement): void {
    if (!announcement.id || announcement.read) {
      return;
    }

    this.announcementService.markAsRead(announcement.id).subscribe({
      next: (updatedAnnouncement) => {
        this.announcements = this.announcements.map((item) => {
          if (item.id !== announcement.id) {
            return item;
          }

          return {
            ...item,
            ...updatedAnnouncement,
            read: true
          };
        });

        if (this.activeGeneralAnnouncement?.id === announcement.id) {
          this.activeGeneralAnnouncement = {
            ...this.activeGeneralAnnouncement,
            ...updatedAnnouncement,
            read: true
          };
        }
      }
    });
  }

  hasActionTarget(announcement: Announcement): boolean {
    const type = announcement.type || 'general';
    if (type === 'general') {
      return true;
    }

    const referenceId = Number(announcement.referenceId);
    return Number.isFinite(referenceId) && referenceId > 0;
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

  private toTime(value: string | undefined): number {
    if (!value) {
      return 0;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 0;
    }

    return parsed.getTime();
  }

}
