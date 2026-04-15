import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Committee } from '../models/committee.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {
  private readonly apiUrl = 'http://localhost:8080/api/committees';

  constructor(private http: HttpClient) {}

  getCommittees(): Observable<Committee[]> {
    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl).pipe(
      map((res) => (res.data || []).map((item) => this.mapCommittee(item)))
    );
  }

  getCommitteeById(id: number): Observable<Committee> {
    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => this.mapCommittee(res.data))
    );
  }

  private mapCommittee(raw: unknown): Committee {
    const data = (raw || {}) as {
      committeeId?: number;
      id?: number;
      committeeID?: number;
      committee_id?: number;
      committeeName?: string;
      facultyInchargeName?: string;
      facultyPosition?: string;
      committeeInfo?: string;
      head?: { userId?: number };
      login?: { loginId?: number };
    };

    const idCandidate = data.committeeId ?? data.id ?? data.committeeID ?? data.committee_id;
    const resolvedId = Number(idCandidate);

    return {
      id: Number.isFinite(resolvedId) ? resolvedId : undefined,
      committeeName: data.committeeName || '',
      facultyInchargeName: data.facultyInchargeName,
      facultyPosition: data.facultyPosition,
      committeeInfo: data.committeeInfo,
      headId: data.head?.userId,
      loginId: data.login?.loginId
    };
  }
}
