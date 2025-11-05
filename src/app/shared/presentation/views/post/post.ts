import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PublicarPostModal } from '../../components/publicar-post-modal/publicar-post-modal';
import { PostService } from '../../../application/post.service';
import { AuthService } from '../../../application/auth.service';
import { TeamService } from '../../../application/team.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PublicarPostModal
  ],
  templateUrl: './post.html',
  styleUrl: './post.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class PostComponent {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private teamService = inject(TeamService);
  
  isModalOpen = false;
  posts = this.postService.posts;

  getUserInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getUserColor(nombre: string): string {
    return this.teamService.getMemberColor(nombre);
  }

  getHandle(nombre: string): string {
    return nombre.toLowerCase().replace(/\s+/g, '');
  }

  publicarPost() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onPostPublished() {
    // El post ya fue publicado por el servicio, solo cerramos el modal
    this.closeModal();
  }

  eliminarPost(postId: string) {
    this.postService.eliminarPost(postId);
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
    // TODO: Implementar funcionalidad de comentarios
    console.log('Comentar en post:', postId);
  }

  toggleRetweet(postId: string) {
    this.postService.incrementarRetweet(postId);
  }
}

