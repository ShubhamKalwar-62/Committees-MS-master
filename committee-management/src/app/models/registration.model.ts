export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EventRegistration {
  id?: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  eventId: number;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  registeredAt?: string;
  approvedAt?: string | null;
  attended?: boolean;
  status: RegistrationStatus;
}
