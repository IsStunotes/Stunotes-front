import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
export class CalendarPrintModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() events: any[] = [];
  @Input() initialView: string = 'month';
  @Output() closeModal = new EventEmitter<void>();
  @Output() printCalendar = new EventEmitter<void>();
  @Output() savePDF = new EventEmitter<void>();

  currentView: string = 'month'; // Vista por defecto

  weeklyCalendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'es',
    events: [],
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: true,
    nowIndicator: true,
    scrollTime: '08:00:00',
    dayHeaderFormat: { weekday: 'long', day: 'numeric' }
  };

  ngOnInit(): void {
    this.currentView = this.initialView;
    this.updateCalendarEvents();
    this.updateCalendarView();
  }

  ngOnChanges(): void {
    this.updateCalendarEvents();
  }

  changeView(view: string): void {
    this.currentView = view;
    this.updateCalendarView();
  }

  private updateCalendarView(): void {
    const newView = this.currentView === 'month' ? 'dayGridMonth' : 'timeGridWeek';
    this.weeklyCalendarOptions = {
      ...this.weeklyCalendarOptions,
      initialView: newView,
      events: this.events
    };
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
    // Crear una nueva ventana para imprimir solo el calendario
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const calendarElement = document.querySelector('.preview-container');
      if (calendarElement) {
        const title = this.currentView === 'month' ? 'Calendario Mensual' : 'Calendario Semanal';
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .fc { font-size: 12px; }
                @media print {
                  body { margin: 0; }
                  .fc-toolbar { display: none; }
                }
              </style>
            </head>
            <body>
              <h2>${title}</h2>
              ${calendarElement.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
    this.printCalendar.emit();
  }

  onSavePDF(): void {
    const calendarElement = document.querySelector('.preview-container') as HTMLElement;
    if (calendarElement) {
      // Mostrar indicador de carga
      this.showLoadingIndicator();
      
      html2canvas(calendarElement, {
        scale: 2, // Mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: calendarElement.offsetWidth,
        height: calendarElement.offsetHeight
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Crear nuevo documento PDF
        const pdf = new jsPDF({
          orientation: 'landscape', // Paisaje para mejor vista del calendario
          unit: 'mm',
          format: 'a4'
        });
        
        // Calcular dimensiones para que quepa en la página
        const imgWidth = 280; // Ancho en mm para A4 landscape
        const pageHeight = 210; // Alto de página A4 landscape
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10; // Margen superior
        
        // Agregar título
        pdf.setFontSize(16);
        const title = this.currentView === 'month' ? 'Calendario Mensual' : 'Calendario Semanal';
        pdf.text(title, 10, position);
        position += 10;
        
        // Agregar fecha de generación
        pdf.setFontSize(10);
        pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 10, position);
        position += 10;
        
        // Agregar imagen del calendario
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Si el calendario es muy alto, agregar páginas adicionales
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Guardar el PDF
        const viewType = this.currentView === 'month' ? 'mensual' : 'semanal';
        const fileName = `calendario-${viewType}-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        // Ocultar indicador de carga
        this.hideLoadingIndicator();
        
        console.log('PDF generado exitosamente');
        this.savePDF.emit();
      }).catch(error => {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
        this.hideLoadingIndicator();
      });
    }
  }

  private showLoadingIndicator(): void {
    // Crear un simple indicador de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
        text-align: center;
      ">
        <div>Generando PDF...</div>
        <div style="margin-top: 10px;">Por favor espere...</div>
      </div>
    `;
    document.body.appendChild(loadingDiv);
  }

  private hideLoadingIndicator(): void {
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }
}
