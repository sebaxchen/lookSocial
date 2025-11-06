import { Injectable, signal, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';

export interface Post {
  id: string;
  texto: string;
  imagenes: string[]; // URLs de las imágenes como base64 o URLs
  fecha: Date;
  ubicacion?: string;
  autorNombre: string;
  etiquetas?: string[]; // Array de etiquetas (hashtags)
  comentarios?: number;
  retweets?: number;
  likes?: number;
  views?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private authService = inject(AuthService);
  private postsSignal = signal<Post[]>([]);
  private etiquetaFiltroSignal = signal<string | null>(null);
  
  readonly posts = this.postsSignal.asReadonly();
  readonly etiquetaFiltro = this.etiquetaFiltroSignal.asReadonly();
  
  // Posts filtrados por etiqueta
  readonly postsFiltrados = computed(() => {
    const posts = this.postsSignal();
    const etiquetaFiltro = this.etiquetaFiltroSignal();
    
    if (!etiquetaFiltro) {
      return posts;
    }
    
    return posts.filter(post => 
      post.etiquetas && 
      post.etiquetas.some(etiqueta => 
        etiqueta.toLowerCase() === etiquetaFiltro.toLowerCase()
      )
    );
  });

  publicarPost(texto: string, imagenes: string[] = [], ubicacion?: string, etiquetas: string[] = []): void {
    const nuevoPost: Post = {
      id: Date.now().toString(),
      texto,
      imagenes,
      fecha: new Date(),
      ubicacion,
      autorNombre: this.authService.getUserName(),
      etiquetas: etiquetas.length > 0 ? etiquetas : undefined,
      comentarios: 0,
      retweets: 0,
      likes: 0,
      views: 0
    };

    this.postsSignal.update(posts => [nuevoPost, ...posts]);
  }

  eliminarPost(postId: string): void {
    this.postsSignal.update(posts => posts.filter(post => post.id !== postId));
  }

  incrementarLike(postId: string): void {
    this.postsSignal.update(posts => 
      posts.map(post => 
        post.id === postId 
          ? { ...post, likes: (post.likes || 0) + 1 }
          : post
      )
    );
  }

  decrementarLike(postId: string): void {
    this.postsSignal.update(posts => 
      posts.map(post => 
        post.id === postId && post.likes && post.likes > 0
          ? { ...post, likes: post.likes - 1 }
          : post
      )
    );
  }

  incrementarRetweet(postId: string): void {
    this.postsSignal.update(posts => 
      posts.map(post => 
        post.id === postId 
          ? { ...post, retweets: (post.retweets || 0) + 1 }
          : post
      )
    );
  }

  obtenerTodasLasEtiquetas(): { nombre: string; count: number }[] {
    const posts = this.postsSignal();
    const etiquetasMap = new Map<string, number>();

    // Recorrer todos los posts y contar etiquetas
    posts.forEach(post => {
      if (post.etiquetas && post.etiquetas.length > 0) {
        post.etiquetas.forEach(etiqueta => {
          const etiquetaLower = etiqueta.toLowerCase();
          const count = etiquetasMap.get(etiquetaLower) || 0;
          etiquetasMap.set(etiquetaLower, count + 1);
        });
      }
    });

    // Convertir a array y ordenar por cantidad (mayor a menor)
    return Array.from(etiquetasMap.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count);
  }

  filtrarPorEtiqueta(etiqueta: string | null): void {
    this.etiquetaFiltroSignal.set(etiqueta);
  }

  limpiarFiltro(): void {
    this.etiquetaFiltroSignal.set(null);
  }
}

