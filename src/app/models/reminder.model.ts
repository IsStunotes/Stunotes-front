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
  title: string;
  activityId: number;  
  dateTime: string;
}

export interface CreateReminderRequest {
  activityId: number;
  dateTime: string;
}

export interface UpdateReminderRequest extends CreateReminderRequest {
  id: number;
}
