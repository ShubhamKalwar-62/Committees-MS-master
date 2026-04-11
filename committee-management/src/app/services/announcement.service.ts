import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Announcement } from '../models/announcement.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly apiUrl = 'http://localhost:8080/api/announcements';

  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl).pipe(
      map((res) => (res.data || []).map((item) => this.mapAnnouncement(item)))
    );
  }

  createAnnouncement(payload: Announcement): Observable<Announcement> {
    return this.http.post<ApiResponse<unknown>>(this.apiUrl, this.mapCreatePayload(payload)).pipe(
      map((res) => this.mapAnnouncement(res.data))
    );
  }

  private mapAnnouncement(raw: unknown): Announcement {
    const data = (raw || {}) as {
      announcementId?: number;
      id?: number;
      message?: string;
      title?: string;
      createdAt?: string;
      committee?: { committeeId?: number };
      user?: { userId?: number };
    };

    return {
      id: data.announcementId ?? data.id,
      message: data.message ?? data.title ?? '',
      committeeId: data.committee?.committeeId,
      userId: data.user?.userId,
      createdAt: data.createdAt
    };
  }

  private mapCreatePayload(payload: Announcement): unknown {
    return {
      message: payload.message,
      committee: { committeeId: payload.committeeId ?? 1 },
      user: { userId: payload.userId ?? 1 }
    };
  }
}
