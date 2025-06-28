import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Collection, CollectionRequest, CollectionResponse, PagedResponse } from '../models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
   private apiUrl = `${environment.apiUrl}/collections`;
   
   constructor(private http: HttpClient) {}
   
   getCollections(): Observable<CollectionResponse[]> {
      return this.http.get<CollectionResponse[]>(this.apiUrl);
   }
   
   getCollectionsWithPagination(
      page: number = 0, 
      size: number = 5, 
      sortBy: string = 'name', 
      sortDir: string = 'asc'
   ): Observable<PagedResponse<CollectionResponse>> {
      let params = new HttpParams()
         .set('page', page.toString())
         .set('size', size.toString())
         .set('sortBy', sortBy)
         .set('sortDir', sortDir);
   
      return this.http.get<PagedResponse<CollectionResponse>>(`${this.apiUrl}/page`, { params });
   }
   getAllCollections(): Observable<CollectionResponse[]> {
      return this.http.get<CollectionResponse[]>(this.apiUrl);
   }

   getCollectionById(id: number): Observable<CollectionResponse> {
      return this.http.get<CollectionResponse>(`${this.apiUrl}/${id}`);
   }
   
   createCollection(collection: CollectionRequest): Observable<CollectionResponse> {
      return this.http.post<CollectionResponse>(this.apiUrl, collection);
   }
   
   updateCollection(id: number, collection: CollectionRequest): Observable<CollectionResponse> {
      return this.http.put<CollectionResponse>(`${this.apiUrl}/${id}`, collection);
   }
   
   deleteCollection(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
   }
}

