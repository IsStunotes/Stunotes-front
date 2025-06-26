import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Activity {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  finishedAt?: string;
  priority?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // Obtener todas las actividades
  getUserActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/user`);
  }

  // Obtener una actividad por ID
  getActivityById(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  }
}
