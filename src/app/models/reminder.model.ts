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
  activityId?: number;
  dateTime: string;
}

export interface CreateReminderRequest {
  titulo: string;
  activityId?: number;
  dateTime: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  priority: number;
  category: {
    id: number;
    name: string;
  };
}

export interface ActivityResponse {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  finishedAt?: string;
  priority: number;
  category: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}
