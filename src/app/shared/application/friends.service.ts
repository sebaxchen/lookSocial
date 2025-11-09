import { Injectable, OnDestroy, effect, signal } from '@angular/core';
import {
  Firestore,
  Unsubscribe,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { AuthService } from './auth.service';

export type FriendRelationshipStatus = 'none' | 'pending' | 'incoming' | 'friends';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string | null;
  createdAt?: Date;
}

interface FriendRequestSnapshot {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  requesterId: string;
  participants: string[];
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService implements OnDestroy {
  private firestore: Firestore | null = null;
  private usersCollection: ReturnType<typeof collection> | null = null;
  private requestsCollection: ReturnType<typeof collection> | null = null;
  private usersUnsubscribe: Unsubscribe | null = null;
  private requestsUnsubscribe: Unsubscribe | null = null;

  private usersSignal = signal<RegisteredUser[]>([]);
  private friendshipsSignal = signal<Map<string, FriendRequestSnapshot>>(new Map());
  private firestoreAvailable = signal(false);

  private currentUserId: string | null = null;

  readonly users = this.usersSignal.asReadonly();
  readonly isRealtimeAvailable = this.firestoreAvailable.asReadonly();

  constructor(private authService: AuthService) {
    this.initializeFirestore();
    this.setupAuthListener();
    this.listenToUsers();
  }

  ngOnDestroy(): void {
    if (this.usersUnsubscribe) {
      this.usersUnsubscribe();
      this.usersUnsubscribe = null;
    }
    this.stopRequestsListener();
  }

  private initializeFirestore() {
    try {
      this.firestore = getFirestore();
      this.usersCollection = collection(this.firestore, 'users');
      this.requestsCollection = collection(this.firestore, 'friendRequests');
      this.firestoreAvailable.set(true);
    } catch (error) {
      console.warn('Firestore no está disponible para FriendsService.', error);
      this.firestoreAvailable.set(false);
      this.firestore = null;
      this.usersCollection = null;
      this.requestsCollection = null;
    }
  }

  private setupAuthListener() {
    effect(() => {
      const currentUser = this.authService.getCurrentUser()();
      const newUserId = currentUser?.id ?? null;

      if (newUserId !== this.currentUserId) {
        this.currentUserId = newUserId;
        this.restartRequestsListener();
      }
    }, { allowSignalWrites: true });
  }

  private listenToUsers() {
    if (!this.usersCollection) {
      return;
    }

    const usersQuery = query(this.usersCollection, orderBy('name', 'asc'));
    this.usersUnsubscribe = onSnapshot(usersQuery, {
      next: (snapshot) => {
        const users: RegisteredUser[] = snapshot.docs.map(docSnapshot => this.mapUser(docSnapshot.id, docSnapshot.data()));
        this.usersSignal.set(users);
        if (!this.firestoreAvailable()) {
          this.firestoreAvailable.set(true);
        }
      },
      error: (error) => {
        console.error('Error al obtener usuarios registrados:', error);
        this.firestoreAvailable.set(false);
      }
    });
  }

  private restartRequestsListener() {
    this.stopRequestsListener();
    if (!this.currentUserId || !this.requestsCollection) {
      this.friendshipsSignal.set(new Map());
      return;
    }

    const requestsQuery = query(this.requestsCollection, where('participants', 'array-contains', this.currentUserId));
    this.requestsUnsubscribe = onSnapshot(requestsQuery, {
      next: (snapshot) => {
        const map = new Map<string, FriendRequestSnapshot>();
        snapshot.forEach(docSnapshot => {
          const data = docSnapshot.data();
          const record = this.mapFriendRequest(docSnapshot.id, data);
          map.set(docSnapshot.id, record);
        });
        this.friendshipsSignal.set(map);
        if (!this.firestoreAvailable()) {
          this.firestoreAvailable.set(true);
        }
      },
      error: (error) => {
        console.error('Error al obtener solicitudes de amistad:', error);
        this.firestoreAvailable.set(false);
      }
    });
  }

  private stopRequestsListener() {
    if (this.requestsUnsubscribe) {
      this.requestsUnsubscribe();
      this.requestsUnsubscribe = null;
    }
  }

  private mapUser(id: string, data: DocumentData): RegisteredUser {
    const createdAtRaw = (data as Record<string, unknown>)['createdAt'];
    const createdAt = createdAtRaw instanceof Timestamp ? createdAtRaw.toDate() : undefined;

    return {
      id,
      name: ((data as Record<string, unknown>)['name'] as string) ?? 'Usuario',
      email: ((data as Record<string, unknown>)['email'] as string) ?? '',
      photoURL: ((data as Record<string, unknown>)['photoURL'] as string | null) ?? null,
      createdAt
    };
  }

  private mapFriendRequest(id: string, data: DocumentData): FriendRequestSnapshot {
    const updatedAtRaw = (data as Record<string, unknown>)['updatedAt'];
    const updatedAt = updatedAtRaw instanceof Timestamp ? updatedAtRaw.toDate() : undefined;

    return {
      id,
      status: ((data as Record<string, unknown>)['status'] as 'pending' | 'accepted' | 'rejected') ?? 'pending',
      requesterId: ((data as Record<string, unknown>)['requesterId'] as string) ?? '',
      participants: Array.isArray((data as Record<string, unknown>)['participants'])
        ? ((data as Record<string, unknown>)['participants'] as string[])
        : [],
      updatedAt
    };
  }

  private getPairId(userA: string, userB: string): string {
    return [userA, userB].sort().join('_');
  }

  friendStatusForUser(targetUserId: string): { status: FriendRelationshipStatus; requesterId?: string; requestId?: string } {
    if (!this.currentUserId) {
      return { status: 'none' };
    }

    const map = this.friendshipsSignal();
    const pairId = this.getPairId(this.currentUserId, targetUserId);
    const request = map.get(pairId);

    if (!request) {
      return { status: 'none' };
    }

    if (request.status === 'accepted') {
      return { status: 'friends', requesterId: request.requesterId, requestId: request.id };
    }

    if (request.status === 'pending') {
      if (request.requesterId === this.currentUserId) {
        return { status: 'pending', requesterId: request.requesterId, requestId: request.id };
      }
      return { status: 'incoming', requesterId: request.requesterId, requestId: request.id };
    }

    return { status: 'none' };
  }

  async sendFriendRequest(targetUserId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('Debes iniciar sesión para enviar solicitudes.');
    }

    if (!this.requestsCollection || !this.firestoreAvailable()) {
      throw new Error('La función de amigos no está disponible actualmente.');
    }

    if (this.currentUserId === targetUserId) {
      return;
    }

    const currentStatus = this.friendStatusForUser(targetUserId);
    if (currentStatus.status === 'pending' || currentStatus.status === 'friends') {
      return;
    }

    const pairId = this.getPairId(this.currentUserId, targetUserId);
    const requestRef = doc(this.requestsCollection, pairId);

    await setDoc(requestRef, {
      participants: [this.currentUserId, targetUserId],
      requesterId: this.currentUserId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  async acceptFriendRequest(targetUserId: string): Promise<void> {
    await this.updateRequestStatus(targetUserId, 'accepted');
  }

  async rejectFriendRequest(targetUserId: string): Promise<void> {
    await this.updateRequestStatus(targetUserId, 'rejected');
  }

  private async updateRequestStatus(targetUserId: string, status: 'accepted' | 'rejected'): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('Debes iniciar sesión para gestionar solicitudes.');
    }

    if (!this.requestsCollection || !this.firestoreAvailable()) {
      throw new Error('La función de amigos no está disponible actualmente.');
    }

    const pairId = this.getPairId(this.currentUserId, targetUserId);
    const map = this.friendshipsSignal();
    const request = map.get(pairId);

    if (!request || request.status !== 'pending') {
      return;
    }

    if (status === 'accepted' && request.requesterId === this.currentUserId) {
      return;
    }

    const requestRef = doc(this.requestsCollection, pairId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
}
