import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from './lucide-icons.module';
import { FooterComponent } from '../../../shared/components/footer/footer.component'
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, LucideIconsModule, FooterComponent],
  styleUrls: ['./landing.component.css'],
  template: `
    <header class="navbar">
      <h1 class="logo">StuNotes</h1>
      <div>
        <button class="btn-outline" (click)="goToLogin()">Iniciar Sesión</button>
        <button class="btn-purple" (click)="goToRegister()">Registrarse</button>
      </div>
    </header>

    <section class="hero">
      <h1>Bienvenido a <span class="highlight">StuNotes</span></h1>
      <p>La plataforma educativa que conecta profesores y estudiantes, facilitando el aprendizaje y la enseñanza con herramientas modernas y eficientes.</p>
      <div class="buttons">
        <button class="btn-purple" (click)="goToRegister()">Comenzar Ahora</button>
        <button class="btn-outline" (click)="goToLogin()">Ya tengo cuenta</button>
      </div>
    </section>

    <section class="benefits">
      <h2>¿Por qué elegir StuNotes?</h2>
      <p>Descubre las herramientas que hacen de StuNotes la mejor opción para tu educación</p>
      <div class="benefit-grid">
        <div class="card" *ngFor="let feature of features">
          <div class="icon-wrapper">
            <lucide-icon [name]="feature.icon" class="icon"></lucide-icon>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section class="stats" #statsSection>
      <h2>¿Listo para comenzar?</h2>
      <p>Únete a miles de estudiantes y profesores que ya están usando StuNotes</p>
      <div class="stat-grid">
        <div>
          <h3>{{ teachersCount }}</h3>
          <p>Profesores registrados</p>
        </div>
        <div>
          <h3>{{ studentsCount }}</h3>
          <p>Estudiantes activos</p>
        </div>
        <div>
          <h3>{{ coursesCount }}</h3>
          <p>Cursos publicados</p>
        </div>
      </div>
    </section>
    <app-footer></app-footer>
  `
})
export class LandingComponent implements OnInit, AfterViewInit {
  teachersCount = 0;
  studentsCount = 0;
  coursesCount = 0;

  @ViewChild('statsSection') statsSection!: ElementRef;
  observer!: IntersectionObserver;
  animated = false;

  features = [
    {
      icon: 'book-open',
      title: 'Cursos Interactivos',
      description: 'Accede a contenido educativo de alta calidad'
    },
    {
      icon: 'message-square',
      title: 'Comunicación Directa',
      description: 'Conecta profesores y estudiantes en tiempo real'
    },
    {
      icon: 'calendar',
      title: 'Gestión de Horarios',
      description: 'Organiza tus clases y tiempo de estudio'
    },
    {
      icon: 'trophy',
      title: 'Seguimiento de Progreso',
      description: 'Monitorea tu desarrollo académico'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animated = true;
          this.animateCount('teachersCount', 100, 1500);
          this.animateCount('studentsCount', 500, 1500);
          this.animateCount('coursesCount', 95, 1500);
        }
      });
    });
    if (this.statsSection?.nativeElement) {
      this.observer.observe(this.statsSection.nativeElement);
    }
  }

  private animateCount(prop: 'teachersCount' | 'studentsCount' | 'coursesCount', target: number, duration: number) {
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const interval = duration / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        (this as any)[prop] = target;
        clearInterval(timer);
      } else {
        (this as any)[prop] = Math.floor(current);
      }
    }, interval);
  }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/select-role']);
  }
}
