import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = 'http://localhost:8080/api/events';
  private readonly participantUrl = 'http://localhost:8080/api/event-participants';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(payload: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, payload);
  }

  registerForEvent(eventId: number, userId: number): Observable<unknown> {
    return this.http.post(this.participantUrl, { event: { id: eventId }, user: { id: userId } });
  }
}
