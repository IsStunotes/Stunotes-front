import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-floating-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
      <div class="chat-toggle-btn" (click)="toggleChat()">
        💬
      </div>
  
      <div class="chat-container" *ngIf="isOpen">
        <div class="chat-header">
          Asistente Virtual
          <button class="close-btn" (click)="toggleChat()">✖</button>
        </div>
  
        <div class="chat-messages">
          <div *ngFor="let msg of messages" [ngClass]="msg.role">
            {{ msg.content }}
          </div>
        <div *ngIf="loading" class="assistant typing">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>

  
        <form class="chat-input" (ngSubmit)="send()" autocomplete="off">
          <input
            [(ngModel)]="input"
            name="message"
            placeholder="Escribe tu mensaje..."
            [disabled]="loading"
            required
          />
          <button type="submit" [disabled]="loading || !input.trim()">➤</button>
        </form>
      </div>
    `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

      :host {
        font-family: 'Poppins', sans-serif;
      }
      .chat-toggle-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #7e3af2;
        color: white;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 24px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 999;
        transition: background 0.3s;
      }
      .chat-toggle-btn:hover {
        background: #5b27c1;
      }
  
      .chat-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.25);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
      }
  
      .chat-header {
        background: #7e3af2;
        color: white;
        padding: 12px 16px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
  
      .close-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
      }
  
      .chat-messages {
        padding: 12px;
        max-height: 300px;
        overflow-y: auto;
        font-size: 14px;
        background: #f9f9f9;
      }
  
      .chat-messages .user {
        text-align: right;
        margin: 6px 0;
        color: #7e3af2;
      }
  
      .chat-messages .assistant {
        text-align: left;
        margin: 6px 0;
        color: #333;
      }
  
      .chat-input {
        display: flex;
        border-top: 1px solid #ddd;
        padding: 8px;
        background: #fff;
      }
  
      .chat-input input {
        flex: 1;
        border: none;
        font-size: 14px;
        padding: 8px;
        outline: none;
      }
  
      .chat-input button {
        background: #7e3af2;
        color: white;
        border: none;
        padding: 0 14px;
        cursor: pointer;
        font-size: 16px;
        border-radius: 4px;
      }
      
      .typing span {
        animation: blink 1s infinite;
        margin-right: 2px;
      }
      .typing span:nth-child(2) {
        animation-delay: 0.2s;
      }
      .typing span:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes blink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `]
  })
  export class ChatComponent {
    input = '';
    messages: { role: string, content: string }[] = [];
    isOpen = false;
    loading = false;
  
    constructor(private chatService: ChatService) {}
  
    toggleChat() {
      this.isOpen = !this.isOpen;
    }
  
    send() {
      const userMsg = this.input.trim();
      if (!userMsg) return;
    
      this.messages.push({ role: 'user', content: userMsg });
      this.input = '';
      this.loading = true;
    
      this.chatService.sendMessage(userMsg).subscribe({
        next: (res: string) => {
          this.messages.push({ role: 'assistant', content: res });
          this.loading = false;
        },        
        error: (err) => {
          this.messages.push({ role: 'assistant', content: '⚠️ Error al responder.' });
          console.error(err);
          this.loading = false;
        }
      });
    }
    
  }