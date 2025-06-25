import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiKey = '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'; 
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:4200',
      'X-Title': 'StuNotes Chat'                     
    });

    const body = {
      model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
      messages: [
        { role: 'user', content: message }
      ]
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}


