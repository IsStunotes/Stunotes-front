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

  getTasks(page: number = 0, size: number = 15, categoryName?: string, sort?: string): Observable<PagedResponse<TaskResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (categoryName) {
      params = params.set('categoryName', categoryName);
    }

    if (sort) {
      params = params.set('sort', sort);
    }

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