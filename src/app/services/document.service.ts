import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocumentRequest, DocumentResponse } from '../models/document.model';
import { CommentResponse } from '../models/comment.model';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}
    private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  getAllDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}`);
  }

  getDocumentById(id: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getDocumentsByRepositoryId(repositoryId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/repository/${repositoryId}`);
  }

  getDocumentsByUserId(userId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  getDocumentByVersion(documentId: number, version: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.apiUrl}/${documentId}/version/${version}`);
  }

  getCommentsByDocumentId(documentId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.apiUrl}/${documentId}/comments`);
  }

  createDocument(request: DocumentRequest): Observable<DocumentResponse> {
    return this.http.post<DocumentResponse>(`${this.apiUrl}`, request, {
      headers: this.getAuthHeaders()
    });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteDocumentByVersion(documentId: number, version: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}/version/${version}`, {
      headers: this.getAuthHeaders()
    });
  }
}
