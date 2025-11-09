import { Injectable, signal, inject, computed, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  getFirestore,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  updateDoc
} from 'firebase/firestore';

export interface Post {
  id: string;
  texto: string;
  imagenes: string[]; // URLs de las imágenes como base64 o URLs
  fecha: Date;
  ubicacion?: string;
  autorNombre: string;
  autorId: string;
  etiquetas?: string[]; // Array de etiquetas (hashtags)
  comentarios?: number;
  retweets?: number;
  likes?: number;
  views?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostService implements OnDestroy {
  private authService = inject(AuthService);
  private postsSignal = signal<Post[]>([]);
  private etiquetaFiltroSignal = signal<string | null>(null);
  private firestore: Firestore | null = null;
  private postsCollection: ReturnType<typeof collection> | null = null;
  private unsubscribePostsListener: Unsubscribe | null = null;
  private firestoreDisponible = signal(false);
  
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

  constructor() {
    this.inicializarFirestore();
  }

  private inicializarFirestore() {
    try {
      this.firestore = getFirestore();
      this.postsCollection = collection(this.firestore, 'posts');
      this.listenToPosts();
      this.firestoreDisponible.set(true);
    } catch (error) {
      console.warn('Firestore no está disponible. Se utilizará almacenamiento local temporal.', error);
      this.firestoreDisponible.set(false);
      this.firestore = null;
      this.postsCollection = null;
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribePostsListener) {
      this.unsubscribePostsListener();
      this.unsubscribePostsListener = null;
    }
  }

  private listenToPosts() {
    if (!this.postsCollection) {
      return;
    }

    const postsQuery = query(this.postsCollection, orderBy('createdAt', 'desc'));
    this.unsubscribePostsListener = onSnapshot(postsQuery, {
      next: (snapshot) => {
        const posts: Post[] = snapshot.docs.map(docSnapshot => this.mapPost(docSnapshot.id, docSnapshot.data()));
        this.postsSignal.set(posts);
        if (!this.firestoreDisponible()) {
          this.firestoreDisponible.set(true);
        }
      },
      error: (error) => {
        console.error('Error al obtener posts:', error);
        this.firestoreDisponible.set(false);
        if (this.unsubscribePostsListener) {
          this.unsubscribePostsListener();
          this.unsubscribePostsListener = null;
        }
      }
    });
  }

  private mapPost(id: string, data: DocumentData): Post {
    const createdAtRaw = (data as { [key: string]: unknown })['createdAt'];
    const createdAt = createdAtRaw instanceof Timestamp ? createdAtRaw.toDate() : new Date();
    return {
      id,
      texto: (data as { [key: string]: unknown })['texto'] as string ?? '',
      imagenes: Array.isArray((data as { [key: string]: unknown })['imagenes'])
        ? (data as { [key: string]: unknown })['imagenes'] as string[]
        : [],
      fecha: createdAt,
      ubicacion: (data as { [key: string]: unknown })['ubicacion'] as string | undefined,
      autorNombre: (data as { [key: string]: unknown })['autorNombre'] as string ?? 'Usuario',
      autorId: (data as { [key: string]: unknown })['autorId'] as string ?? '',
      etiquetas: Array.isArray((data as { [key: string]: unknown })['etiquetas'])
        ? (data as { [key: string]: unknown })['etiquetas'] as string[]
        : undefined,
      comentarios: (data as { [key: string]: unknown })['comentarios'] as number ?? 0,
      retweets: (data as { [key: string]: unknown })['retweets'] as number ?? 0,
      likes: (data as { [key: string]: unknown })['likes'] as number ?? 0,
      views: (data as { [key: string]: unknown })['views'] as number ?? 0
    };
  }

  async publicarPost(texto: string, imagenes: string[] = [], ubicacion?: string, etiquetas: string[] = []): Promise<void> {
    const autorNombre = this.authService.getUserName();
    const currentUserSignal = this.authService.getCurrentUser();
    const currentUser = currentUserSignal();
    const autorId = currentUser?.id ?? this.authService.getUserEmail();

    const etiquetasNormalizadas = etiquetas
      .map(etiqueta => etiqueta.trim())
      .filter(Boolean)
      .map(etiqueta => etiqueta.startsWith('#') ? etiqueta : `#${etiqueta}`)
      .map(etiqueta => etiqueta.toLowerCase());
    const etiquetasUnicas = Array.from(new Set(etiquetasNormalizadas));

    try {
      if (this.postsCollection && this.firestoreDisponible()) {
        await addDoc(this.postsCollection, {
          texto,
          imagenes,
          createdAt: serverTimestamp(),
          ubicacion: ubicacion || null,
          autorNombre,
          autorId,
          etiquetas: etiquetasUnicas.length > 0 ? etiquetasUnicas : [],
          comentarios: 0,
          retweets: 0,
          likes: 0,
          views: 0
        });
      } else {
        throw new Error('Firestore no disponible');
      }
    } catch (error) {
      console.warn('Fallo al publicar en Firestore, guardando localmente.', error);
      const nuevoPost: Post = {
        id: Date.now().toString(),
        texto,
        imagenes,
        fecha: new Date(),
        ubicacion,
        autorNombre,
        autorId,
        etiquetas: etiquetasUnicas.length > 0 ? etiquetasUnicas : [],
        comentarios: 0,
        retweets: 0,
        likes: 0,
        views: 0
      };
      this.postsSignal.update(posts => [nuevoPost, ...posts]);
      this.firestoreDisponible.set(false);
      return;
    }
  }

  async eliminarPost(postId: string): Promise<void> {
    try {
      if (this.postsCollection && this.firestoreDisponible()) {
        const postRef = doc(this.postsCollection, postId);
        await deleteDoc(postRef);
      } else {
        this.postsSignal.update(posts => posts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error al eliminar post:', error);
      throw error;
    }
  }

  async incrementarLike(postId: string): Promise<void> {
    try {
      if (this.postsCollection && this.firestoreDisponible()) {
        const postRef = doc(this.postsCollection, postId);
        await updateDoc(postRef, { likes: increment(1) });
      } else {
        this.postsSignal.update(posts =>
          posts.map(post =>
            post.id === postId
              ? { ...post, likes: (post.likes ?? 0) + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error al incrementar like:', error);
    }
  }

  async decrementarLike(postId: string): Promise<void> {
    try {
      const postActual = this.postsSignal().find(post => post.id === postId);
      if (!postActual || (postActual.likes ?? 0) <= 0) {
        return;
      }
      if (this.postsCollection && this.firestoreDisponible()) {
        const postRef = doc(this.postsCollection, postId);
        await updateDoc(postRef, { likes: increment(-1) });
      } else {
        this.postsSignal.update(posts =>
          posts.map(post =>
            post.id === postId
              ? { ...post, likes: Math.max((post.likes ?? 0) - 1, 0) }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error al decrementar like:', error);
    }
  }

  async incrementarRetweet(postId: string): Promise<void> {
    try {
      if (this.postsCollection && this.firestoreDisponible()) {
        const postRef = doc(this.postsCollection, postId);
        await updateDoc(postRef, { retweets: increment(1) });
      } else {
        this.postsSignal.update(posts =>
          posts.map(post =>
            post.id === postId
              ? { ...post, retweets: (post.retweets ?? 0) + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error al incrementar retweet:', error);
    }
  }

  async ajustarComentarios(postId: string, delta: number): Promise<void> {
    if (delta === 0) {
      return;
    }

    try {
      if (this.postsCollection && this.firestoreDisponible()) {
        const postRef = doc(this.postsCollection, postId);
        await updateDoc(postRef, { comentarios: increment(delta) });
      } else {
        this.postsSignal.update(posts =>
          posts.map(post =>
            post.id === postId
              ? { ...post, comentarios: Math.max((post.comentarios ?? 0) + delta, 0) }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error al ajustar el contador de comentarios:', error);
    }
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

