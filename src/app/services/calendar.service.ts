import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {}


  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<ReminderResponse[]>(this.apiUrl).pipe(
      map(reminders => reminders.map(this.mapReminderToEvent))
    );
  }


  createReminder(titulo: string, dateTime: string, activityId?: number): Observable<CalendarEvent> {
    const request: CreateReminderRequest = { titulo, dateTime, activityId };
    return this.http.post<ReminderResponse>(this.apiUrl, request).pipe(
      map(this.mapReminderToEvent)
    );
  }

  updateReminder(reminderId: string, titulo: string, dateTime: string): Observable<CalendarEvent> {
    const request = { titulo, dateTime };
    return this.http.put<ReminderResponse>(`${this.apiUrl}/${reminderId}`, request).pipe(
      map(this.mapReminderToEvent)
    );
  }

  deleteReminder(reminderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reminderId}`);
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
