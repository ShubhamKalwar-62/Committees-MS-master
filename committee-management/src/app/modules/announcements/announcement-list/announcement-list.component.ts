import { Component } from '@angular/core';
import { Announcement } from '../../../models/announcement.model';
import { AnnouncementService } from '../../../services/announcement.service';

@Component({
  selector: 'app-announcement-list',
  standalone: false,
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.css'
})
export class AnnouncementListComponent {
  announcements: Announcement[] = [];

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.announcementService.getAnnouncements().subscribe((announcements) => {
      this.announcements = announcements;
    });
  }

}
