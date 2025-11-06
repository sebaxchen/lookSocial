import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PostService } from '../../../application/post.service';
import { AuthService } from '../../../application/auth.service';
import { TeamService } from '../../../application/team.service';

@Component({
  selector: 'app-etiquetas',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './etiquetas.html',
  styleUrl: './etiquetas.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class EtiquetasComponent {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private teamService = inject(TeamService);
  
  // Obtener todas las etiquetas de los posts
  etiquetas = computed(() => {
    return this.postService.obtenerTodasLasEtiquetas();
  });

  // Obtener posts filtrados cuando hay un filtro activo
  postsFiltrados = computed(() => {
    const etiquetaFiltro = this.postService.etiquetaFiltro();
    if (etiquetaFiltro) {
      return this.postService.postsFiltrados();
    }
    return [];
  });

  etiquetaFiltroActiva = this.postService.etiquetaFiltro;

  verPostsPorEtiqueta(etiquetaNombre: string) {
    // Establecer el filtro de etiqueta (sin navegar)
    this.postService.filtrarPorEtiqueta(etiquetaNombre);
  }

  regresarALista() {
    // Limpiar el filtro para volver a la lista de etiquetas
    this.postService.limpiarFiltro();
  }

  getUserInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getUserColor(nombre: string): string {
    return this.teamService.getMemberColor(nombre);
  }

  getHandle(nombre: string): string {
    return nombre.toLowerCase().replace(/\s+/g, '');
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const fechaPost = new Date(fecha);
    const diffMs = ahora.getTime() - fechaPost.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return fechaPost.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatearNumero(num: number): string {
    if (num === 0) return '';
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

  likedPosts = new Set<string>();
  bookmarkedPosts = new Set<string>();

  isLiked(postId: string): boolean {
    return this.likedPosts.has(postId);
  }

  isBookmarked(postId: string): boolean {
    return this.bookmarkedPosts.has(postId);
  }

  toggleLike(postId: string) {
    if (this.isLiked(postId)) {
      this.likedPosts.delete(postId);
      this.postService.decrementarLike(postId);
    } else {
      this.likedPosts.add(postId);
      this.postService.incrementarLike(postId);
    }
  }

  toggleBookmark(postId: string) {
    if (this.isBookmarked(postId)) {
      this.bookmarkedPosts.delete(postId);
    } else {
      this.bookmarkedPosts.add(postId);
    }
  }

  toggleComentario(postId: string) {
    console.log('Comentar en post:', postId);
  }

  toggleRetweet(postId: string) {
    this.postService.incrementarRetweet(postId);
  }

  eliminarPost(postId: string) {
    this.postService.eliminarPost(postId);
  }
}

