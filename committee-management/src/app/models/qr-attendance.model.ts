export interface QrAttendanceSession {
  sessionId: number;
  eventId: number;
  eventName?: string;
  qrToken: string;
  expiresAt?: string;
  createdAt?: string;
  endedAt?: string | null;
  remainingSeconds: number;
  liveAttendanceCount: number;
}

export interface QrScanResult {
  attendanceId?: number;
  userId?: number;
  userName?: string;
  eventId?: number;
  eventName?: string;
  status?: string;
  method?: string;
  checkInTime?: string;
}
