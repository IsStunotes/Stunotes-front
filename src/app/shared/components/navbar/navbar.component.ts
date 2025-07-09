import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar">
      <h1 class="logo" (click)="goHome()">StuNotes</h1>

      <div *ngIf="user" class="user-info">
        <i class="fa fa-user user-icon"></i>
        <span class="user-name" (click)="goToProfile()">{{ user.name }}</span>
        <button class="btn-purple" (click)="logout()">Cerrar Sesión</button>
      </div>
    </header>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarLoggedComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/auth/profile']);
  }
}
