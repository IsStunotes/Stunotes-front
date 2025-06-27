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
  imports: [FullCalendarModule, CalendarPrintModalComponent, CommonModule, SidebarComponent, NavbarLoggedComponent],
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
              <button class="action-btn create-btn" (click)="createActivity()"> Crear Actividad </button>
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
      editable: false, // Deshabilitar edición de eventos
      selectable: false, // Deshabilitar selección
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

    // Crear recordatorio (función deshabilitada)
    createActivity(): void {
      // Función deshabilitada - no permite crear actividades desde el calendario
      console.log('Función de crear actividad deshabilitada');
    }

    // Manejar click en evento (función deshabilitada)
    handleEventClick(clickInfo: EventClickArg): void {
      const event = clickInfo.event;
      // Función deshabilitada - solo mostrar información del evento
      alert(
        `Recordatorio: ${event.title}\n` +
        `Fecha: ${event.start?.toLocaleString()}\n\n` +
        `(Funciones de edición deshabilitadas)`
      );
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

    // Manejar click en fecha (función deshabilitada)
    handleDateClick(dateClickInfo: any): void {
      // Función deshabilitada - no permite crear actividades desde clicks en fechas
      console.log('Click en fecha detectado pero función deshabilitada:', dateClickInfo.dateStr);
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

    handleDateSelect(selectInfo: any): void {
      console.log('Selección de celda detectada pero función deshabilitada');
      selectInfo.view.calendar.unselect();
    }
}
