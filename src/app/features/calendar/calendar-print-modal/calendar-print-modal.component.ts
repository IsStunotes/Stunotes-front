import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-calendar-print-modal',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  styleUrl: './calendar-print-modal.component.css',
  template: `
    <div class="modal-overlay" (click)="onClose()" *ngIf="isVisible">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-body">
          <div class="preview-container">
            <full-calendar [options]="weeklyCalendarOptions"></full-calendar>
          </div>
        </div>
        
        <div class="modal-footer">
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
  @Output() closeModal = new EventEmitter<void>();
  @Output() printCalendar = new EventEmitter<void>();
  @Output() savePDF = new EventEmitter<void>();

  weeklyCalendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    locale: 'es',
    events: [],
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: true,
    nowIndicator: true,
    scrollTime: '08:00:00'
  };

  ngOnChanges(): void {
    this.updateCalendarEvents();
  }

  private updateCalendarEvents(): void {
    this.weeklyCalendarOptions = {
      ...this.weeklyCalendarOptions,
      events: this.events
    };
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onPrint(): void {
    window.print();
    this.printCalendar.emit();
  }

  onSavePDF(): void {
    alert('Funcionalidad de PDF no implementada. Use la opción de imprimir del navegador.');
    this.savePDF.emit();
  }
}
