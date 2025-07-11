import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PasswordResetService } from '../../../../services/password-reset.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="auth-container">
    <div class="auth-box animate-slide-up">
      <h1 class="auth-title">StuNotes</h1>
      <p class="subtitle">¿Olvidaste tu contraseña? Ingresa tu correo y te enviaremos un enlace.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Correo electrónico</label>
          <input type="email" formControlName="email" />
        </div>

        <button type="submit" [disabled]="submitting">
          {{ submitting ? 'Enviando...' : 'Enviar correo de recuperación' }}
        </button>
      </form>

      <a class="forgot-link" [routerLink]="['/auth']">Volver al inicio de sesión</a>
    </div>
  </div>
  `,
  styleUrls: ['../auth/auth.component.css']
})
export class RecoverComponent {
  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: PasswordResetService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submitting = true;
      const email = this.form.value.email;
      this.authService.sendResetEmail(email).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Correo enviado',
            text: 'Se envió un enlace para restablecer tu contraseña.',
            confirmButtonColor: '#7c3aed'
          }).then(() => {
            this.router.navigate(['/auth']);
          });
        },
        error: () => {
          this.submitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo enviar el correo. Verifica el email ingresado.',
            confirmButtonColor: '#7c3aed'
          });
        }
      });
    } else {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingresa un correo electrónico válido.',
        confirmButtonColor: '#7c3aed'
      });
    }
  }
}
