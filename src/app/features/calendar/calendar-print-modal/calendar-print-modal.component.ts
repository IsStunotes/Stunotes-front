import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-print-modal',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './calendar-print-modal.component.css',
  template: `
    <div class="modal-overlay" (click)="onClose()" *ngIf="isVisible">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-body">
          <div class="preview-container">
            <div class="print-header">
              <h2>Calendario Semanal</h2>
              <h3>{{ getCurrentWeekTitle() }}</h3>
            </div>
            
            <div class="weekly-calendar-preview">
              <!-- Header de días -->
              <div class="week-header-print">
                <div class="time-column-header-print"></div>
                <div *ngFor="let day of weekDays" class="day-header-print">
                  <div class="day-name-print">{{ day.name }}</div>
                  <div class="day-date-print">{{ day.date }}</div>
                </div>
              </div>
              
              <!-- Grid de horarios -->
              <div class="week-grid-print">
                <div *ngFor="let timeSlot of timeSlots" class="time-row-print">
                  <div class="time-label-print">{{ timeSlot }}</div>
                  <div *ngFor="let day of weekDays" class="time-slot-print">
                    <div *ngFor="let event of getEventsForDayAndTime(day.fullDate, timeSlot)" 
                         class="event-item-print">
                      {{ event.title }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer no-print">
          <button class="action-btn print-btn" (click)="onPrint()">
            Imprimir
          </button>
          <button class="action-btn pdf-btn" (click)="onSavePDF()">
            Guardar PDF
          </button>
          <button class="action-btn cancel-btn" (click)="onClose()">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `
})
export class CalendarPrintModalComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() events: any[] = [];
  @Input() currentDate: Date = new Date();
  @Output() closeModal = new EventEmitter<void>();
  @Output() printCalendar = new EventEmitter<void>();
  @Output() savePDF = new EventEmitter<void>();

  weekDays: any[] = [];
  timeSlots: string[] = [];
  private static readonly WEEK_DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  private static readonly MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  weekDayNames: string[] = CalendarPrintModalComponent.WEEK_DAY_NAMES;
  monthNames: string[] = CalendarPrintModalComponent.MONTH_NAMES;

  ngOnChanges(): void {
    this.generateTimeSlots();
    this.generateCurrentWeek();
    console.log('Events updated for print modal:', this.events.length);
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 6; hour <= 22; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  private generateCurrentWeek(): void {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.weekDays = [];
    const current = new Date(startOfWeek);

    for (let i = 0; i < 7; i++) {
      this.weekDays.push({
        name: this.weekDayNames[i],
        date: current.getDate(),
        fullDate: new Date(current)
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

  getCurrentWeekTitle(): string {
    if (this.weekDays.length === 0) return '';
    
    const firstDay = this.weekDays[0].fullDate;
    const lastDay = this.weekDays[6].fullDate;
    
    const startDate = `${firstDay.getDate()} ${this.monthNames[firstDay.getMonth()]}`;
    const endDate = `${lastDay.getDate()} ${this.monthNames[lastDay.getMonth()]} ${lastDay.getFullYear()}`;
    
    return `${startDate} - ${endDate}`;
  }

  getEventsForDayAndTime(date: Date, timeSlot: string): any[] {
    if (!this.events || this.events.length === 0) return [];
    
    const targetHour = parseInt(timeSlot.split(':')[0]);
    
    return this.events.filter(event => {
      const eventDate = new Date(event.start);
      return this.isSameDay(eventDate, date) && eventDate.getHours() === targetHour;
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
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

  onClose(): void {
    this.closeModal.emit();
  }

  onPrint(): void {
    // Trigger print for the current window - the CSS will handle hiding the buttons
    setTimeout(() => {
      window.print();
    }, 100);
    this.printCalendar.emit();
  }

  onSavePDF(): void {
    alert('Funcionalidad de PDF no implementada. Use la opción de imprimir del navegador.');
    this.savePDF.emit();
  }
}