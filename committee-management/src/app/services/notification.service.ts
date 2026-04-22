import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  createdAt: number;
  read: boolean;
  actionRoute?: string;
};

export type CreateNotificationInput = {
  title: string;
  message: string;
  level?: NotificationLevel;
  actionRoute?: string;
};

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly storageKey = 'committee_ms_notifications_v1';
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>(this.loadNotifications());

  readonly notifications$ = this.notificationsSubject.asObservable();

  get notifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  get unreadCount(): number {
    return this.notificationsSubject.value.filter((item) => !item.read).length;
  }

  add(input: CreateNotificationInput): AppNotification {
    const item: AppNotification = {
      id: this.generateId(),
      title: input.title,
      message: input.message,
      level: input.level || 'info',
      actionRoute: input.actionRoute,
      createdAt: Date.now(),
      read: false
    };

    const nextList = [item, ...this.notificationsSubject.value].slice(0, 50);
    this.updateState(nextList);
    return item;
  }

  markAsRead(id: string): void {
    const nextList = this.notificationsSubject.value.map((item) =>
      item.id === id ? { ...item, read: true } : item
    );
    this.updateState(nextList);
  }

  markAllAsRead(): void {
    const nextList = this.notificationsSubject.value.map((item) => ({ ...item, read: true }));
    this.updateState(nextList);
  }

  remove(id: string): void {
    const nextList = this.notificationsSubject.value.filter((item) => item.id !== id);
    this.updateState(nextList);
  }

  clearAll(): void {
    this.updateState([]);
  }

  private updateState(items: AppNotification[]): void {
    this.notificationsSubject.next(items);
    this.saveNotifications(items);
  }

  private loadNotifications(): AppNotification[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as AppNotification[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item) =>
        !!item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.message === 'string' &&
        typeof item.createdAt === 'number' &&
        typeof item.read === 'boolean'
      );
    } catch {
      return [];
    }
  }

  private saveNotifications(items: AppNotification[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {
      // Ignore persistence failures; in-memory state still works.
    }
  }

  private generateId(): string {
    return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
