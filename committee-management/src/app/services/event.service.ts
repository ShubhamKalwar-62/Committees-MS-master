import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Event } from '../models/event.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = 'http://localhost:8080/api/events';
  private readonly participantUrl = 'http://localhost:8080/api/event-participants';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl).pipe(
      map((res) => (res.data || []).map((item) => this.mapEvent(item)))
    );
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => this.mapEvent(res.data))
    );
  }

  createEvent(payload: Event): Observable<Event> {
    return this.http.post<ApiResponse<unknown>>(this.apiUrl, this.mapCreatePayload(payload)).pipe(
      map((res) => this.mapEvent(res.data))
    );
  }

  registerForEvent(eventId: number, userId: number): Observable<unknown> {
    return this.http.post(this.participantUrl, {
      event: { eventId },
      user: { userId }
    });
  }

  private mapEvent(raw: unknown): Event {
    const data = (raw || {}) as {
      eventId?: number;
      id?: number;
      eventName?: string;
      description?: string;
      eventDate?: string;
      location?: string;
      venue?: string;
      status?: string;
      maxParticipants?: number;
      committee?: { committeeId?: number };
      category?: { categoryId?: number };
      committeeId?: number;
      categoryId?: number;
    };

    return {
      id: data.eventId ?? data.id,
      eventName: data.eventName || '',
      description: data.description,
      eventDate: data.eventDate || '',
      location: data.location ?? data.venue,
      status: data.status,
      maxParticipants: data.maxParticipants,
      committeeId: data.committee?.committeeId ?? data.committeeId,
      categoryId: data.category?.categoryId ?? data.categoryId
    };
  }

  private mapCreatePayload(payload: Event): unknown {
    return {
      eventName: payload.eventName,
      description: payload.description,
      eventDate: payload.eventDate,
      location: payload.location,
      status: payload.status || 'PLANNED',
      maxParticipants: payload.maxParticipants ?? 50,
      committee: { committeeId: payload.committeeId ?? 1 },
      ...(payload.categoryId ? { category: { categoryId: payload.categoryId } } : {})
    };
  }
}
