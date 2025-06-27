export interface CalendarEvent {
  id?: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  activityId?: number;
  activityName?: string;
}

export interface ReminderResponse {
  id: number;
  titulo: string;
  activityName?: string;
  dateTime: string;
}

export interface CreateReminderRequest {
  titulo: string;
  activityId?: number;
  dateTime: string;
}
