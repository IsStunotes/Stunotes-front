import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest, TaskResponse, PagedResponse } from '../models/task.model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(
    page: number = 0, 
    size: number = 15, 
    categoryId?: number,
    searchTerm?: string
  ): Observable<PagedResponse<TaskResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (categoryId) {
      params = params.set('categoryName', categoryId.toString());
    }
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('categoryName', searchTerm.trim());
    }
    
    return this.http.get<PagedResponse<TaskResponse>>(this.apiUrl, { params });
  }

  searchTasksByCategoryName(
    categoryName: string,
    page: number = 0, 
    size: number = 15
  ): Observable<PagedResponse<TaskResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('categoryName', categoryName);
    
    return this.http.get<PagedResponse<TaskResponse>>(this.apiUrl, { params });
  }

  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/${id}`);
  }

  createTask(task: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.apiUrl, task);
  }

  updateTask(id: number, task: Partial<TaskRequest>): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAsCompleted(id: number): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${id}/complete`, {});
  }

  getActiveTasks(page: number = 0, size: number = 15): Observable<PagedResponse<TaskResponse>> {
    return this.getTasks(page, size);
  }

  getCompletedTasks(page: number = 0, size: number = 15): Observable<PagedResponse<TaskResponse>> {
    return this.getTasks(page, size);
  }
}