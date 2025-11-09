import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../domain/entities/user.entity';
import { TeamService } from '../../../team/application/services/team.service';
import {
  Auth,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  Firestore,
  doc as firestoreDoc,
  getFirestore,
  serverTimestamp as firestoreServerTimestamp,
  setDoc as firestoreSetDoc
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);
  private teamService = inject(TeamService);
  private auth: Auth;
  private authStateResolved = false;
  private authStateResolver!: () => void;
  private authStateReady: Promise<void>;
  private firestore: Firestore | null = null;

  constructor(private router: Router) {
    this.auth = getAuth();
    this.authStateReady = new Promise<void>((resolve) => {
      this.authStateResolver = resolve;
    });

    try {
      this.firestore = getFirestore();
    } catch (error) {
      console.warn('No se pudo inicializar Firestore en AuthService:', error);
      this.firestore = null;
    }

    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = this.mapFirebaseUser(firebaseUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.addUserToTeamIfNeeded(user);
        void this.syncUserDocument(firebaseUser, user).catch(error => {
          console.warn('No se pudo sincronizar el usuario con Firestore:', error);
        });
      } else {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      }

      if (!this.authStateResolved) {
        this.authStateResolved = true;
        this.authStateResolver();
      }
    });
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  async ensureAuthStateResolved(): Promise<void> {
    return this.authStateReady;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = this.mapFirebaseUser(credential.user);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.addUserToTeamIfNeeded(user);
      try {
        await this.syncUserDocument(credential.user, user);
      } catch (error) {
        console.warn('No se pudo actualizar el perfil del usuario en Firestore:', error);
      }
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  async register(name: string, email: string, password: string): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);

      if (name) {
        await updateProfile(credential.user, { displayName: name });
      }

      const user = this.mapFirebaseUser(credential.user);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.addUserToTeamIfNeeded(user);
      try {
        await this.syncUserDocument(credential.user, user);
      } catch (error) {
        console.warn('No se pudo guardar el nuevo usuario en Firestore:', error);
      }
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  getUserName(): string {
    return this.currentUser()?.name || 'Usuario';
  }

  getUserEmail(): string {
    return this.currentUser()?.email || '';
  }

  getUserRole(): string {
    return this.currentUser()?.role || 'Usuario';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private addUserToTeamIfNeeded(user: User) {
    const membersSignal = this.teamService.allMembers;
    const existingMembers = membersSignal();
    const userExists = existingMembers.some(member => member.name === user.name);
    
    if (!userExists) {
      const teamMember = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: '',
        joinDate: new Date()
      };
      
      this.teamService.addMember(teamMember).catch(err => {
        console.error('Error adding user to team:', err);
      });
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    const displayName = firebaseUser.displayName?.trim() || firebaseUser.email?.split('@')[0] || 'Usuario';

    return {
      id: firebaseUser.uid,
      name: displayName,
      email: firebaseUser.email ?? '',
      role: 'Usuario'
    };
  }

  private async syncUserDocument(firebaseUser: FirebaseUser, user: User): Promise<void> {
    if (!this.firestore) {
      return;
    }

    try {
      const userRef = firestoreDoc(this.firestore, 'users', firebaseUser.uid);
      await firestoreSetDoc(userRef, {
        uid: firebaseUser.uid,
        name: user.name,
        email: user.email,
        photoURL: firebaseUser.photoURL ?? null,
        updatedAt: firestoreServerTimestamp(),
        createdAt: firebaseUser.metadata?.creationTime
          ? new Date(firebaseUser.metadata.creationTime)
          : firestoreServerTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn('Error guardando usuario en Firestore', error);
      throw error;
    }
  }

  private getAuthErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = String((error as { code: string }).code);
      switch (code) {
        case 'auth/invalid-email':
          return 'El correo electrónico no es válido.';
        case 'auth/user-disabled':
          return 'Esta cuenta está deshabilitada.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return 'Correo o contraseña incorrectos.';
        case 'auth/email-already-in-use':
          return 'Este correo ya está registrado.';
        case 'auth/weak-password':
          return 'La contraseña debe tener al menos 6 caracteres.';
        default:
          return 'Ocurrió un error inesperado. Intenta nuevamente.';
      }
    }

    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }
}

