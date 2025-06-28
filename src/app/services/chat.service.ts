import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    const token = localStorage.getItem('token');
      const prompt = `${message}. Responde en máximo 20 palabras.`;
    return this.http.post(`${environment.apiUrl}/chat`, { message: prompt }, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'text'
    });
  }
    
}




