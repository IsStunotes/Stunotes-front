import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordResetService } from '../../../../services/password-reset.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `<div class="auth-container">
  <div class="auth-box animate-slide-up">
    <h1 class="auth-title">StuNotes</h1>
    <p class="subtitle" *ngIf="valid">Ingresa tu nueva contraseña</p>
    <p class="subtitle" *ngIf="!valid">El enlace de recuperación no es válido o ha expirado.</p>

    <form *ngIf="valid" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Nueva contraseña</label>
        <input type="password" formControlName="newPassword" />
      </div>

      <button type="submit" [disabled]="submitting">
        {{ submitting ? 'Actualizando...' : 'Actualizar contraseña' }}
      </button>
    </form>

    <a class="forgot-link" [routerLink]="['/auth']">Volver al inicio de sesión</a>
  </div>
</div>
`,
styleUrls: ['../auth/auth.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token: string | null = null;
  valid = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: PasswordResetService,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');

    if (this.token) {
      this.authService.checkToken(this.token).subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.valid = false;
          }
        },
        error: () => {
          this.valid = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.token) {
      this.submitting = true;
      this.authService.resetPassword(this.token, this.form.value.newPassword).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Tu contraseña se actualizó correctamente.',
            confirmButtonText: 'Ir al login',
            confirmButtonColor: '#6C47FF'
          }).then(() => {
            this.router.navigate(['/auth/login']);
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la contraseña. Intenta de nuevo.',
            confirmButtonColor: '#d33'
          });
          this.submitting = false;
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
  
}
