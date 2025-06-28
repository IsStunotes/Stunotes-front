
/*import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarOptions, EventClickArg }  from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ViewEncapsulation } from '@angular/core';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarLoggedComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarPrintModalComponent } from '../calendar-print-modal/calendar-print-modal.component';
import { CreateReminderModalComponent } from '../create-reminder-modal/create-reminder-modal.component';
import { CalendarService } from '../../../services/calendar.service';
import { CalendarEvent } from '../../../models/reminder.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, CalendarPrintModalComponent, CreateReminderModalComponent, CommonModule, SidebarComponent, NavbarLoggedComponent],
  styleUrls: ['./calendar.component.css'],
  encapsulation: ViewEncapsulation.None, 
  template: `
    <app-navbar></app-navbar>

    <div class="main-container">
      <app-sidebar></app-sidebar>
      <div class ="content-container">

        <div class="action-header">
          <button class="nav-btn" (click)="goBack()"> &lt; Back </button>
            <div class="action-buttons">
              <button class="action-btn print-btn" (click)="openPrintModal()"> Imprimir Calendario </button>
              <button class="action-btn create-btn" (click)="openCreateReminderModal()"> Crear Recordatorio </button>
            </div>
        </div>      
    
        <div class="calendar-header">
          <div class="nav-controls">
            <button class="nav-btn" (click)="previousPeriod()">&lt;</button>
            <button class="nav-btn today-btn" (click)="goToToday()">Today</button>
            <button class="nav-btn" (click)="nextPeriod()">&gt;</button>
          </div>
                  
          <div class="view-selector">
            <button class="view-btn" [class.active]="currentView === 'day'" (click)="changeView('day')">Day</button>
            <button class="view-btn" [class.active]="currentView === 'week'" (click)="changeView('week')">Week</button>
            <button class="view-btn" [class.active]="currentView === 'month'" (click)="changeView('month')">Month</button>
          </div>
        </div>
              
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
              
        <div class="calendar-view">
          <full-calendar [options]="calendarOptions"></full-calendar>
        </div>

        <app-calendar-print-modal
            [isVisible]="showPrintModal"
            [events]="calendarEvents"
            (closeModal)="closePrintModal()"
            (printCalendar)="handlePrint()"
            (savePDF)="handleSavePDF()">
        </app-calendar-print-modal>

        <app-create-reminder-modal
            [isVisible]="showCreateReminderModal"
            [preselectedDate]="selectedDate"
            [preselectedTime]="selectedTime"
            (close)="closeCreateReminderModal()"
            (reminderCreated)="onReminderCreated($event)">
        </app-create-reminder-modal>

      </div>
    </div>
  `,
})
export class CalendarComponent implements OnInit, OnDestroy {
    currentView: string = 'week';
    showPrintModal: boolean = false;
    showCreateReminderModal: boolean = false;
    events: CalendarEvent[] = [];
    error: string = '';
    selectedDate: string = '';
    selectedTime: string = '';
    private eventsSubscription?: Subscription;
    private calendarApi: any;
    
    calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek', 
      height: 'auto',
      contentHeight: 'auto',
      aspectRatio: 1.35,
      events: [],
      locale: 'es',
      firstDay: 1, 
      headerToolbar: false, 

      slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true },
      slotLabelContent: (arg) => {
        const [hour, minute] = arg.text.split(':');
        const ampm = minute.slice(3);
        return `${hour}\n${ampm}`;
      },

      dayHeaderFormat: { weekday: 'short', day: 'numeric' },
      dayHeaderContent: (arg) => {
        const date = arg.date;
        const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const dayName = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        return { 
          html: 
            `<div class="day-header">
              <div class="day-name">${dayName}</div>
              <div class="day-number">${dayNumber}</div>
            </div>` 
          };
      }, 
      
      slotMinTime: '06:00:00',
      slotMaxTime: '23:00:00',
      slotDuration: '01:00:00',
      slotLabelInterval: '01:00:00',
      allDaySlot: false,
      nowIndicator: true,
      scrollTime: '06:00:00',
      editable: false, 
      selectable: false,
      selectMirror: false,
      selectConstraint: {
        start: '06:00:00',
        end: '23:00:00'
      },
      selectMinDistance: 0,
      dayMaxEvents: true,
      weekends: true,
      eventClick: this.handleEventClick.bind(this),
      dateClick: this.handleDateClick.bind(this),
      datesSet: (info) => {
        this.calendarApi = info.view.calendar;
      }
    };

    constructor(
      private router: Router,
      private calendarService: CalendarService
    ) {}

    ngOnInit(): void {
      this.loadEvents();
      this.subscribeToEvents();
    }

    ngOnDestroy(): void {
      if (this.eventsSubscription) {
        this.eventsSubscription.unsubscribe();
      }
    }

    private loadEvents(): void {
      this.error = '';
      
      this.calendarService.getEvents().subscribe({
        next: (events) => {
          this.events = events;
          this.calendarService.updateEvents(events); 
          this.updateCalendarEvents();
          
          if (events.length === 0) {
            console.log('No hay recordatorios para mostrar');
          }
        },
        error: (error) => {
          console.error('Error loading events:', error);
          
          if (error.message.includes('autenticado')) {
            this.error = 'Sesión expirada. Redirigiendo al login...';
          } else {
            this.error = 'Error al cargar los recordatorios. Intenta recargar la página.';
            this.loadSampleEvents();
          }
        }
      });
    }

    private subscribeToEvents(): void {
      this.eventsSubscription = this.calendarService.events$.subscribe(events => {
        this.events = events;
        this.updateCalendarEvents();
      });
    }

    private updateCalendarEvents(): void {
      if (this.calendarApi) {
        this.calendarApi.removeAllEvents();
        this.calendarApi.addEventSource(this.events);
      } else {
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.events
        };
      }
    }

    private loadSampleEvents(): void {
      this.events = [
        {
          id: '1',
          title: 'Recordatorio de Ejemplo',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
          end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString() // +1 hora
        }
      ];
      this.updateCalendarEvents();
    } 

    goBack(): void {
      this.router.navigate(['/tasks']);
    }

    openPrintModal(): void {
      this.showPrintModal = true;
    }

    closePrintModal(): void {
      this.showPrintModal = false;
    }

    handlePrint(): void {
      console.log('Imprimiendo calendario...');
      this.closePrintModal();
    }

    handleSavePDF(): void {
      console.log('Guardando PDF...');
      this.closePrintModal();
    }

    openCreateReminderModal(): void {
      if (!this.selectedDate) {
        const today = new Date();
        this.selectedDate = today.toISOString().split('T')[0];
        this.selectedTime = '09:00';
      }
      this.showCreateReminderModal = true;
    }

    closeCreateReminderModal(): void {
      this.showCreateReminderModal = false;
      this.selectedDate = '';
      this.selectedTime = '';
    }

    onReminderCreated(event: CalendarEvent): void {

      this.calendarService.addEvent(event);
      console.log('Recordatorio creado exitosamente:', event);

      this.closeCreateReminderModal();
    }

    deleteReminder(reminderId: string): void {
      console.log('Intentando eliminar recordatorio con ID:', reminderId);
      
      this.calendarService.deleteReminder(reminderId).subscribe({
        next: () => {

          this.calendarService.removeEventFromSubject(reminderId);
          console.log('Recordatorio eliminado exitosamente');
          
          alert('Recordatorio eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error eliminando recordatorio:', error);
          
          let errorMessage = 'Error al eliminar el recordatorio.';
          if (error.message) {
            errorMessage += ` ${error.message}`;
          }
          if (error.error && error.error.message) {
            errorMessage += ` ${error.error.message}`;
          }
          
          alert(errorMessage);
        }
      });
    }

    handleEventClick(clickInfo: EventClickArg): void {
      const event = clickInfo.event;
      const confirmed = confirm(
        `¿Deseas eliminar este recordatorio?\n\n` +
        `Título: ${event.title}\n` +
        `Fecha: ${event.start?.toLocaleString()}\n\n` +
        `Esta acción no se puede deshacer.`
      );
      
      if (confirmed && event.id) {
        this.deleteReminder(event.id);
      }
    }

    changeView(view: string): void {
      this.currentView = view;
      let newCalendarView = 'timeGridWeek';
      
      switch(view) {
        case 'day':
          newCalendarView = 'timeGridDay';
          break;
        case 'week':
          newCalendarView = 'timeGridWeek';
          break;
        case 'month':
          newCalendarView = 'dayGridMonth';
          break;
      }
      
      if (this.calendarApi) {
        this.calendarApi.changeView(newCalendarView);
        
        this.calendarApi.setOption('height', 'auto');
        this.calendarApi.setOption('aspectRatio', 1.35);
        this.calendarApi.setOption('dayMaxEvents', true);
      } else {

        this.calendarOptions = {
          ...this.calendarOptions,
          initialView: newCalendarView
        };
      }
      
      console.log(`Vista cambiada a: ${view} (${newCalendarView})`);
    }

    handleDateClick(dateClickInfo: any): void {
      console.log('Click en fecha detectado:', dateClickInfo);
      
      let selectedDate: string;
      let selectedTime: string;
      
      if (dateClickInfo.dateStr.includes('T')) {

        const [date, time] = dateClickInfo.dateStr.split('T');
        selectedDate = date;
        selectedTime = time.substring(0, 5); 
      } else {

        selectedDate = dateClickInfo.dateStr;
        selectedTime = '09:00'; 
      }
      
      this.selectedDate = selectedDate;
      this.selectedTime = selectedTime;
      this.openCreateReminderModal();
    }

    previousPeriod(): void {
      if (this.calendarApi) {
        this.calendarApi.prev();
      }
    }

    nextPeriod(): void {
      if (this.calendarApi) {
        this.calendarApi.next();
      }
    }

    goToToday(): void {
      if (this.calendarApi) {
        this.calendarApi.today();
      }
    }

    get calendarEvents(): CalendarEvent[] {
      return this.events;
    }
}
*/