import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Attendance } from '../models/attendance.model';
import { ApiResponse } from '../models/auth.model';
import { QrAttendanceSession, QrScanResult } from '../models/qr-attendance.model';

export type AttendanceFilters = {
  eventId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
};

export type AttendanceCreatePayload = {
  userId: number;
  eventId: number;
  status: string;
  checkInTime?: string;
  remarks?: string;
  markedBy?: number;
};

export type MarkAllPresentOptions = {
  checkInTime?: string;
  remarks?: string;
  markedBy?: number;
};

export type QrSessionStartPayload = {
  eventId: number;
  durationMinutes?: number;
};

export type QrSessionRefreshPayload = {
  durationSeconds?: number;
};

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  getAttendanceList(filters?: AttendanceFilters): Observable<Attendance[]> {
    let params = new HttpParams();
    if (filters?.eventId) {
      params = params.set('eventId', String(filters.eventId));
    }
    if (filters?.userId) {
      params = params.set('userId', String(filters.userId));
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl, { params }).pipe(
      map((res) => (res.data || []).map((item) => this.mapAttendance(item)))
    );
  }

  markAttendance(payload: AttendanceCreatePayload): Observable<Attendance> {
    return this.http.post<ApiResponse<unknown>>(this.apiUrl, this.mapCreatePayload(payload)).pipe(
      map((res) => this.mapAttendance(res.data))
    );
  }

  markAllPresent(eventId: number, options?: MarkAllPresentOptions): Observable<Attendance[]> {
    return this.http.post<ApiResponse<unknown[]>>(`${this.apiUrl}/mark-all-present`, {
      event_id: eventId,
      checkInTime: options?.checkInTime,
      remarks: options?.remarks,
      ...(options?.markedBy ? { marked_by: options.markedBy } : {})
    }).pipe(
      map((res) => (res.data || []).map((item) => this.mapAttendance(item)))
    );
  }

  startQrSession(payload: QrSessionStartPayload): Observable<QrAttendanceSession> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/qr-session/start`, {
      event_id: payload.eventId,
      ...(payload.durationMinutes ? { durationMinutes: payload.durationMinutes } : {})
    }).pipe(
      map((res) => this.mapQrSession(res.data))
    );
  }

  getQrSession(sessionId: number): Observable<QrAttendanceSession> {
    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/qr-session/${sessionId}`).pipe(
      map((res) => this.mapQrSession(res.data))
    );
  }

  refreshQrSession(sessionId: number, payload?: QrSessionRefreshPayload): Observable<QrAttendanceSession> {
    const body = payload?.durationSeconds ? { durationSeconds: payload.durationSeconds } : {};
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/qr-session/${sessionId}/refresh`, body).pipe(
      map((res) => this.mapQrSession(res.data))
    );
  }

  endQrSession(sessionId: number): Observable<QrAttendanceSession> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/qr-session/${sessionId}/end`, {}).pipe(
      map((res) => this.mapQrSession(res.data))
    );
  }

  scanQrAttendance(qrToken: string, userId?: number): Observable<QrScanResult> {
    const safeUserId = Number(userId);

    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/scan`, {
      qr_token: qrToken,
      ...(Number.isFinite(safeUserId) && safeUserId > 0 ? { user_id: safeUserId } : {})
    }).pipe(
      map((res) => this.mapQrScanResult(res.data))
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
      createdAt?: string;
      updatedAt?: string;
      user?: { userId?: number; name?: string };
      userName?: string;
      event?: { eventId?: number; eventName?: string };
      eventTitle?: string;
      markedBy?: { userId?: number };
    };

    return {
      id: data.attendanceId ?? data.id,
      userId: data.user?.userId ?? 0,
      userName: data.user?.name || data.userName,
      eventId: data.event?.eventId ?? 0,
      eventTitle: data.event?.eventName || data.eventTitle,
      status: data.status || 'PRESENT',
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      attendanceMethod: data.attendanceMethod,
      markedBy: data.markedBy?.userId,
      remarks: data.remarks,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private mapCreatePayload(payload: AttendanceCreatePayload): unknown {
    return {
      user_id: payload.userId,
      event_id: payload.eventId,
      status: payload.status,
      checkInTime: payload.checkInTime,
      remarks: payload.remarks,
      ...(payload.markedBy ? { marked_by: Number(payload.markedBy) } : {})
    };
  }

  private mapQrSession(raw: unknown): QrAttendanceSession {
    const data = (raw || {}) as {
      sessionId?: number;
      id?: number;
      eventId?: number;
      event_id?: number;
      eventName?: string;
      qrToken?: string;
      qr_token?: string;
      expiresAt?: string;
      createdAt?: string;
      endedAt?: string | null;
      remainingSeconds?: number;
      liveAttendanceCount?: number;
    };

    const remainingSeconds = Number(data.remainingSeconds);
    const liveAttendanceCount = Number(data.liveAttendanceCount);

    return {
      sessionId: data.sessionId ?? data.id ?? 0,
      eventId: data.eventId ?? data.event_id ?? 0,
      eventName: data.eventName,
      qrToken: data.qrToken ?? data.qr_token ?? '',
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
      endedAt: data.endedAt ?? null,
      remainingSeconds: Number.isFinite(remainingSeconds) ? Math.max(remainingSeconds, 0) : 0,
      liveAttendanceCount: Number.isFinite(liveAttendanceCount) ? Math.max(liveAttendanceCount, 0) : 0
    };
  }

  private mapQrScanResult(raw: unknown): QrScanResult {
    const data = (raw || {}) as {
      attendanceId?: number;
      userId?: number;
      userName?: string;
      eventId?: number;
      eventName?: string;
      status?: string;
      method?: string;
      checkInTime?: string;
    };

    return {
      attendanceId: data.attendanceId,
      userId: data.userId,
      userName: data.userName,
      eventId: data.eventId,
      eventName: data.eventName,
      status: data.status,
      method: data.method,
      checkInTime: data.checkInTime
    };
  }
}
