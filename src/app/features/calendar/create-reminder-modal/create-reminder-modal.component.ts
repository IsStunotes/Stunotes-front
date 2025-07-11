import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../../services/calendar.service';
import { CalendarEvent, ActivityResponse } from '../../../models/reminder.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-reminder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Actualizar Recordatorio' : 'Crear Recordatorio' }}</h3>
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
              [readonly]="isEditMode"
              [class.readonly]="isEditMode"
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
              [min]="getMinDate()"
              class="form-control"
              [class.is-invalid]="reminderForm.get('fecha')?.invalid && reminderForm.get('fecha')?.touched"
            >
            <div class="error-message" *ngIf="reminderForm.get('fecha')?.invalid && reminderForm.get('fecha')?.touched">
              <span *ngIf="reminderForm.get('fecha')?.errors?.['required']">La fecha es obligatoria</span>
              <span *ngIf="reminderForm.get('fecha')?.errors?.['pastDate']">No puedes seleccionar una fecha pasada</span>
            </div>
            <div *ngIf="isSameDayTooClose" class="error-message">
              No puede ser en el mismo día
            </div>

          </div>

          <div class="form-group">
            <label for="hora">Hora *</label>
            <input 
              type="time" 
              id="hora" 
              formControlName="hora"
              [min]="getMinTime()"
              class="form-control"
              [class.is-invalid]="reminderForm.get('hora')?.invalid && reminderForm.get('hora')?.touched"
            >
            <div class="error-message" *ngIf="reminderForm.get('hora')?.invalid && reminderForm.get('hora')?.touched">
              <span *ngIf="reminderForm.get('hora')?.errors?.['required']">La hora es obligatoria</span>
              <span *ngIf="reminderForm.get('hora')?.errors?.['pastTime']">No puedes seleccionar una hora pasada</span>
            </div>
          </div>

          <div class="form-group">
            <label for="actividad">Tarea (Opcional)</label>
            <select 
              id="actividad" 
              formControlName="activityId"
              class="form-control"
            >
              <option value="">-- Seleccionar una tarea --</option>
              <option 
                *ngFor="let task of activities" 
                [value]="task.id"
              >
                {{ task.title }} {{ getCategoryName(task) ? '(' + getCategoryName(task) + ')' : '' }}
              </option>
            </select>
            <div class="no-tasks-message" *ngIf="activities.length === 0">
              <small>No hay tareas activas disponibles</small>
            </div>
            <div class="activity-info" *ngIf="selectedActivity">
              <div class="activity-detail">
                <strong>Descripción:</strong> 
                {{ selectedActivity.description || 'Sin descripción' }}
              </div>
              <div class="activity-detail">
                <strong>Prioridad:</strong> 
                {{ getPriorityText(selectedActivity.priority) }}
              </div>
              <div class="activity-detail">
                <strong>Categoría:</strong> 
                {{ getCategoryName(selectedActivity) }}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="reminderForm.invalid || isSubmitting || isSameDayTooClose"
            >
              <span *ngIf="isSubmitting">{{ isEditMode ? 'Actualizando...' : 'Creando...' }}</span>
              <span *ngIf="!isSubmitting">{{ isEditMode ? 'Actualizar Recordatorio' : 'Crear Recordatorio' }}</span>
            </button>
          </div>
        </form>
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

    .form-control.readonly {
      background-color: #f8f9fa;
      color: #6c757d;
      cursor: not-allowed;
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

    .activity-info {
      margin-top: 8px;
      padding: 12px;
      background-color: #f8f9fa !important;
      border-radius: 4px;
      border: 1px solid #e9ecef;
      color: #495057 !important;
    }

    .activity-info * {
      color: #495057 !important;
    }

    .activity-info strong {
      color: #343a40 !important;
      font-weight: 600;
    }

    .activity-info small {
      color: #495057 !important;
      display: block;
      line-height: 1.5;
    }

    .activity-info div {
      color: #495057 !important;
      margin-bottom: 4px;
    }

    .activity-info span {
      color: #495057 !important;
    }

    .activity-detail {
      margin-bottom: 6px;
      font-size: 0.875rem;
      color: #495057 !important;
    }

    .activity-detail:last-child {
      margin-bottom: 0;
    }

    .no-tasks-message {
      margin-top: 5px;
      color: #6c757d;
      font-style: italic;
    }

    .no-tasks-message small {
      color: #6c757d;
    }

    select.form-control {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 8px center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 40px;
      appearance: none;
    }
  `]
})
export class CreateReminderModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() isSameDayTooClose = false;
  @Input() preselectedDate: string = '';
  @Input() preselectedTime: string = '';
  @Input() isEditMode = false;
  @Input() reminderToEdit: CalendarEvent | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() reminderCreated = new EventEmitter<CalendarEvent>();
  @Output() reminderUpdated = new EventEmitter<CalendarEvent>();

  reminderForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  activities: ActivityResponse[] = [];
  selectedActivity: ActivityResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService
  ) {
    this.reminderForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(1)]],
      fecha: ['', [Validators.required, this.pastDateValidator]],
      hora: ['', [Validators.required, this.pastTimeValidator]],
      activityId: [{value: '', disabled: false}]
    });

    this.setMinDate();
    
    this.reminderForm.get('fecha')?.valueChanges.subscribe((selectedDate) => {
      if (selectedDate && this.isToday(selectedDate)) {
        const defaultTime = this.getDefaultTimeForToday();
        this.reminderForm.patchValue({ hora: defaultTime }, { emitEvent: false });
      }
      
      setTimeout(() => {
        this.reminderForm.get('hora')?.updateValueAndValidity();
      }, 0);
    });

    this.reminderForm.get('activityId')?.valueChanges.subscribe((activityId) => {
      if (activityId && this.activities.length > 0) {
        this.selectedActivity = this.activities.find(a => a.id.toString() === activityId.toString()) || null;
      } else {
        this.selectedActivity = null;
      }
    });
  }

  private loadActivities(): void {
    this.calendarService.getActiveUserActivities().subscribe({
      next: (activities: ActivityResponse[]) => {
        this.activities = activities;
        
        const activityControl = this.reminderForm.get('activityId');
        if (this.activities.length === 0) {
          activityControl?.disable();
        } else {
          activityControl?.enable();
        }
      },
      error: () => {
        this.activities = [];
        this.reminderForm.get('activityId')?.disable();
      }
    });
  }

  getPriorityText(priority: number): string {
    const priorities = { 1: 'Baja', 2: 'Media', 3: 'Alta' };
    return priorities[priority as keyof typeof priorities] || 'Sin prioridad';
  }

  getCategoryName(activity: ActivityResponse | any): string {
    if (!activity) return 'Sin categoría';
    return activity.categoryName || activity.category?.name || 'Sin categoría';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']?.currentValue && !changes['isVisible']?.previousValue) {
      this.loadActivities();
    }

    if (changes['isEditMode'] || changes['reminderToEdit']) {
      if (this.isEditMode && this.reminderToEdit) {
        this.loadActivities();
        setTimeout(() => {
          this.populateFormForEdit();
        }, 100);
      }
    }

    if (changes['preselectedDate']?.currentValue && !this.isEditMode) {
      this.reminderForm.patchValue({ fecha: this.preselectedDate });
      
      if (this.isToday(this.preselectedDate)) {
        const defaultTime = this.getDefaultTimeForToday();
        this.reminderForm.patchValue({ hora: defaultTime });
      }
      
      setTimeout(() => {
        this.reminderForm.get('hora')?.updateValueAndValidity();
      }, 0);
    }
    if (changes['preselectedTime']?.currentValue && !this.isEditMode) {
      this.reminderForm.patchValue({ hora: this.preselectedTime });
    }
    
    if (changes['isVisible']?.currentValue && (this.preselectedDate || this.preselectedTime)) {
      setTimeout(() => {
        if (!this.isEditMode) {
          document.getElementById('titulo')?.focus();
        } else {
          document.getElementById('fecha')?.focus();
        }
      }, 100);
    }
  }

  private setMinDate(): void {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    this.reminderForm.patchValue({ 
      fecha: minDate,
      hora: this.getDefaultTimeForToday()
    }, { emitEvent: false });
    
    this.reminderForm.markAsUntouched();
    this.reminderForm.markAsPristine();
  }

  private getDefaultTimeForToday(): string {
    const now = new Date();
    const nextHour = Math.min(now.getHours() + 1, 23);
    const minutes = nextHour === 23 ? '59' : '00';
    
    return `${nextHour.toString().padStart(2, '0')}:${minutes}`;
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
      
      // Para hoy, requerir al menos 1 hora de diferencia
      const today = new Date();
      const [year, month, day] = formValue.fecha.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day); // month es 0-indexado
      
      if (selectedDate.toDateString() === today.toDateString()) {
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
        if (selectedDateTime < fifteenMinutesFromNow) {
          Swal.fire({
            icon: 'warning',
            title: 'Hora inválida',
            text: 'La hora debe ser al menos 15 minutos después de la actual.',
            confirmButtonColor: '#6C47FF'
          });
          this.isSubmitting = false;
          return;
        }
     
      } else {
        // Para fechas futuras, solo verificar que no sea en el pasado
        if (selectedDateTime <= now) {
          Swal.fire({
            icon: 'warning',
            title: 'Fecha inválida',
            text: 'La fecha y hora del recordatorio debe ser futura.',
            confirmButtonColor: '#6C47FF'
          });
          this.isSubmitting = false;
          return;
        }        
      }

      if (this.isEditMode && this.reminderToEdit?.id) {
        // Actualizar recordatorio existente
        const activityId = formValue.activityId ? parseInt(formValue.activityId) : undefined;
        this.calendarService.updateReminder(this.reminderToEdit.id, formValue.titulo, dateTime, activityId).subscribe({
          next: (event) => {
            this.reminderUpdated.emit(event);
            this.onClose();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating reminder:', error);
            if (error.message.includes('autenticado')) {
              Swal.fire({
                icon: 'info',
                title: 'Sesión expirada',
                text: 'Por favor, inicia sesión nuevamente.',
                confirmButtonColor: '#6C47FF'
              });
            } else if (error.message.includes('fecha')) {
              Swal.fire({
                icon: 'warning',
                title: 'Fecha inválida',
                text: 'La fecha del recordatorio debe ser futura.',
                confirmButtonColor: '#6C47FF'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el recordatorio. Intenta nuevamente.',
                confirmButtonColor: '#6C47FF'
              });
            }            
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear nuevo recordatorio con actividad opcional
        const activityId = formValue.activityId ? parseInt(formValue.activityId) : undefined;
        this.calendarService.createReminder(formValue.titulo, dateTime, activityId).subscribe({
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
  }

  private combineDateAndTime(fecha: string, hora: string): string {
    return `${fecha}T${hora}:00`;
  }

  private resetForm(): void {
    this.reminderForm.reset();
    if (!this.isEditMode) {
      this.setMinDate();
    }
    this.isSubmitting = false;
    this.errorMessage = '';
    this.selectedActivity = null;
    this.activities = [];
    
    this.reminderForm.get('activityId')?.enable();
    Object.keys(this.reminderForm.controls).forEach(key => {
      this.reminderForm.get(key)?.setErrors(null);
    });
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMinTime(): string | null {
    const selectedDate = this.reminderForm.get('fecha')?.value;
    if (!selectedDate || !this.isToday(selectedDate)) return null;
    
    const nextHour = Math.min(new Date().getHours() + 1, 23);
    return nextHour === 23 ? '23:59' : `${nextHour.toString().padStart(2, '0')}:00`;
  }

  pastDateValidator = (control: any) => {
    if (!control.value) return null;
    return this.isPastDate(control.value) ? { pastDate: true } : null;
  };

  pastTimeValidator = (control: any) => {
    const selectedDate = this.reminderForm?.get('fecha')?.value;
    const selectedTime = control.value;
  
    if (!selectedDate || !selectedTime) {
      this.isSameDayTooClose = false;
      return null;
    }
  
    if (!this.isToday(selectedDate)) {
      this.isSameDayTooClose = false;
      return null;
    }
  
    const now = new Date();
    const [hour, minute] = selectedTime.split(':').map(Number);
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hour, minute, 0, 0);
  
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60000);
    const tooSoon = selectedDateTime.getTime() < fifteenMinutesLater.getTime();
  
    this.isSameDayTooClose = tooSoon;
  
    return tooSoon ? { pastTime: true } : null;
  };   

  private isToday(dateString: string): boolean {
    const today = new Date().toDateString();
    const [year, month, day] = dateString.split('-').map(Number);
    const selected = new Date(year, month - 1, day).toDateString();
    return selected === today;
  }

  private isPastDate(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dateString.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    return selected < today;
  }

  private populateFormForEdit(): void {
    if (!this.reminderToEdit) return;
    
    const startDate = new Date(this.reminderToEdit.start);
    const fecha = startDate.toISOString().split('T')[0];
    const hora = startDate.toTimeString().slice(0, 5);
    
    this.reminderForm.patchValue({
      titulo: this.reminderToEdit.title,
      fecha: fecha,
      hora: hora,
      activityId: this.reminderToEdit.activityId?.toString() || ''
    });
    
    setTimeout(() => {
      this.reminderForm.get('fecha')?.updateValueAndValidity();
      this.reminderForm.get('hora')?.updateValueAndValidity();
    }, 0);
  }
}
