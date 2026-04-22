export interface Task {
  id?: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  committeeId?: number;
  committeeName?: string;
  createdById?: number;
  createdByName?: string;
  assignedToId?: number;
  assignedToName?: string;
}
