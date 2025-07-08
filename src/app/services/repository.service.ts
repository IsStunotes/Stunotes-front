// repository.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepositoryRequest, RepositoryResponse } from '../models/repository.model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private apiUrl = `${environment.apiUrl}/repositories`;

  constructor(private http: HttpClient) {}
    private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

 getAllRepositories(): Observable<RepositoryResponse[]> {
    return this.http.get<RepositoryResponse[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  saveRepository(request: RepositoryRequest): Observable<RepositoryResponse> {
    return this.http.post<RepositoryResponse>(this.apiUrl, request, {
      headers: this.getAuthHeaders()
    });
  }

  getRepositoryById(id: number): Observable<RepositoryResponse> {
    return this.http.get<RepositoryResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteRepository(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getRepositoriesByUsuarioId(usuarioId: number): Observable<RepositoryResponse[]> {
    return this.http.get<RepositoryResponse[]>(`${this.apiUrl}/usuario/${usuarioId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
