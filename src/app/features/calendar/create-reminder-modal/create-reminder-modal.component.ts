import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../../services/calendar.service';
import { CalendarEvent } from '../../../models/reminder.model';

@Component({
  selector: 'app-create-reminder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Crear Recordatorio</h3>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        
        <form [formGroup]="reminderForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-group">
            <label for="titulo">Título del Recordatorio *</label>
            <input 
              type="text" 
              id="titulo" 
              formControlName="titulo"
              placeholder="Ingrese el título del recordatorio"
              class="form-control"
              [class.is-invalid]="reminderForm.get('titulo')?.invalid && reminderForm.get('titulo')?.touched"
            >
            <div class="error-message" *ngIf="reminderForm.get('titulo')?.invalid && reminderForm.get('titulo')?.touched">
              El título es obligatorio
            </div>
          </div>

          <div class="form-group">
            <label for="fecha">Fecha *</label>
            <input 
              type="date" 
              id="fecha" 
              formControlName="fecha"
              class="form-control"
              [class.is-invalid]="reminderForm.get('fecha')?.invalid && reminderForm.get('fecha')?.touched"
            >
            <div class="error-message" *ngIf="reminderForm.get('fecha')?.invalid && reminderForm.get('fecha')?.touched">
              La fecha es obligatoria
            </div>
          </div>

          <div class="form-group">
            <label for="hora">Hora *</label>
            <input 
              type="time" 
              id="hora" 
              formControlName="hora"
              class="form-control"
              [class.is-invalid]="reminderForm.get('hora')?.invalid && reminderForm.get('hora')?.touched"
            >
            <div class="error-message" *ngIf="reminderForm.get('hora')?.invalid && reminderForm.get('hora')?.touched">
              La hora es obligatoria
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="reminderForm.invalid || isSubmitting"
            >
              <span *ngIf="isSubmitting">Creando...</span>
              <span *ngIf="!isSubmitting">Crear Recordatorio</span>
            </button>
          </div>
        </form>

        <div class="error-alert" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      font-family: 'Poppins', sans-serif;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-alert {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      margin: 20px;
      border-radius: 4px;
      border: 1px solid #f5c6cb;
    }
  `]
})
export class CreateReminderModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() preselectedDate: string = '';
  @Input() preselectedTime: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() reminderCreated = new EventEmitter<CalendarEvent>();

  reminderForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService
  ) {
    this.reminderForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(1)]],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    this.setMinDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preselectedDate']?.currentValue) {
      this.reminderForm.patchValue({ fecha: this.preselectedDate });
    }
    if (changes['preselectedTime']?.currentValue) {
      this.reminderForm.patchValue({ hora: this.preselectedTime });
    }
    
    if (changes['isVisible']?.currentValue && (this.preselectedDate || this.preselectedTime)) {
      setTimeout(() => {
        document.getElementById('titulo')?.focus();
      }, 100);
    }
  }

  private setMinDate(): void {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    this.reminderForm.patchValue({ fecha: minDate });
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.reminderForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValue = this.reminderForm.value;
      const dateTime = this.combineDateAndTime(formValue.fecha, formValue.hora);
      
      const selectedDateTime = new Date(dateTime);
      const now = new Date();
      
      if (selectedDateTime <= now) {
        this.errorMessage = 'La fecha y hora del recordatorio debe ser futura.';
        this.isSubmitting = false;
        return;
      }

      this.calendarService.createReminder(formValue.titulo, dateTime).subscribe({
        next: (event) => {
          this.reminderCreated.emit(event);
          this.onClose();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating reminder:', error);
          if (error.message.includes('autenticado')) {
            this.errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          } else if (error.message.includes('fecha')) {
            this.errorMessage = 'La fecha del recordatorio debe ser futura.';
          } else {
            this.errorMessage = 'Error al crear el recordatorio. Por favor, intenta nuevamente.';
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  private combineDateAndTime(fecha: string, hora: string): string {
    return `${fecha}T${hora}:00`;
  }

  private resetForm(): void {
    this.reminderForm.reset();
    this.setMinDate();
    this.isSubmitting = false;
    this.errorMessage = '';
  }
}
