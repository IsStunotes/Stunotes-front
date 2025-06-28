import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, SignupRequest } from '../models/auth.model';
import { UserProfile } from '../models/user.model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request);
  }

  registerStudent(request: SignupRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/register/student`, request);
  }

  registerTeacher(request: SignupRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/register/teacher`, request);
  }
}
