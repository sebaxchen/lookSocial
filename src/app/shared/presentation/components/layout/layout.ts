import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from '../header/header';
import { AuthService } from '../../../application/auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { signal } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    Header,
    RouterOutlet,
    MatIconModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout {
  showHeader = signal(true);

  tags = [
    { name: '#Angular', category: 'Tecnología · Tendencia', count: '12,5 mil' },
    { name: '#DesarrolloWeb', category: 'Programación · Tendencia', count: '8,9 mil' },
    { name: '#IA', category: 'Ciencia · Tendencia', count: '25,1 mil' },
    { name: '#Frontend', category: 'Diseño · Tendencia', count: '5,2 mil' },
    { name: '#TypeScript', category: 'Lenguajes · Tendencia', count: '7,3 mil' },
    { name: '#React', category: 'Tecnología · Tendencia', count: '15,8 mil' },
    { name: '#VueJS', category: 'Frameworks · Tendencia', count: '4,1 mil' },
    { name: '#NodeJS', category: 'Backend · Tendencia', count: '9,7 mil' }
  ];
  
  constructor(public authService: AuthService, private router: Router) {
    // Initialize header visibility on first load
    const initialUrl = this.router.url;
    this.showHeader.set(
      !(initialUrl === '/') &&
      !initialUrl.includes('/splash') && 
      !initialUrl.includes('/auth/login') && 
      !initialUrl.includes('/auth/register')
    );

    // Update header visibility on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      // Hide header on landing, splash, login, register
      this.showHeader.set(
        !(url === '/') &&
        !url.includes('/splash') && 
        !url.includes('/auth/login') && 
        !url.includes('/auth/register')
      );
    });
  }

  onTagClick(tagName: string) {
    console.log('Tag clicked:', tagName);
    // TODO: Navegar a la vista de etiquetas o filtrar por etiqueta
  }

  onTagOptions(event: Event, tagName: string) {
    event.stopPropagation();
    console.log('Tag options clicked for:', tagName);
    // TODO: Mostrar menú de opciones para la etiqueta
  }

  mostrarMasEtiquetas() {
    console.log('Mostrar más etiquetas');
    // TODO: Cargar más etiquetas
  }
}
