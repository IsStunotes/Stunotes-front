import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <footer class="footer">
      <strong>StuNotes</strong> © 2025 - Todos los derechos reservados
      <nav>
        <a routerLink="/terminos">Términos</a>
        <a routerLink="/privacidad">Privacidad</a>
        <a routerLink="/ayuda">Ayuda</a>
        <a routerLink="/contacto">Contacto</a>
    </nav>
    </footer>
  `,
    styleUrls: ['./footer.component.css']
})
export class FooterComponent { } 