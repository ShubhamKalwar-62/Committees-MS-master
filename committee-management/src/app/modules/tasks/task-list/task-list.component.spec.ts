import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { TaskListComponent } from './task-list.component';
import { Task } from '../../../models/task.model';
import { MyProfileResponse } from '../../../models/auth.model';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { TaskService } from '../../../services/task.service';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const baseProfile: MyProfileResponse = {
    email: 'student@test.local',
    role: 'STUDENT',
    userId: 7,
    committeeMemberships: []
  };

  const buildTask = (id: number, overrides: Partial<Task> = {}): Task => ({
    id,
    title: `Task ${id}`,
    description: `Description ${id}`,
    status: 'PENDING',
    priority: 'MEDIUM',
    startDate: '2026-04-20T10:00:00',
    endDate: '2026-04-21T10:00:00',
    committeeId: 10,
    createdById: 4,
    assignedToId: 9,
    ...overrides
  });

  const initComponent = (tasks: Task[], profileOverrides: Partial<MyProfileResponse> = {}, canManage = false): void => {
    taskServiceSpy.getTasks.and.returnValue(of(tasks));
    authServiceSpy.getMyProfile.and.returnValue(of({ ...baseProfile, ...profileOverrides }));
    authServiceSpy.canManageCreationActions.and.returnValue(canManage);

    component.ngOnInit();
  };

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj<TaskService>('TaskService', ['getTasks', 'markTaskAsComplete']);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['canManageCreationActions', 'getMyProfile']);
    notificationServiceSpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    initComponent([]);
    expect(component).toBeTruthy();
  });

  it('should split tasks into my tasks and committee tasks using profile context', () => {
    initComponent(
      [
        buildTask(1, { assignedToId: 7, committeeId: 10 }),
        buildTask(2, { assignedToId: 11, committeeId: 10 }),
        buildTask(3, { assignedToId: 11, committeeId: 55 })
      ],
      { committeeMemberships: [{ committeeId: 10 }] }
    );

    expect(component.myTasks.map((task) => task.id)).toEqual([1]);
    expect(component.committeeTasks.map((task) => task.id)).toEqual([2]);
    expect(component.activeView).toBe('MY');
  });

  it('should switch to committee view when there are no my tasks but committee tasks exist', () => {
    initComponent(
      [
        buildTask(10, { assignedToId: 99, committeeId: 10 })
      ],
      { committeeMemberships: [{ committeeId: 10 }] }
    );

    expect(component.myTasks.length).toBe(0);
    expect(component.committeeTasks.length).toBe(1);
    expect(component.activeView).toBe('COMMITTEE');
  });

  it('should filter displayed tasks by status and priority', () => {
    component.activeView = 'COMMITTEE';
    component.committeeTasks = [
      buildTask(21, { status: 'PENDING', priority: 'HIGH' }),
      buildTask(22, { status: 'COMPLETED', priority: 'HIGH' }),
      buildTask(23, { status: 'PENDING', priority: 'LOW' })
    ];

    component.statusFilter = 'PENDING';
    component.priorityFilter = 'HIGH';

    expect(component.displayedTasks.map((task) => task.id)).toEqual([21]);
  });

  it('should filter tasks by inclusive deadline date boundaries', () => {
    component.activeView = 'COMMITTEE';
    component.committeeTasks = [
      buildTask(31, { endDate: '2026-04-21T00:00:00' }),
      buildTask(32, { endDate: '2026-04-21T23:30:00' }),
      buildTask(33, { endDate: '2026-04-22T00:00:00' })
    ];

    component.deadlineFrom = '2026-04-21';
    component.deadlineTo = '2026-04-21';

    expect(component.displayedTasks.map((task) => task.id)).toEqual([31, 32]);
  });

  it('should clear all filters and disable active-filter state', () => {
    component.statusFilter = 'PENDING';
    component.priorityFilter = 'HIGH';
    component.deadlineFrom = '2026-04-20';
    component.deadlineTo = '2026-04-21';

    expect(component.hasActiveFilters).toBeTrue();

    component.clearFilters();

    expect(component.statusFilter).toBe('ALL');
    expect(component.priorityFilter).toBe('ALL');
    expect(component.deadlineFrom).toBe('');
    expect(component.deadlineTo).toBe('');
    expect(component.hasActiveFilters).toBeFalse();
  });

  it('should mark task as complete and publish success feedback', () => {
    const task = buildTask(41, {
      title: 'Complete report',
      assignedToId: 7,
      committeeId: 10,
      status: 'PENDING'
    });

    initComponent([task], { committeeMemberships: [{ committeeId: 10 }] });
    taskServiceSpy.markTaskAsComplete.and.returnValue(of({ ...task, status: 'COMPLETED' }));

    component.markTaskAsComplete(task);

    expect(taskServiceSpy.markTaskAsComplete).toHaveBeenCalledOnceWith(41);
    expect(component.tasks.find((item) => item.id === 41)?.status).toBe('COMPLETED');
    expect(component.infoMessageType).toBe('success');
    expect(component.infoMessage).toContain('marked as complete');
    expect(notificationServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Task Completed',
      level: 'success'
    }));
    expect(component.isCompletingTask(41)).toBeFalse();
  });

  it('should show error feedback when mark complete fails with forbidden access', () => {
    const task = buildTask(42, {
      title: 'Restricted task',
      assignedToId: 7,
      committeeId: 10,
      status: 'PENDING'
    });

    initComponent([task], { committeeMemberships: [{ committeeId: 10 }] });
    taskServiceSpy.markTaskAsComplete.and.returnValue(
      throwError(() => ({ status: 403, message: 'Forbidden' }))
    );

    component.markTaskAsComplete(task);

    expect(taskServiceSpy.markTaskAsComplete).toHaveBeenCalledOnceWith(42);
    expect(component.tasks.find((item) => item.id === 42)?.status).toBe('PENDING');
    expect(component.infoMessageType).toBe('error');
    expect(component.infoMessage).toBe('You are not allowed to complete this task.');
    expect(notificationServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Unable To Complete Task',
      level: 'error',
      message: 'You are not allowed to complete this task.'
    }));
    expect(component.isCompletingTask(42)).toBeFalse();
  });
});



