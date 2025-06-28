import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./select-role.component.css'],
  animations: [
    trigger('fadeDrop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="page-container" [@fadeDrop]>
      <h1 class="logo">StuNotes</h1>
      <p class="subtitle">¿Cómo te identificas?</p>

      <div class="card">
        <h2 class="card-title">Soy...</h2>
        <p class="card-subtitle">Selecciona tu rol en la plataforma</p>

        <button class="role-option" (click)="goToRegister('teacher')">
          <span class="icon">🎓</span>
          <div class="text">
            <strong>Profesor</strong>
            <small>Enseño y guío estudiantes</small>
          </div>
        </button>

        <button class="role-option" (click)="goToRegister('student')">
          <span class="icon">🧑‍🎓</span>
          <div class="text">
            <strong>Estudiante</strong>
            <small>Aprendo y me desarrollo</small>
          </div>
        </button>

        <div class="back-link" (click)="goBack()">← Volver</div>
      </div>
    </div>
  `
})
export class SelectRoleComponent {
  constructor(private router: Router) {}

  goToRegister(role: 'teacher' | 'student'): void {
    this.router.navigate([`/auth/register/${role}`]); 
  }

  goBack(): void {
    this.router.navigate(['/landing']); 
  }
}
