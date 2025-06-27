import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PasswordResetService } from '../../../../services/password-reset.service';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

    <a class="forgot-link" routerLink="/auth">Volver al inicio de sesión</a>
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
          alert('Se envió un correo para restablecer tu contraseña.');
          this.router.navigate(['/auth']);
        },
        error: () => {
          alert('Error al enviar el correo. Verifica el email ingresado.');
          this.submitting = false;
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
