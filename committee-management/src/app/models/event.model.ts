export interface Event {
  id?: number;
  eventName: string;
  description?: string;
  eventDate: string;
  location?: string;
  status?: string;
  maxParticipants?: number;
  committeeId?: number;
  categoryId?: number;
  registrationId?: number;
  registrationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredAt?: string;
  approvedAt?: string | null;
}
