import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Committee } from '../models/committee.model';

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {
  private readonly apiUrl = 'http://localhost:8080/api/committees';

  constructor(private http: HttpClient) {}

  getCommittees(): Observable<Committee[]> {
    return this.http.get<Committee[]>(this.apiUrl);
  }

  getCommitteeById(id: number): Observable<Committee> {
    return this.http.get<Committee>(`${this.apiUrl}/${id}`);
  }
}
