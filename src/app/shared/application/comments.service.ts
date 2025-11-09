import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import {
  Firestore,
  Unsubscribe,
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { AuthService } from './auth.service';
import { PostService } from './post.service';

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService implements OnDestroy {
  private firestore: Firestore | null = null;
  private commentsCollections = new Map<string, ReturnType<typeof collection>>();
  private commentSignals = new Map<string, WritableSignal<PostComment[]>>();
  private unsubscribers = new Map<string, Unsubscribe>();

  constructor(private authService: AuthService, private postService: PostService) {
    try {
      this.firestore = getFirestore();
    } catch (error) {
      console.warn('Firestore no está disponible para CommentsService.', error);
      this.firestore = null;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers.clear();
  }

  commentsFor(postId: string) {
    let signalRef = this.commentSignals.get(postId);
    if (!signalRef) {
      signalRef = signal<PostComment[]>([]);
      this.commentSignals.set(postId, signalRef);
      this.startListener(postId);
    }
    return signalRef.asReadonly();
  }

  private startListener(postId: string) {
    if (!this.firestore) {
      return;
    }

    if (this.unsubscribers.has(postId)) {
      return;
    }

    const commentsCollection = collection(this.firestore, 'posts', postId, 'comments');
    this.commentsCollections.set(postId, commentsCollection);

    const commentsQuery = query(commentsCollection, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(commentsQuery, {
      next: (snapshot) => {
        const comments = snapshot.docs.map(docSnapshot => this.mapComment(postId, docSnapshot.id, docSnapshot.data()));
        const signalRef = this.commentSignals.get(postId);
        signalRef?.set(comments);
      },
      error: (error) => {
        console.error('Error al obtener comentarios:', error);
      }
    });

    this.unsubscribers.set(postId, unsubscribe);
  }

  private mapComment(postId: string, id: string, data: DocumentData): PostComment {
    const createdAtRaw = (data as Record<string, unknown>)['createdAt'];
    const createdAt = createdAtRaw instanceof Timestamp ? createdAtRaw.toDate() : new Date();

    return {
      id,
      postId,
      authorId: ((data as Record<string, unknown>)['authorId'] as string) ?? '',
      authorName: ((data as Record<string, unknown>)['authorName'] as string) ?? 'Usuario',
      text: ((data as Record<string, unknown>)['text'] as string) ?? '',
      createdAt
    };
  }

  async addComment(postId: string, text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const currentUser = this.authService.getCurrentUser()();
    const authorId = currentUser?.id ?? this.authService.getUserEmail();
    const authorName = currentUser?.name ?? this.authService.getUserName();

    if (!authorId) {
      throw new Error('Debes iniciar sesión para comentar.');
    }

    try {
      if (this.firestore) {
        const commentsCollection = this.ensureCollection(postId);
        await addDoc(commentsCollection, {
          text: trimmed,
          authorId,
          authorName,
          createdAt: serverTimestamp()
        });
        await this.postService.ajustarComentarios(postId, 1);
      } else {
        throw new Error('Firestore no disponible.');
      }
    } catch (error) {
      console.warn('No se pudo guardar el comentario en Firestore, guardando localmente.', error);
      const localComment: PostComment = {
        id: `${postId}-${Date.now()}`,
        postId,
        authorId,
        authorName,
        text: trimmed,
        createdAt: new Date()
      };
      const signalRef = this.commentSignals.get(postId) ?? signal<PostComment[]>([]);
      if (!this.commentSignals.has(postId)) {
        this.commentSignals.set(postId, signalRef);
      }
      signalRef.update(comments => [...comments, localComment]);
      await this.postService.ajustarComentarios(postId, 1);
    }
  }

  private ensureCollection(postId: string) {
    if (!this.firestore) {
      throw new Error('Firestore no inicializado');
    }
    let collectionRef = this.commentsCollections.get(postId);
    if (!collectionRef) {
      collectionRef = collection(this.firestore, 'posts', postId, 'comments');
      this.commentsCollections.set(postId, collectionRef);
    }
    return collectionRef;
  }
}
