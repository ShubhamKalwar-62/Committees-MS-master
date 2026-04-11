export interface Task {
  id?: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  committeeId?: number;
  createdById?: number;
  assignedToId?: number;
}
