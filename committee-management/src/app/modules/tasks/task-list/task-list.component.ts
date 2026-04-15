import { Component } from '@angular/core';
import { getTaskPriorityBadgeClass, getTaskStatusBadgeClass } from '../../../shared/utils/badge.utils';
import { Task } from '../../../models/task.model';
import { AuthService } from '../../../services/auth.service';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  tasks: Task[] = [];

  constructor(private taskService: TaskService, private authService: AuthService) {}

  get canCreateTask(): boolean {
    return this.authService.canManageCreationActions();
  }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
    });
  }

  getTaskStatusBadgeClass(status: string | undefined): string {
    return getTaskStatusBadgeClass(status);
  }

  getPriorityBadgeClass(priority: string | undefined): string {
    return getTaskPriorityBadgeClass(priority);
  }

  formatDate(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

}
