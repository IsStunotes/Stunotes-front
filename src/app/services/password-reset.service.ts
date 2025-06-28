import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private baseUrl = `${environment.apiUrl}/mail`;

  constructor(private http: HttpClient) {}

  /**
   * Enviar correo para restablecer la contraseña
   */
  sendResetEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sendMail`, email, {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    });
  }

  /**
   * Verificar si el token de recuperación es válido
   */
  checkToken(token: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/reset/check/${token}`);
  }

  /**
   * Restablecer la contraseña usando el token
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset/${token}`, newPassword, {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    });
  }
}
