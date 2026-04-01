import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  getAttendanceList(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(this.apiUrl);
  }

  markAttendance(payload: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(this.apiUrl, payload);
  }
}
