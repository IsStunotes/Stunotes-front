import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
      <aside class="sidebar">
        <nav class="sidebar-nav">    
          <ul class="nav-list">
            <li class="nav-item" [class.active]="isActiveRoute('/auth/profile')">
              <a routerLink="/auth/profile" class="nav-link">
                <i class="fas fa-user"></i>
                <span>Perfil</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="isActiveRoute('/home')">
              <a routerLink="/home" class="nav-link">
                <i class="fas fa-home"></i>
                <span>Home</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="isActiveRoute('/calendar')">
              <a routerLink="/calendar" class="nav-link">
                <i class="fas fa-calendar-alt"></i>
                <span>Calendario</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="isActiveRoute('/notes')">
              <a routerLink="/notes" class="nav-link">
                <i class="fas fa-list-ul"></i>
                <span>Notas</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="isActiveRoute('/tasks')">
              <a routerLink="/tasks" class="nav-link">
                <i class="fas fa-tasks"></i>
                <span>Tareas</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="isActiveRoute('/repositorios/list')">
              <a routerLink="/repositorios/list" class="nav-link">
                <i class="fas fa-file-alt"></i>
                <span>Trabajos</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    `,
    styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent implements OnInit {
  currentRoute: string = '';
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }
}