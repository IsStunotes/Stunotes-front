import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarLoggedComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { CalendarPrintModalComponent } from '../calendar-print-modal/calendar-print-modal.component';
import { CreateReminderModalComponent } from '../create-reminder-modal/create-reminder-modal.component';
import { CalendarService } from '../../../services/calendar.service';
import { CalendarEvent } from '../../../models/reminder.model';
import { Subscription } from 'rxjs';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendar',
  imports: [CalendarPrintModalComponent, CreateReminderModalComponent, CommonModule, SidebarComponent, NavbarLoggedComponent, FooterComponent],
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
          
          <div class="calendar-title">
            <h2>{{ getCurrentTitle() }}</h2>
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
          <!-- Vista Mensual -->
          <div *ngIf="currentView === 'month'" class="month-view">
            <div class="month-header">
              <div *ngFor="let day of weekDays" class="day-header">{{ day }}</div>
            </div>
            <div class="month-grid">
              <div *ngFor="let week of calendarDays" class="week-row">
                <div *ngFor="let day of week" 
                     class="day-cell" 
                     [class.other-month]="!day.isCurrentMonth"
                     [class.today]="day.isToday"
                     [class.past-date]="!isValidFutureDate(day.date)"
                     [class.clickable]="isValidFutureDate(day.date)"
                     (click)="isValidFutureDate(day.date) ? onDateClick(day) : null">
                  <div class="day-number">{{ day.date.getDate() }}</div>
                  <div class="day-events">
                    <div *ngFor="let event of day.events | slice:0:3" 
                         class="event-item-month"
                         (click)="$event.stopPropagation(); handleEventClick($any(event), $event)">
                      {{ $any(event).title }}
                    </div>
                    <div *ngIf="day.events.length > 3" class="more-events">
                      +{{ day.events.length - 3 }} más
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vista Semanal -->
          <div *ngIf="currentView === 'week'" class="week-view">
            <div class="week-header">
              <div class="time-column-header"></div>
              <div *ngFor="let day of calendarDays" 
                   class="day-header-week"
                   [class.today]="day.isToday">
                <div class="day-name">{{ weekDays[day.date.getDay()] }}</div>
                <div class="day-number">{{ day.date.getDate() }}</div>
              </div>
            </div>
            <div class="week-grid">
              <div *ngFor="let timeSlot of timeSlots" class="time-row">
                <div class="time-label">{{ timeSlot }}</div>
                <div *ngFor="let day of calendarDays" 
                     class="time-slot"
                     [class.past-time]="!isValidTimeSlot(day, timeSlot)"
                     [class.clickable]="isValidTimeSlot(day, timeSlot)"
                     (click)="isValidTimeSlot(day, timeSlot) ? onTimeSlotClick(day, timeSlot) : null">
                  <div *ngFor="let event of getEventsForTimeSlot(day, timeSlot)" 
                       class="event-item-week"
                       (click)="$event.stopPropagation(); handleEventClick($any(event), $event)">
                    {{ $any(event).title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vista Diaria -->
          <div *ngIf="currentView === 'day'" class="day-view">
            <div class="day-grid">
              <div *ngFor="let timeSlot of timeSlots" class="time-row-day">
                <div class="time-label-day">{{ timeSlot }}</div>
                <div class="time-slot-day" 
                     [class.past-time]="!isValidTimeSlot(calendarDays[0], timeSlot)"
                     [class.clickable]="isValidTimeSlot(calendarDays[0], timeSlot)"
                     (click)="isValidTimeSlot(calendarDays[0], timeSlot) ? onTimeSlotClick(calendarDays[0], timeSlot) : null">
                  <div *ngFor="let event of getEventsForTimeSlot(calendarDays[0], timeSlot)" 
                       class="event-item-day"
                       (click)="$event.stopPropagation(); handleEventClick($any(event), $event)">
                    {{ $any(event).title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <app-calendar-print-modal
            [isVisible]="showPrintModal"
            [events]="calendarEvents"
            [currentDate]="currentDate"
            (closeModal)="closePrintModal()"
            (printCalendar)="handlePrint()"
            (savePDF)="handleSavePDF()">
        </app-calendar-print-modal>

        <app-create-reminder-modal
            [isVisible]="showCreateReminderModal"
            [preselectedDate]="selectedDate"
            [preselectedTime]="selectedTime"
            [isEditMode]="isEditMode"
            [reminderToEdit]="reminderToEdit"
            (close)="closeCreateReminderModal()"
            (reminderCreated)="onReminderCreated($event)"
            (reminderUpdated)="onReminderUpdated($event)">
        </app-create-reminder-modal>

        <!-- Modal de opciones de evento -->
        <div *ngIf="showEventOptionsModal" 
             class="event-options-modal"
             [style.left.px]="modalPosition.x"
             [style.top.px]="modalPosition.y">
          <div class="event-options-content">
            <div class="event-info">
              <h4>{{ selectedEvent?.title }}</h4>
              <p>{{ formatEventDate(selectedEvent?.start || '') }}</p>
            </div>
            <div class="event-options-buttons">
              <button class="option-btn update-btn" (click)="updateReminder()">
                <i class="fas fa-edit"></i> Actualizar
              </button>
              <button class="option-btn delete-btn" (click)="confirmDeleteReminder()">
                <i class="fas fa-trash"></i> Eliminar
              </button>
              <button class="option-btn cancel-btn" (click)="closeEventOptionsModal()">
                <i class="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Overlay para cerrar el modal -->
        <div *ngIf="showEventOptionsModal" 
             class="event-options-overlay" 
             (click)="closeEventOptionsModal()">
        </div>

      </div>
    </div>
    <app-footer></app-footer>
  `,
})
export class CalendarComponent implements OnInit, OnDestroy {
    currentView: string = 'week';
    showPrintModal: boolean = false;
    showCreateReminderModal: boolean = false;
    showEventOptionsModal: boolean = false;
    selectedEvent: CalendarEvent | null = null;
    modalPosition = { x: 0, y: 0 };
    events: CalendarEvent[] = [];
    error: string = '';
    selectedDate: string = '';
    selectedTime: string = '';
    isEditMode: boolean = false;
    reminderToEdit: CalendarEvent | null = null;
    private eventsSubscription?: Subscription;
    
    // Calendar properties
    currentDate: Date = new Date();
    calendarDays: any[] = [];
    weekDays: string[] = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    months: string[] = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    timeSlots: string[] = [];
    weekStart: Date = new Date();
    weekEnd: Date = new Date();

    constructor(
      private router: Router,
      private calendarService: CalendarService
    ) {}

    ngOnInit(): void {
      this.generateTimeSlots();
      this.updateCalendarView();
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
      // Update calendar view when events change
      this.updateCalendarView();
      console.log('Events updated:', this.events.length);
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

    private generateTimeSlots(): void {
      this.timeSlots = [];
      for (let hour = 6; hour <= 22; hour++) {
        this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }

    private updateCalendarView(): void {
      switch (this.currentView) {
        case 'month':
          this.generateMonthView();
          break;
        case 'week':
          this.generateWeekView();
          break;
        case 'day':
          this.generateDayView();
          break;
      }
    }

    private generateMonthView(): void {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      this.calendarDays = [];
      const current = new Date(startDate);

      for (let week = 0; week < 6; week++) {
        const weekDays = [];
        for (let day = 0; day < 7; day++) {
          const dayEvents = this.getEventsForDate(current);
          weekDays.push({
            date: new Date(current),
            isCurrentMonth: current.getMonth() === month,
            isToday: this.isToday(current),
            events: dayEvents
          });
          current.setDate(current.getDate() + 1);
        }
        this.calendarDays.push(weekDays);
      }
    }

    private generateWeekView(): void {
      const startOfWeek = this.getStartOfWeek(this.currentDate);
      
      this.weekStart = new Date(startOfWeek);
      this.weekEnd = new Date(startOfWeek);
      this.weekEnd.setDate(this.weekEnd.getDate() + 6);

      this.calendarDays = [];
      const current = new Date(startOfWeek);
      
      for (let i = 0; i < 7; i++) {
        const dayEvents = this.getEventsForDate(current);
        this.calendarDays.push({
          date: new Date(current),
          isToday: this.isToday(current),
          events: dayEvents
        });
        current.setDate(current.getDate() + 1);
      }
    }

    private getStartOfWeek(date: Date): Date {
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day;
      startOfWeek.setDate(diff);
      return startOfWeek;
    }

    private generateDayView(): void {
      const dayEvents = this.getEventsForDate(this.currentDate);
      this.calendarDays = [{
        date: new Date(this.currentDate),
        isToday: this.isToday(this.currentDate),
        events: dayEvents
      }];
    }

    private getEventsForDate(date: Date): CalendarEvent[] {
      return this.events.filter(event => 
        this.isSameDay(new Date(event.start), date)
      );
    }

    private isToday(date: Date): boolean {
      return this.isSameDay(date, new Date());
    }

    private isSameDay(date1: Date, date2: Date): boolean {
      return date1.toDateString() === date2.toDateString();
    }

    getEventsForTimeSlot(day: any, timeSlot: string): CalendarEvent[] {
      if (!day.events) return [];
      
      return day.events.filter((event: CalendarEvent) => {
        const eventDate = new Date(event.start);
        const eventHour = eventDate.getHours();
        const slotHour = parseInt(timeSlot.split(':')[0]);
        return eventHour === slotHour;
      });
    }

    onDateClick(day: any): void {
      // Validar que la fecha no sea anterior a hoy
      if (!this.isValidFutureDate(day.date)) {
        Swal.fire('Error', 'No puedes crear recordatorios en fechas pasadas.', 'error');
        return;
      }

      this.selectedDate = day.date.toISOString().split('T')[0];
      
      // Si es hoy, validar que la hora no sea anterior a la actual
      if (this.isToday(day.date)) {
        this.selectedTime = this.getValidTimeForToday();
      } else {
        this.selectedTime = '09:00';
      }
      
      this.openCreateReminderModal();
    }

    onTimeSlotClick(day: any, timeSlot: string): void {
      // Validar que la fecha no sea anterior a hoy
      if (!this.isValidFutureDate(day.date)) {
        Swal.fire('Error', 'No puedes crear recordatorios en fechas pasadas.', 'error');
        return;
      }

      // Validar que la hora no sea anterior a la actual si es hoy
      if (this.isToday(day.date) && !this.isValidTimeForToday(timeSlot)) {
        Swal.fire('Error', 'No puedes crear recordatorios en horas pasadas.', 'error');
        return;
      }

      this.selectedDate = day.date.toISOString().split('T')[0];
      this.selectedTime = timeSlot;
      this.openCreateReminderModal();
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
      Swal.fire({
        title: 'PDF Guardado',
        text: 'El calendario se ha guardado correctamente como PDF.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#8b5cf6'
      });
      this.closePrintModal();
    }

    openCreateReminderModal(): void {
      if (!this.selectedDate) {
        const today = new Date();
        this.selectedDate = today.toISOString().split('T')[0];
        
        // Si es hoy, usar una hora válida
        if (this.isToday(today)) {
          this.selectedTime = this.getValidTimeForToday();
        } else {
          this.selectedTime = '09:00';
        }
      }
      this.showCreateReminderModal = true;
    }

    closeCreateReminderModal(): void {
      this.showCreateReminderModal = false;
      this.selectedDate = '';
      this.selectedTime = '';
      this.isEditMode = false;
      this.reminderToEdit = null;
    }

    onReminderCreated(event: CalendarEvent): void {

      this.calendarService.addEvent(event);
      console.log('Recordatorio creado exitosamente:', event);
      
      Swal.fire('Éxito', 'Recordatorio creado correctamente.', 'success');

      this.closeCreateReminderModal();
    }

    onReminderUpdated(event: CalendarEvent): void {
      this.calendarService.updateEventInSubject(event);
      console.log('Recordatorio actualizado exitosamente:', event);
      
      Swal.fire('Éxito', 'Recordatorio actualizado correctamente.', 'success');
      
      this.closeCreateReminderModal();
    }

    deleteReminder(reminderId: string): void {
      console.log('Intentando eliminar recordatorio con ID:', reminderId);
      
      this.calendarService.deleteReminder(reminderId).subscribe({
        next: () => {

          this.calendarService.removeEventFromSubject(reminderId);
          console.log('Recordatorio eliminado exitosamente');
          
          Swal.fire('Éxito', 'Recordatorio eliminado correctamente.', 'success');
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
          
          Swal.fire('Error', errorMessage, 'error');
        }
      });
    }

    handleEventClick(event: CalendarEvent, mouseEvent?: MouseEvent): void {
      this.selectedEvent = event;
      
      // Calcular posición del modal basada en la posición del mouse
      if (mouseEvent) {
        this.modalPosition.x = mouseEvent.clientX;
        this.modalPosition.y = mouseEvent.clientY;
      } else {
        // Posición por defecto si no hay evento de mouse
        this.modalPosition.x = window.innerWidth / 2 - 150;
        this.modalPosition.y = window.innerHeight / 2 - 100;
      }
      
      this.showEventOptionsModal = true;
    }

    closeEventOptionsModal(): void {
      this.showEventOptionsModal = false;
      this.selectedEvent = null;
    }

    updateReminder(): void {
      if (!this.selectedEvent) return;
      
      // Configurar el modal para modo edición
      this.isEditMode = true;
      this.reminderToEdit = this.selectedEvent;
      this.selectedDate = '';
      this.selectedTime = '';
      
      // Abrir el modal
      this.showCreateReminderModal = true;
      this.closeEventOptionsModal();
    }

    confirmDeleteReminder(): void {
      if (!this.selectedEvent) return;
      
      Swal.fire({
        title: '¿Estás seguro?',
        html: `
          <p>¿Deseas eliminar este recordatorio?</p>
          <br>
          <strong>Título:</strong> ${this.selectedEvent.title}<br>
          <strong>Fecha:</strong> ${this.formatEventDate(this.selectedEvent.start)}<br>
          <br>
          <em>Esta acción no se puede deshacer.</em>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed && this.selectedEvent?.id) {
          this.deleteReminder(this.selectedEvent.id);
          this.closeEventOptionsModal();
        }
      });
    }

    formatEventDate(dateString: string): string {
      return new Date(dateString).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    changeView(view: string): void {
      this.currentView = view;
      this.updateCalendarView();
      console.log(`Vista cambiada a: ${view}`);
    }

    previousPeriod(): void {
      switch (this.currentView) {
        case 'month':
          this.currentDate.setMonth(this.currentDate.getMonth() - 1);
          break;
        case 'week':
          this.currentDate.setDate(this.currentDate.getDate() - 7);
          break;
        case 'day':
          this.currentDate.setDate(this.currentDate.getDate() - 1);
          break;
      }
      this.updateCalendarView();
      console.log('Navegando al período anterior');
    }

    nextPeriod(): void {
      switch (this.currentView) {
        case 'month':
          this.currentDate.setMonth(this.currentDate.getMonth() + 1);
          break;
        case 'week':
          this.currentDate.setDate(this.currentDate.getDate() + 7);
          break;
        case 'day':
          this.currentDate.setDate(this.currentDate.getDate() + 1);
          break;
      }
      this.updateCalendarView();
      console.log('Navegando al siguiente período');
    }

    goToToday(): void {
      this.currentDate = new Date();
      this.updateCalendarView();
      console.log('Navegando a hoy');
    }

    get calendarEvents(): CalendarEvent[] {
      return this.events;
    }

    getCurrentTitle(): string {
      switch (this.currentView) {
        case 'month':
          return `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        case 'week':
          const startDate = this.weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          const endDate = this.weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
          return `${startDate} - ${endDate}`;
        case 'day':
          return this.currentDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
        default:
          return '';
      }
    }

    // Validation methods
    isValidFutureDate(date: Date): boolean {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate >= today;
    }

    isValidTimeForToday(timeSlot: string): boolean {
      const now = new Date();
      const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
      
      const currentDateTime = new Date();
      currentDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
      
      const slotDateTime = new Date();
      slotDateTime.setHours(slotHour, slotMinute, 0, 0);
      
      return slotDateTime > currentDateTime;
    }

    private getValidTimeForToday(): string {
      const now = new Date();
      let nextHour = now.getHours();
      if (now.getMinutes() >= 30) {
        nextHour += 1;
      }
      
      // Asegurar que esté dentro del rango de timeSlots (6-22)
      nextHour = Math.max(6, Math.min(22, nextHour));
      
      return `${nextHour.toString().padStart(2, '0')}:00`;
    }

    isValidTimeSlot(day: any, timeSlot: string): boolean {
      return this.isValidFutureDate(day.date) && 
             (!this.isToday(day.date) || this.isValidTimeForToday(timeSlot));
    }
}