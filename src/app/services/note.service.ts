import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Note, NoteRequest, NoteResponse, PagedResponse } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
   private apiUrl = `${environment.apiUrl}/notes`;

   constructor(private http: HttpClient) {}

   getNotes( //Con paginación y ordenamiento
      userId?: number,
      collectionId?: number,
      searchTerm?: string,
      page: number = 0, 
      size: number = 15,
      sortBy?: string,
      sortDirection?: 'asc' | 'desc'
   ): Observable<PagedResponse<NoteResponse>> {
      let params = new HttpParams()
         .set('page', page.toString())
         .set('size', size.toString());
      
      if (collectionId){
         params = params.set('collectionId', collectionId.toString());
      }
      if (searchTerm && searchTerm.trim()) {
         params = params.set('searchTerm', searchTerm.trim());
      }
      if (userId) {
         params = params.set('user_id', userId.toString());
      }
      if (sortBy) {
         const sortParam = sortDirection ? `${sortBy},${sortDirection}` : sortBy;
         params = params.set('sort', sortParam);
      }
      console.log('Obteniendo notas con parámetros:', params.toString());  
      return this.http.get<PagedResponse<NoteResponse>>(this.apiUrl, { params });
   }

   searchNotesByCollectionName(
      collectionName: string,
      page: number = 0, 
      size: number = 15,
      sortBy?: string,
      sortDirection?: 'asc' | 'desc'
   ): Observable<PagedResponse<NoteResponse>> {
      let params = new HttpParams()
         .set('page', page.toString())
         .set('size', size.toString())
         .set('collectionName', collectionName);
      // Agregar parámetros de ordenamiento
      if (sortBy) {
         const sortParam = sortDirection ? `${sortBy},${sortDirection}` : sortBy;
         params = params.set('sort', sortParam);
      }
      return this.http.get<PagedResponse<NoteResponse>>(this.apiUrl, { params });
   }

   getAllNotes(): Observable<NoteResponse[]> {
      return this.http.get<NoteResponse[]>(this.apiUrl);
   }
   getNoteById(id: number): Observable<NoteResponse> {         
      return this.http.get<NoteResponse>(`${this.apiUrl}/${id}`);
   }
   createNote(note: NoteRequest): Observable<NoteResponse> {
      return this.http.post<NoteResponse>(this.apiUrl, note);
   }
   updateNote(id: number, note: NoteRequest): Observable<NoteResponse> {
      return this.http.patch<NoteResponse>(`${this.apiUrl}/${id}`, note);
   }
   deleteNote(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
   }
}
