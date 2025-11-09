import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../application/post.service';
import { TeamService } from '../../../application/team.service';
import { CommentsService, PostComment } from '../../../application/comments.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './post.html',
  styleUrl: './post.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class PostComponent {
  private postService = inject(PostService);
  private teamService = inject(TeamService);
  private commentsService = inject(CommentsService);
  
  // Usar posts filtrados si hay un filtro activo, sino todos los posts
  posts = computed(() => {
    const etiquetaFiltro = this.postService.etiquetaFiltro();
    if (etiquetaFiltro) {
      return this.postService.postsFiltrados();
    }
    return this.postService.posts();
  });
  
  etiquetaFiltroActiva = this.postService.etiquetaFiltro;
  private comentariosAbiertos = signal<Set<string>>(new Set());
  private comentariosTexto = signal<Map<string, string>>(new Map());

  getUserInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getUserColor(nombre: string): string {
    return this.teamService.getMemberColor(nombre);
  }

  getHandle(nombre: string): string {
    return nombre.toLowerCase().replace(/\s+/g, '');
  }

  async eliminarPost(postId: string) {
    try {
      await this.postService.eliminarPost(postId);
    } catch (error) {
      console.error('Error al eliminar post:', error);
    }
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
      void this.postService.decrementarLike(postId).catch(error => {
        console.error('Error al quitar like:', error);
        this.likedPosts.add(postId);
      });
    } else {
      this.likedPosts.add(postId);
      void this.postService.incrementarLike(postId).catch(error => {
        console.error('Error al dar like:', error);
        this.likedPosts.delete(postId);
      });
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
    const abiertos = new Set(this.comentariosAbiertos());
    if (abiertos.has(postId)) {
      abiertos.delete(postId);
    } else {
      abiertos.add(postId);
      this.commentsService.commentsFor(postId);
    }
    this.comentariosAbiertos.set(abiertos);
  }

  toggleRetweet(postId: string) {
    void this.postService.incrementarRetweet(postId).catch(error => {
      console.error('Error al incrementar compartidos:', error);
    });
  }

  limpiarFiltro() {
    this.postService.limpiarFiltro();
  }

  comentariosVisibles(postId: string): boolean {
    return this.comentariosAbiertos().has(postId);
  }

  comentarios(postId: string) {
    return this.commentsService.commentsFor(postId);
  }

  comentarioActual(postId: string): string {
    return this.comentariosTexto().get(postId) ?? '';
  }

  actualizarComentario(postId: string, texto: string) {
    this.comentariosTexto.update(actual => {
      const nuevo = new Map(actual);
      nuevo.set(postId, texto);
      return nuevo;
    });
  }

  async enviarComentario(postId: string) {
    const texto = this.comentarioActual(postId).trim();
    if (!texto) {
      return;
    }

    try {
      await this.commentsService.addComment(postId, texto);
      this.actualizarComentario(postId, '');
    } catch (error) {
      console.error('No se pudo enviar el comentario:', error);
      alert('No se pudo enviar el comentario. Intenta nuevamente.');
    }
  }

  trackComment(_: number, comment: PostComment) {
    return comment.id;
  }
}

