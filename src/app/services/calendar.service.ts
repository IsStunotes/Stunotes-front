import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { 
  CalendarEvent, 
  ReminderResponse, 
  CreateReminderRequest
} from '../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly apiUrl = `${environment.apiUrl}/reminder`;
  private readonly eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  public readonly events$ = this.eventsSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  private readonly handleAuthError = (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 401 || error.status === 403) {
      this.clearAuthData();
      this.router.navigate(['/auth']);
      return throwError(() => new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
    }
    return throwError(() => error);
  };


  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }


  private validateAuthentication(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth']);
      throw new Error('Usuario no autenticado');
    }
  }


  getEvents(): Observable<CalendarEvent[]> {
    try {
      this.validateAuthentication();
      return this.http.get<ReminderResponse[]>(this.apiUrl).pipe(
        map(reminders => reminders.map(this.mapReminderToEvent)),
        catchError(this.handleAuthError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }


  createReminder(titulo: string, dateTime: string, activityId?: number): Observable<CalendarEvent> {
    try {
      this.validateAuthentication();
      const request: CreateReminderRequest = { titulo, dateTime, activityId };
      return this.http.post<ReminderResponse>(this.apiUrl, request).pipe(
        map(this.mapReminderToEvent),
        catchError(this.handleAuthError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteReminder(reminderId: string): Observable<void> {
    try {
      this.validateAuthentication();
      return this.http.delete<void>(`${this.apiUrl}/${reminderId}`).pipe(
        catchError(this.handleAuthError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  private readonly mapReminderToEvent = (reminder: ReminderResponse): CalendarEvent => {
    const startDate = new Date(reminder.dateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora
    
    return {
      id: reminder.id.toString(),
      title: reminder.titulo,
      start: reminder.dateTime,
      end: endDate.toISOString(),
      allDay: false,
      activityName: reminder.activityName || reminder.titulo
    };
  };


  updateEvents(events: CalendarEvent[]): void {
    this.eventsSubject.next([...events]);
  }


  getCurrentEvents(): CalendarEvent[] {
    return this.eventsSubject.value;
  }

  addEvent(event: CalendarEvent): void {
    const currentEvents = this.getCurrentEvents();
    this.updateEvents([...currentEvents, event]);
  }


  updateEventInSubject(updatedEvent: CalendarEvent): void {
    const currentEvents = this.getCurrentEvents();
    const eventIndex = currentEvents.findIndex(event => event.id === updatedEvent.id);
    
    if (eventIndex !== -1) {
      const updatedEvents = [...currentEvents];
      updatedEvents[eventIndex] = updatedEvent;
      this.updateEvents(updatedEvents);
    }
  }

  removeEventFromSubject(eventId: string): void {
    const currentEvents = this.getCurrentEvents();
    const filteredEvents = currentEvents.filter(event => event.id !== eventId);
    this.updateEvents(filteredEvents);
  }
}
