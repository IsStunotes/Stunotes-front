import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarOptions, EventApi, EventClickArg }  from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { ViewEncapsulation } from '@angular/core';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarLoggedComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarPrintModalComponent } from '../calendar-print-modal/calendar-print-modal.component';
import { CalendarService } from '../../../services/calendar.service';
import { CalendarEvent } from '../../../models/reminder.model';
import { ActivityService, Activity } from '../../../services/activity.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, CalendarPrintModalComponent, CommonModule, SidebarComponent, NavbarLoggedComponent, FooterComponent],
  styleUrls: ['./calendar.component.css'],
  encapsulation: ViewEncapsulation.None, 
  template: `
  
    <div class="app-layout">
      <app-navbar></app-navbar>
      <div class="app-body">
        
        
        <div class="main-content">
          <app-sidebar></app-sidebar>
          <div class="calendar-container">
              <div class="action-header">
                  <button class="nav-btn" (click)="goBack()">
                      &lt; Back
                  </button>
                  <div class="action-buttons">
                      <button class="action-btn print-btn" (click)="openPrintModal()">
                          Imprimir Calendario
                      </button>
                      <button class="action-btn create-btn" (click)="createActivity()">
                          Crear Actividad
                      </button>
                  </div>
              </div>
              
              <!-- Fila inferior con controles de navegación y vista -->
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
          </div>

          <!-- Modal de Impresión -->
          <app-calendar-print-modal
            [isVisible]="showPrintModal"
            [events]="calendarEvents"
            (closeModal)="closePrintModal()"
            (printCalendar)="handlePrint()"
            (savePDF)="handleSavePDF()">
          </app-calendar-print-modal>
        </div>
      </div>
      <app-footer></app-footer>
    </div>
  `,
})
export class CalendarComponent implements OnInit, OnDestroy {
    currentView: string = 'week'; // Cambiar a vista de semana por defecto
    showPrintModal: boolean = false;
    events: CalendarEvent[] = [];
    activities: Activity[] = [];
    error: string = '';
    private eventsSubscription?: Subscription;
    private calendarApi: any;
    
    calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek', // Vista de semana por defecto
      height: 'auto',
      contentHeight: 'auto',
      aspectRatio: 1.35,
      events: [],
      locale: 'es',
      headerToolbar: false, // Desactivar el toolbar por defecto

      slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true },
      slotLabelContent: (arg) => {
        const [hour, minute] = arg.text.split(':');
        const ampm = minute.slice(3);
        return `${hour}\n${ampm}`;
      },

      // Configuración de formato de fechas para la vista de semana
      dayHeaderFormat: { weekday: 'short', day: 'numeric' },
      dayHeaderContent: (arg) => {
        const date = arg.date;
        const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
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
      // Configuraciones para vistas de tiempo
      slotMinTime: '06:00:00',
      slotMaxTime: '23:00:00',
      slotDuration: '01:00:00',
      slotLabelInterval: '01:00:00',
      allDaySlot: false,
      nowIndicator: true,
      scrollTime: '06:00:00',
      // Interacciones
      editable: true,
      selectable: true,
      selectMirror: false,
      selectConstraint: {
        start: '06:00:00',
        end: '23:00:00'
      },
      selectMinDistance: 0,
      dayMaxEvents: true,
      weekends: true,
      // Callbacks
      eventClick: this.handleEventClick.bind(this),
      dateClick: this.handleDateClick.bind(this),
      select: this.handleDateSelect.bind(this),
      eventDrop: this.handleEventDrop.bind(this),
      eventResize: this.handleEventResize.bind(this),
      datesSet: (info) => {
        this.calendarApi = info.view.calendar;
      }
    };

    constructor(
      private router: Router,
      private calendarService: CalendarService,
      private activityService: ActivityService
    ) {}

    ngOnInit(): void {
      this.loadActivities();
      this.loadEvents();
      this.subscribeToEvents();
    }

    ngOnDestroy(): void {
      if (this.eventsSubscription) {
        this.eventsSubscription.unsubscribe();
      }
    }

    // Cargar actividades disponibles
    private loadActivities(): void {
      this.activityService.getUserActivities().subscribe({
        next: (activities) => {
          this.activities = activities;
        },
        error: (error) => {
          console.error('Error loading activities:', error);
          // Continuar sin actividades
        }
      });
    }

    // Cargar eventos desde el backend
    private loadEvents(): void {
      this.error = '';
      
      this.calendarService.getEvents().subscribe({
        next: (events) => {
          this.events = events;
          this.calendarService.updateEvents(events); // Actualizar el subject
          this.updateCalendarEvents();
          
          if (events.length === 0) {
            console.log('No hay recordatorios para mostrar');
          }
        },
        error: (error) => {
          console.error('Error loading events:', error);
          
          if (error.message.includes('autenticado')) {
            this.error = 'Sesión expirada. Redirigiendo al login...';
            // El servicio ya redirige automáticamente
          } else {
            this.error = 'Error al cargar los recordatorios. Intenta recargar la página.';
            // Fallback: usar eventos de ejemplo solo si no es un error de autenticación
            this.loadSampleEvents();
          }
        }
      });
    }

    // Suscribirse a cambios en eventos
    private subscribeToEvents(): void {
      this.eventsSubscription = this.calendarService.events$.subscribe(events => {
        this.events = events;
        this.updateCalendarEvents();
      });
    }

    // Actualizar eventos en el calendario
    private updateCalendarEvents(): void {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.events
      };
    }

    // Eventos de ejemplo como fallback
    private loadSampleEvents(): void {
      this.events = [
        {
          id: '1',
          title: 'Examen de Matemáticas',
          start: '2025-06-26T10:00:00',
          end: '2025-06-26T11:00:00',
          activityId: 1,
          activityName: 'Examen de Matemáticas'
        },
        {
          id: '2',
          title: 'Entrega de Proyecto',
          start: '2025-06-27T14:00:00',
          end: '2025-06-27T15:00:00',
          activityId: 2,
          activityName: 'Entrega de Proyecto'
        }
      ];
      this.updateCalendarEvents();
    } 

    // Navegación
    goBack(): void {
      this.router.navigate(['/tasks']);
    }

    // Modal de impresión
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

    // Crear recordatorio (necesita activityId)
    createActivity(): void {
      if (this.activities.length === 0) {
        alert('No hay actividades disponibles. Primero cree una actividad.');
        return;
      }

      let activityOptions = 'Seleccione una actividad:\n\n';
      this.activities.forEach((activity, index) => {
        const dueDateText = activity.finishedAt ? 
          ` (Fecha límite: ${new Date(activity.finishedAt).toLocaleDateString()})` : 
          ' (Sin fecha límite)';
        activityOptions += `${index + 1}. ${activity.title}${dueDateText}\n`;
      });
      
      const selection = prompt(activityOptions + '\nIngrese el número de la actividad:');
      if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < this.activities.length) {
          const selectedActivity = this.activities[index];
          let dateTime: string;
          
          if (selectedActivity.finishedAt) {
            // Usar la fecha límite de la actividad
            dateTime = selectedActivity.finishedAt;
          } else {
            // Si no hay fecha límite, usar fecha actual + 1 día
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateTime = new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString();
          }
          
          this.createNewReminder(selectedActivity.id, dateTime);
        } else {
          alert('Selección inválida');
        }
      }
    }

    // Crear un nuevo recordatorio
    private createNewReminder(activityId: number, dateTime: string): void {
      this.calendarService.createReminder(activityId, dateTime).subscribe({
        next: (event) => {
          this.calendarService.addEvent(event);
          console.log('Recordatorio creado:', event);
          // Recargar todos los eventos para asegurar sincronización
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error creating reminder:', error);
          alert('Error al crear el recordatorio');
        }
      });
    }

    // Manejar click en evento
    handleEventClick(clickInfo: EventClickArg): void {
      const event = clickInfo.event;
      const action = confirm(
        `Recordatorio: ${event.title}\n` +
        `Fecha: ${event.start?.toLocaleString()}\n\n` +
        `¿Desea eliminar este recordatorio?`
      );

      if (action && event.id) {
        this.deleteReminder(event.id);
      }
    }

    // Eliminar recordatorio
    private deleteReminder(reminderId: string): void {
      this.calendarService.deleteReminder(reminderId).subscribe({
        next: () => {
          this.calendarService.removeEventFromSubject(reminderId);
          console.log('Recordatorio eliminado:', reminderId);
          // Recargar todos los eventos para asegurar sincronización
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error deleting reminder:', error);
          alert('Error al eliminar el recordatorio');
        }
      });
    }

    // Manejar arrastrar y soltar evento
    handleEventDrop(dropInfo: any): void {
      const event = dropInfo.event;
      if (event.id) {
        this.moveReminder(event.id, event.startStr);
      }
    }

    // Manejar redimensionar evento
    handleEventResize(resizeInfo: any): void {
      const event = resizeInfo.event;
      if (event.id) {
        this.moveReminder(event.id, event.startStr);
      }
    }

    // Mover recordatorio (cambiar fecha/hora)
    private moveReminder(reminderId: string, newDateTime: string): void {
      try {
        this.calendarService.moveReminder(reminderId, newDateTime).subscribe({
          next: (updatedEvent) => {
            this.calendarService.updateEventInSubject(updatedEvent);
            console.log('Recordatorio movido:', updatedEvent);
            // Recargar todos los eventos para asegurar sincronización
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error moving reminder:', error);
            alert('Error al mover el recordatorio');
            // Revertir cambios en la UI
            this.loadEvents();
          }
        });
      } catch (error) {
        console.error('Error moving reminder:', error);
        alert('Error al mover el recordatorio');
        this.loadEvents();
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
        
        // Restaurar configuraciones normales
        this.calendarApi.setOption('height', 'auto');
        this.calendarApi.setOption('aspectRatio', 1.35);
        this.calendarApi.setOption('dayMaxEvents', true);
      } else {
        // Si no hay API disponible, actualizar las opciones
        this.calendarOptions = {
          ...this.calendarOptions,
          initialView: newCalendarView
        };
      }
      
      console.log(`Vista cambiada a: ${view} (${newCalendarView})`);
    }

    // Manejar click en fecha (día)
    handleDateClick(dateClickInfo: any): void {
      if (this.activities.length === 0) {
        alert('No hay actividades disponibles. Primero cree una actividad.');
        return;
      }

      const clickedDate = dateClickInfo.dateStr;
      let activityOptions = 'Seleccione una actividad para el recordatorio:\n\n';
      this.activities.forEach((activity, index) => {
        const dueDateText = activity.finishedAt ? 
          ` (Fecha límite: ${new Date(activity.finishedAt).toLocaleDateString()})` : 
          ' (Sin fecha límite)';
        activityOptions += `${index + 1}. ${activity.title}${dueDateText}\n`;
      });
      
      const selection = prompt(activityOptions + '\nIngrese el número de la actividad:');
      if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < this.activities.length) {
          const selectedActivity = this.activities[index];
          let dateTime: string;
          
          // Preguntar si quiere usar la fecha clickeada o la fecha límite de la actividad
          if (selectedActivity.finishedAt) {
            const useActivityDate = confirm(
              `¿Desea usar la fecha límite de la actividad (${new Date(selectedActivity.finishedAt).toLocaleDateString()}) ` +
              `o la fecha clickeada (${new Date(clickedDate).toLocaleDateString()})?` +
              `\n\nOK = Fecha límite de actividad\nCancelar = Fecha clickeada`
            );
            
            if (useActivityDate) {
              dateTime = selectedActivity.finishedAt;
            } else {
              dateTime = new Date(clickedDate + 'T09:00:00').toISOString();
            }
          } else {
            // Si no hay fecha límite, usar la fecha clickeada
            dateTime = new Date(clickedDate + 'T09:00:00').toISOString();
          }
          
          this.createNewReminder(selectedActivity.id, dateTime);
        } else {
          alert('Selección inválida');
        }
      }
    }

    // Obtener la API del calendario después de que se inicialice
    onCalendarInit(calendarApi: any): void {
      this.calendarApi = calendarApi;
    }

    // Ir al período anterior
    previousPeriod(): void {
      if (this.calendarApi) {
        this.calendarApi.prev();
      }
    }

    // Ir al período siguiente
    nextPeriod(): void {
      if (this.calendarApi) {
        this.calendarApi.next();
      }
    }

    // Ir a la fecha de hoy
    goToToday(): void {
      if (this.calendarApi) {
        this.calendarApi.today();
      }
    }

    // Getter para los eventos del calendario
    get calendarEvents(): CalendarEvent[] {
      return this.events;
    }

    // Manejar selección de celda específica
    handleDateSelect(selectInfo: any): void {
      const start = selectInfo.start;
      const end = selectInfo.end;
      
      // Verificar que solo se seleccione una hora (evitar selección de rango)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Duración en horas
      
      if (duration > 1) {
        // Si se selecciona más de una hora, mostrar mensaje
        alert('Por favor, selecciona solo una celda de tiempo (1 hora).');
        selectInfo.view.calendar.unselect();
        return;
      }

      if (this.activities.length === 0) {
        alert('No hay actividades disponibles. Primero cree una actividad.');
        selectInfo.view.calendar.unselect();
        return;
      }

      const selectedDateTime = start.toISOString();
      let activityOptions = 'Seleccione una actividad para el recordatorio:\n\n';
      this.activities.forEach((activity, index) => {
        const dueDateText = activity.finishedAt ? 
          ` (Fecha límite: ${new Date(activity.finishedAt).toLocaleDateString()})` : 
          ' (Sin fecha límite)';
        activityOptions += `${index + 1}. ${activity.title}${dueDateText}\n`;
      });
      
      const selection = prompt(activityOptions + '\nIngrese el número de la actividad:');
      if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < this.activities.length) {
          const selectedActivity = this.activities[index];
          this.createNewReminder(selectedActivity.id, selectedDateTime);
        } else {
          alert('Selección inválida');
        }
      }
      
      // Limpiar la selección
      selectInfo.view.calendar.unselect();
    }
}
