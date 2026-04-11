import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Committee } from '../../../models/committee.model';
import { Task } from '../../../models/task.model';
import { User } from '../../../models/user.model';
import { CommitteeService } from '../../../services/committee.service';
import { TaskService } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-task-create',
  standalone: false,
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.css'
})
export class TaskCreateComponent {
  private fb = inject(FormBuilder);

  submitting = false;
  errorMessage = '';
  committees: Committee[] = [];
  users: User[] = [];

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['PENDING'],
    priority: ['MEDIUM'],
    startDate: [''],
    endDate: [''],
    committeeId: [1, Validators.required],
    createdById: [1, Validators.required],
    assignedToId: [null as number | null]
  });

  constructor(
    private taskService: TaskService,
    private committeeService: CommitteeService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.committeeService.getCommittees().subscribe((committees) => {
      this.committees = committees;
      if (!this.taskForm.value.committeeId && committees.length > 0) {
        this.taskForm.patchValue({ committeeId: committees[0].id || 1 });
      }
    });

    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      if (!this.taskForm.value.createdById && users.length > 0) {
        this.taskForm.patchValue({ createdById: users[0].id || 1 });
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.taskService.createTask(this.taskForm.getRawValue() as Task).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Unable to create task. Check Committee/User IDs and data values.';
      }
    });
  }
}
