import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service'; 
import { SignupRequest } from '../../../../models/auth.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-teacher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./register-teacher.component.css'],
  template: `
  <div class="register-container">
    <div class="register-box">
      <h1 class="register-title">StuNotes</h1>
      <p class="subtitle">🎓 Registro como Profesor</p>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input type="text" formControlName="firstName" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Apellido</label>
            <input type="text" formControlName="lastName" class="form-control" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input type="email" formControlName="email" class="form-control" />
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input type="password" formControlName="password" class="form-control" (input)="onPasswordInput()" />
          <ul class="password-hints" *ngIf="showPasswordHints">
            <li [class.valid]="passwordStrength.hasUpperCase">Una letra mayúscula</li>
            <li [class.valid]="passwordStrength.hasLowerCase">Una letra minúscula</li>
            <li [class.valid]="passwordStrength.hasNumber">Un número</li>
            <li [class.valid]="passwordStrength.hasSymbol">Un símbolo especial</li>
            <li [class.valid]="passwordStrength.minLength">Al menos 8 caracteres</li>
          </ul>
        </div>

        <div class="form-group">
          <label class="form-label">Confirmar contraseña</label>
          <input type="password" formControlName="confirmPassword" class="form-control" />
        </div>

        <button type="submit" class="btn-register" [disabled]="submitting">
          {{ submitting ? 'Creando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <div class="link" (click)="goBack()">← Volver</div>
    </div>
  </div>`
})
export class RegisterTeacherComponent {
  registerForm: FormGroup;
  submitting = false;
  showPasswordHints = false;

  passwordStrength = {
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false,
    minLength: false
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onPasswordInput(): void {
    const password = this.registerForm.value.password || '';
    this.showPasswordHints = password.length > 0;

    this.passwordStrength = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8
    };
  }

  isPasswordStrong(): boolean {
    const s = this.passwordStrength;
    return s.hasUpperCase && s.hasLowerCase && s.hasNumber && s.hasSymbol && s.minLength;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      if (!this.isPasswordStrong()) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña insegura',
          text: 'Tu contraseña debe cumplir con todos los requisitos de seguridad.',
          confirmButtonColor: '#7c3aed'
        });
        return;
      }

      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseñas no coinciden',
          text: 'Por favor, asegúrate de que ambas contraseñas sean iguales.',
          confirmButtonColor: '#7c3aed'
        });
        return;
      }

      const request: SignupRequest = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        name: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName
      };

      this.submitting = true;

      this.authService.registerTeacher(request).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Tu cuenta como profesor ha sido creada.',
            confirmButtonColor: '#7c3aed'
          }).then(() => {
            this.router.navigate(['/home']);
          });
        },
        error: (error) => {
          this.submitting = false;
          console.error('Error completo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: error.error?.message || 'Ocurrió un error inesperado.',
            confirmButtonColor: '#7c3aed'
          });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos requeridos.',
        confirmButtonColor: '#7c3aed'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/auth/select-role']);
  }
}
