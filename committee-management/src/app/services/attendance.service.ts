import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Attendance } from '../models/attendance.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  getAttendanceList(): Observable<Attendance[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl).pipe(
      map((res) => (res.data || []).map((item) => this.mapAttendance(item)))
    );
  }

  markAttendance(payload: Attendance): Observable<Attendance> {
    return this.http.post<ApiResponse<unknown>>(this.apiUrl, this.mapCreatePayload(payload)).pipe(
      map((res) => this.mapAttendance(res.data))
    );
  }

  private mapAttendance(raw: unknown): Attendance {
    const data = (raw || {}) as {
      attendanceId?: number;
      id?: number;
      status?: string;
      checkInTime?: string;
      checkOutTime?: string;
      attendanceMethod?: string;
      remarks?: string;
      user?: { userId?: number };
      event?: { eventId?: number };
      markedBy?: { userId?: number };
    };

    return {
      id: data.attendanceId ?? data.id,
      userId: data.user?.userId ?? 0,
      eventId: data.event?.eventId ?? 0,
      status: data.status || 'PRESENT',
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      attendanceMethod: data.attendanceMethod,
      markedBy: data.markedBy?.userId,
      remarks: data.remarks
    };
  }

  private mapCreatePayload(payload: Attendance): unknown {
    return {
      user: { userId: payload.userId },
      event: { eventId: payload.eventId },
      status: payload.status,
      checkInTime: payload.checkInTime,
      checkOutTime: payload.checkOutTime,
      attendanceMethod: payload.attendanceMethod,
      remarks: payload.remarks,
      ...(payload.markedBy ? { markedBy: { userId: Number(payload.markedBy) } } : {})
    };
  }
}
