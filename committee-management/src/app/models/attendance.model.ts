export interface Attendance {
  id?: number;
  userId: number;
  eventId: number;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  attendanceMethod?: string;
  markedBy?: string;
  remarks?: string;
}
