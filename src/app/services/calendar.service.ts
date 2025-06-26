import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { 
  CalendarEvent, 
  ReminderResponse, 
  CreateReminderRequest, 
  UpdateReminderRequest 
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

  /**
   * Maneja errores de autenticación HTTP
   * @private
   */
  private readonly handleAuthError = (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 401 || error.status === 403) {
      // Token inválido o expirado
      this.clearAuthData();
      this.router.navigate(['/auth']);
      return throwError(() => new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
    }
    return throwError(() => error);
  };

  /**
   * Limpia los datos de autenticación del localStorage
   * @private
   */
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Verifica si el usuario está autenticado
   * @private
   */
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Valida la autenticación antes de realizar operaciones
   * @private
   */
  private validateAuthentication(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth']);
      throw new Error('Usuario no autenticado');
    }
  }

  /**
   * Obtiene todos los recordatorios del usuario autenticado
   */
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

  /**
   * Obtiene recordatorios por rango de fechas del usuario autenticado
   */
  getEventsByDateRange(start: string, end: string): Observable<CalendarEvent[]> {
    try {
      this.validateAuthentication();
      return this.http.get<ReminderResponse[]>(`${this.apiUrl}/month`, {
        params: { start }
      }).pipe(
        map(reminders => reminders.map(this.mapReminderToEvent)),
        catchError(this.handleAuthError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Crea un nuevo recordatorio
   */
  createReminder(activityId: number, dateTime: string): Observable<CalendarEvent> {
    try {
      this.validateAuthentication();
      const request: CreateReminderRequest = { activityId, dateTime };
      return this.http.post<ReminderResponse>(this.apiUrl, request).pipe(
        map(this.mapReminderToEvent),
        catchError(this.handleAuthError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Actualiza un recordatorio existente
   */
  updateReminder(id: number, activityId: number, dateTime: string): Observable<CalendarEvent> {
    try {
      this.validateAuthentication();
      const request: UpdateReminderRequest = { id, activityId, dateTime };
      return this.http.put<ReminderResponse>(`${this.apiUrl}/${id}`, request).pipe(
        map(this.mapReminderToEvent),
        catchError(this.handleAuthError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Elimina un recordatorio
   */
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

  /**
   * Mueve un recordatorio a una nueva fecha/hora
   */
  moveReminder(reminderId: string, newDateTime: string): Observable<CalendarEvent> {
    const currentEvent = this.getCurrentEvents().find(e => e.id === reminderId);
    if (!currentEvent?.activityId) {
      return throwError(() => new Error('No se pudo encontrar el evento para mover'));
    }
    
    return this.updateReminder(Number(reminderId), currentEvent.activityId, newDateTime);
  }

  /**
   * Refresca eventos desde el backend
   */
  refreshEvents(): Observable<CalendarEvent[]> {
    return this.getEvents().pipe(
      map(events => {
        this.updateEvents(events);
        return events;
      })
    );
  }

  /**
   * Mapea ReminderResponse a CalendarEvent
   * @private
   */
  private readonly mapReminderToEvent = (reminder: ReminderResponse): CalendarEvent => {
    const startDate = new Date(reminder.dateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora
    
    return {
      id: reminder.id.toString(),
      title: reminder.title,
      start: reminder.dateTime,
      end: endDate.toISOString(),
      allDay: false,
      activityId: reminder.activityId,
      activityName: reminder.title
    };
  };

  /**
   * Actualiza el subject con nuevos eventos
   */
  updateEvents(events: CalendarEvent[]): void {
    this.eventsSubject.next([...events]);
  }

  /**
   * Obtiene eventos actuales del subject
   */
  getCurrentEvents(): CalendarEvent[] {
    return this.eventsSubject.value;
  }

  /**
   * Agrega un evento al subject
   */
  addEvent(event: CalendarEvent): void {
    const currentEvents = this.getCurrentEvents();
    this.updateEvents([...currentEvents, event]);
  }

  /**
   * Actualiza un evento en el subject
   */
  updateEventInSubject(updatedEvent: CalendarEvent): void {
    const currentEvents = this.getCurrentEvents();
    const eventIndex = currentEvents.findIndex(event => event.id === updatedEvent.id);
    
    if (eventIndex !== -1) {
      const updatedEvents = [...currentEvents];
      updatedEvents[eventIndex] = updatedEvent;
      this.updateEvents(updatedEvents);
    }
  }

  /**
   * Elimina un evento del subject
   */
  removeEventFromSubject(eventId: string): void {
    const currentEvents = this.getCurrentEvents();
    const filteredEvents = currentEvents.filter(event => event.id !== eventId);
    this.updateEvents(filteredEvents);
  }
}
