import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-calendar-print-modal',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './calendar-print-modal.component.css',
  template: `
    <div class="modal-overlay" (click)="onClose()" *ngIf="isVisible">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-body">
          <div class="preview-container" id="calendar-content">
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
          <div style="margin-left: auto; display: flex; gap: 15px;">
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
  weekDayNames: string[] = ['DOM', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'LUN'];
  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor() {
    // Inicializar las horas al crear el componente
    this.generateTimeSlots();
    this.generateCurrentWeek();
  }

  ngOnChanges(): void {
    this.generateTimeSlots();
    this.generateCurrentWeek();
    console.log('Events updated for print modal:', this.events.length);
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 6; hour <= 22; hour += 2) {
      const currentHour = hour.toString().padStart(2, '0');
      const nextHour = (hour + 2).toString().padStart(2, '0');
      this.timeSlots.push(`${currentHour}:00-${nextHour}:00`);
    }
    console.log('Time slots generated:', this.timeSlots.length, this.timeSlots);
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
    
    // Extraer la hora de inicio del rango (ej: "06:00-08:00" -> 6)
    const startHour = parseInt(timeSlot.split(':')[0]);
    const endHour = startHour + 2;
    
    return this.events.filter(event => {
      const eventDate = new Date(event.start);
      const eventHour = eventDate.getHours();
      // Incluir eventos que estén en este rango de 2 horas
      return this.isSameDay(eventDate, date) && eventHour >= startHour && eventHour < endHour;
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onPrint(): void {
    const element = document.getElementById('calendar-content');
    if (!element) {
      console.error('No se encontró el elemento del calendario');
      return;
    }

    // Configurar opciones para html2canvas
    const options = {
      scale: 1.2, // Escala optimizada
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      ignoreElements: (el: Element) => {
        return el.classList.contains('no-print') || 
               el.classList.contains('modal-footer');
      }
    };

    html2canvas(element, options).then(canvas => {
      // Crear un elemento de imagen temporal
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.height = 'auto';

      // Crear un contenedor temporal para la impresión
      const printContainer = document.createElement('div');
      printContainer.style.display = 'none';
      printContainer.id = 'temp-print-container';
      printContainer.appendChild(img);

      // Agregar estilos para impresión
      const printStyles = document.createElement('style');
      printStyles.innerHTML = `
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
        @media print {
          * {
            box-sizing: border-box;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          body * {
            visibility: hidden;
          }
          #temp-print-container, #temp-print-container * {
            visibility: visible;
          }
          #temp-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: block !important;
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
          }
          #temp-print-container img {
            width: 100%;
            height: auto;
            max-width: 100%;
            max-height: calc(100vh - 20mm);
            object-fit: contain;
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
            display: block;
          }
        }
      `;

      // Agregar elementos al DOM
      document.head.appendChild(printStyles);
      document.body.appendChild(printContainer);

      // Ejecutar impresión
      setTimeout(() => {
        window.print();
        
        // Limpiar elementos temporales después de imprimir
        setTimeout(() => {
          document.head.removeChild(printStyles);
          document.body.removeChild(printContainer);
        }, 1000);
      }, 500);

    }).catch(error => {
      console.error('Error al generar la vista de impresión:', error);
      alert('Error al preparar la impresión. Por favor, inténtelo de nuevo.');
    });

    this.printCalendar.emit();
  }

  onSavePDF(): void {
    const element = document.getElementById('calendar-content');
    if (!element) {
      console.error('No se encontró el elemento del calendario');
      return;
    }

    // Configurar opciones para html2canvas
    const options = {
      scale: 1.5, // Escala reducida para mejor captura
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight
    };

    html2canvas(element, options).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      
      // Crear el PDF
      const pdf = new jsPDF({
        orientation: 'landscape', // Orientación horizontal
        unit: 'mm',
        format: 'a4'
      });

      // Calcular dimensiones
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular la escala para ajustar la imagen al PDF
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Centrar la imagen en el PDF
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      // Agregar la imagen al PDF solo si tiene contenido válido
      if (scaledWidth > 0 && scaledHeight > 0) {
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      }
      
      // Generar nombre del archivo con formato: horario_fecha_inicio_fecha_final
      const startDate = this.weekDays[0].fullDate;
      const endDate = this.weekDays[6].fullDate;
      const startDateString = startDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const endDateString = endDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const fileName = `horario_${startDateString}_${endDateString}.pdf`;
      
      // Guardar el PDF
      pdf.save(fileName);
    }).catch(error => {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    });

    this.savePDF.emit();
  }
}