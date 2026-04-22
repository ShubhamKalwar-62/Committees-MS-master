import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Announcement, AnnouncementType } from '../models/announcement.model';
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

  markAsRead(announcementId: number): Observable<Announcement> {
    return this.http.patch<ApiResponse<unknown>>(`${this.apiUrl}/${announcementId}/read`, {}).pipe(
      map((res) => this.mapAnnouncement(res.data))
    );
  }

  private mapAnnouncement(raw: unknown): Announcement {
    const data = (raw || {}) as {
      announcementId?: number;
      id?: number;
      message?: string;
      title?: string;
      type?: string;
      announcementType?: string;
      referenceId?: number;
      read?: boolean;
      isRead?: boolean;
      important?: boolean;
      isImportant?: boolean;
      createdAt?: string;
      committee?: { committeeId?: number };
      user?: { userId?: number };
    };

    const resolvedType = this.normalizeType(data.type ?? data.announcementType);
    const resolvedReferenceId = Number(data.referenceId);

    return {
      id: data.announcementId ?? data.id,
      message: data.message ?? data.title ?? '',
      type: resolvedType,
      referenceId: Number.isFinite(resolvedReferenceId) ? resolvedReferenceId : null,
      read: Boolean(data.read ?? data.isRead),
      important: Boolean(data.important ?? data.isImportant),
      committeeId: data.committee?.committeeId,
      userId: data.user?.userId,
      createdAt: data.createdAt
    };
  }

  private mapCreatePayload(payload: Announcement): unknown {
    const resolvedType = this.normalizeType(payload.type);

    return {
      message: payload.message,
      type: resolvedType,
      referenceId: resolvedType === 'general' ? null : payload.referenceId,
      read: Boolean(payload.read),
      important: Boolean(payload.important),
      committee: { committeeId: payload.committeeId ?? 1 },
      user: { userId: payload.userId ?? 1 }
    };
  }

  private normalizeType(rawType: unknown): AnnouncementType {
    const normalized = String(rawType ?? 'general').trim().toLowerCase();
    if (normalized === 'event' || normalized === 'task') {
      return normalized;
    }

    return 'general';
  }
}
