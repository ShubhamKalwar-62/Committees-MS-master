import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task } from '../models/task.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl).pipe(
      map((res) => (res.data || []).map((item) => this.mapTask(item)))
    );
  }

  createTask(payload: Task): Observable<Task> {
    return this.http.post<ApiResponse<unknown>>(this.apiUrl, this.mapCreatePayload(payload)).pipe(
      map((res) => this.mapTask(res.data))
    );
  }

  private mapTask(raw: unknown): Task {
    const data = (raw || {}) as {
      taskId?: number;
      id?: number;
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      startDate?: string;
      endDate?: string;
      committee?: { committeeId?: number };
      assignedTo?: { userId?: number };
      createdBy?: { userId?: number };
    };

    return {
      id: data.taskId ?? data.id,
      title: data.title || '',
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.startDate,
      endDate: data.endDate,
      committeeId: data.committee?.committeeId,
      assignedToId: data.assignedTo?.userId,
      createdById: data.createdBy?.userId
    };
  }

  private mapCreatePayload(payload: Task): unknown {
    return {
      title: payload.title,
      description: payload.description,
      status: payload.status || 'PENDING',
      priority: payload.priority || 'MEDIUM',
      startDate: payload.startDate,
      endDate: payload.endDate,
      committee: { committeeId: payload.committeeId ?? 1 },
      createdBy: { userId: payload.createdById ?? 1 },
      ...(payload.assignedToId ? { assignedTo: { userId: payload.assignedToId } } : {})
    };
  }
}
