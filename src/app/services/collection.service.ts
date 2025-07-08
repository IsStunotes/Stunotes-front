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
   
   getCollections(userId:number): Observable<CollectionResponse[]> {
      return this.http.get<CollectionResponse[]>(`${this.apiUrl}/user/${userId}`);
   }
   
   getCollectionsWithPagination(
      /*page: number = 0, 
      size: number = 5, 
      sortBy: string = 'name', 
      sortDir: string = 'asc'*/
      userId: number
   ): Observable<PagedResponse<CollectionResponse>> {
     
      return this.http.get<PagedResponse<CollectionResponse>>(`${this.apiUrl}/user/${userId}/paginated`);
   }
   getAllCollections( userId: number ): Observable<CollectionResponse[]> {
      return this.http.get<CollectionResponse[]>(`${this.apiUrl}/user/${userId}`);
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

