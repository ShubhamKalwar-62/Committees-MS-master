import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl).pipe(
      map((res) => (res.data || []).map((item) => this.mapUser(item)))
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => this.mapUser(res.data))
    );
  }

  private mapUser(raw: unknown): User {
    const data = (raw || {}) as {
      userId?: number;
      id?: number;
      name?: string;
      login?: { email?: string; role?: string; loginId?: number };
    };

    return {
      id: data.userId ?? data.id,
      name: data.name || '',
      email: data.login?.email,
      role: data.login?.role,
      loginId: data.login?.loginId
    };
  }
}
