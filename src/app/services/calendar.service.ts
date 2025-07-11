import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { 
  CalendarEvent, 
  ReminderResponse, 
  CreateReminderRequest,
  ActivityResponse
} from '../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly apiUrl = `${environment.apiUrl}/reminder`;
  private readonly tasksApiUrl = `${environment.apiUrl}/tasks`;
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

  updateReminder(reminderId: string, titulo: string, dateTime: string, activityId?: number): Observable<CalendarEvent> {
    const request = { titulo, dateTime, activityId };
    return this.http.put<ReminderResponse>(`${this.apiUrl}/${reminderId}`, request).pipe(
      map(this.mapReminderToEvent)
    );
  }

  deleteReminder(reminderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reminderId}`);
  }

  private mapReminderToEvent = (reminder: ReminderResponse): CalendarEvent => {
    const startDate = new Date(reminder.dateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const displayTitle = reminder.activityName 
      ? `${reminder.titulo} - ${reminder.activityName}` 
      : reminder.titulo;
    
    return {
      id: reminder.id.toString(),
      title: displayTitle,
      start: reminder.dateTime,
      end: endDate.toISOString(),
      allDay: false,
      activityId: reminder.activityId,
      activityName: reminder.activityName
    };
  };


  updateEvents(events: CalendarEvent[]): void {
    this.eventsSubject.next(events);
  }

  getCurrentEvents(): CalendarEvent[] {
    return this.eventsSubject.value;
  }

  addEvent(event: CalendarEvent): void {
    this.updateEvents([...this.getCurrentEvents(), event]);
  }

  updateEventInSubject(updatedEvent: CalendarEvent): void {
    const currentEvents = this.getCurrentEvents();
    const eventIndex = currentEvents.findIndex(event => event.id === updatedEvent.id);
    
    if (eventIndex !== -1) {
      currentEvents[eventIndex] = updatedEvent;
      this.updateEvents([...currentEvents]);
    }
  }

  removeEventFromSubject(eventId: string): void {
    const currentEvents = this.getCurrentEvents().filter(event => event.id !== eventId);
    this.updateEvents(currentEvents);
  }

  // Métodos de actividades para el calendario
  getAllUserActivities(): Observable<ActivityResponse[]> {
    return this.http.get<{content: ActivityResponse[]}>(`${this.tasksApiUrl}?size=1000`).pipe(
      map(response => response.content || [])
    );
  }

  getActiveUserActivities(): Observable<ActivityResponse[]> {
    return this.getAllUserActivities().pipe(
      map(activities => activities.filter(activity => !activity.finishedAt))
    );
  }
}
