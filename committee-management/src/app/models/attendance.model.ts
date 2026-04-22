export interface Attendance {
  id?: number;
  userId: number;
  userName?: string;
  eventId: number;
  eventTitle?: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  attendanceMethod?: string;
  markedBy?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}
