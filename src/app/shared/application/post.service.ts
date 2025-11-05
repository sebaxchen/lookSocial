import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface Post {
  id: string;
  texto: string;
  imagenes: string[]; // URLs de las imágenes como base64 o URLs
  fecha: Date;
  ubicacion?: string;
  autorNombre: string;
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
  
  readonly posts = this.postsSignal.asReadonly();

  publicarPost(texto: string, imagenes: string[] = [], ubicacion?: string): void {
    const nuevoPost: Post = {
      id: Date.now().toString(),
      texto,
      imagenes,
      fecha: new Date(),
      ubicacion,
      autorNombre: this.authService.getUserName(),
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
}

