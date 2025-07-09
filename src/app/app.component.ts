import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarLoggedComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
  <div class="main-wrapper">
    <router-outlet></router-outlet>
  </div>

  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {
  title = 'Stunotes';
} 