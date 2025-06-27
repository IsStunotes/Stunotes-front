import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentRequest, CommentResponse } from '../models/comment.model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}
    private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllComments(headers?: HttpHeaders): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(this.apiUrl, { headers });
  }

  saveComment(request: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(this.apiUrl, request, {
      headers: this.getAuthHeaders()
    });
  }

  getCommentById(id: number): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCommentsByDocumentId(documentId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.apiUrl}/document/${documentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  addCommentToDocument(documentId: number, request: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.apiUrl}/document/${documentId}`, request, {
      headers: this.getAuthHeaders()
    });
  }
}
   