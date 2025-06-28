import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://stunotes-api-latest.onrender.com/api/v1/chat'; // URL del backend

  constructor(private http: HttpClient) {}

  sendMessage(prompt: string): Observable<string> {
    return this.http.post<any>(this.apiUrl, { prompt }).pipe(
      map((res) => res.choices[0].message.content) // Extraer solo el contenido del mensaje
    );
  }
}



