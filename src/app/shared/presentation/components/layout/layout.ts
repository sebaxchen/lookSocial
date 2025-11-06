import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from '../header/header';
import { AuthService } from '../../../application/auth.service';
import { PostService } from '../../../application/post.service';
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
  private postService = inject(PostService);

  // Obtener etiquetas reales de los posts
  tags = computed(() => {
    // Leer el signal de posts para que el computed se actualice cuando cambien
    const posts = this.postService.posts();
    const etiquetas = this.postService.obtenerTodasLasEtiquetas();
    // Convertir al formato que espera el HTML
    return etiquetas.map(etiqueta => ({
      name: `#${etiqueta.nombre}`,
      category: 'Etiqueta · Tendencia',
      count: this.formatearNumero(etiqueta.count)
    }));
  });
  
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
    // Extraer el nombre de la etiqueta (sin el #)
    const etiquetaNombre = tagName.replace('#', '').toLowerCase();
    // Establecer el filtro de etiqueta
    this.postService.filtrarPorEtiqueta(etiquetaNombre);
    // Navegar a la vista de etiquetas
    this.router.navigate(['/etiquetas']);
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

  formatearNumero(num: number): string {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) {
      const miles = num / 1000;
      if (miles % 1 === 0) {
        return `${miles} mil`;
      }
      return `${miles.toFixed(1)} mil`;
    }
    const millones = num / 1000000;
    if (millones % 1 === 0) {
      return `${millones} M`;
    }
    return `${millones.toFixed(1)} M`;
  }
}
