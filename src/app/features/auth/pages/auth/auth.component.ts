import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service'; 
import { LoginRequest, AuthResponse } from '../../../../models/auth.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-box animate-slide-up">
        <h1 class="auth-title">StuNotes</h1>
        <p class="subtitle">Conecta con tu comunidad educativa</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" formControlName="email" />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" formControlName="password" />
          </div>

          <button type="submit" [disabled]="submitting">
            {{ submitting ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <a class="forgot-link" (click)="goToForgot()">¿Olvidaste tu contraseña?</a>

        <div class="divider"></div>

        <button class="register-btn" (click)="goToRegister()">Crear cuenta nueva</button>
      </div>
    </div>
  `,
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  loginForm: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: LoginRequest = this.loginForm.value;

      this.submitting = true;

      this.authService.login(credentials).subscribe({
        next: (response: AuthResponse) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          


          switch (response.role) {
            case 'STUDENT':
              this.router.navigate(['/home']);
              break;
            case 'TEACHER':
              this.router.navigate(['/home']);
              break;
            case 'ADMIN':
              this.router.navigate(['/home']);
              break;
            default:
              this.router.navigate(['/']);
          }

          this.submitting = false;
        },
        error: (error) => {
          alert('Credenciales incorrectas o error en el servidor.');
          this.submitting = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  goToRegister(): void {
    this.router.navigate(['/auth/select-role']);
  }

  goToForgot(): void {
    this.router.navigate(['/recover']);
  }
}