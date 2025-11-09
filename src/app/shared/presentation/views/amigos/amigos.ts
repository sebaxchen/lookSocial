import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FriendsService, RegisteredUser } from '../../../application/friends.service';
import { AuthService } from '../../../application/auth.service';

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './amigos.html',
  styleUrl: './amigos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmigosComponent {
  private friendsService = inject(FriendsService);
  private authService = inject(AuthService);

  private sendingRequests = signal<Set<string>>(new Set());
  private processingRequests = signal<Map<string, 'accept' | 'reject'>>(new Map());

  readonly usuarios = computed(() => {
    const currentUserId = this.authService.getCurrentUser()()?.id ?? null;
    return this.friendsService.users().filter(user => user.id !== currentUserId);
  });

  readonly realtimeDisponible = this.friendsService.isRealtimeAvailable;

  estadoSolicitud(usuarioId: string) {
    return this.friendsService.friendStatusForUser(usuarioId);
  }

  estaEnviando(usuarioId: string): boolean {
    return this.sendingRequests().has(usuarioId);
  }

  estadoProcesando(usuarioId: string): 'accept' | 'reject' | null {
    return this.processingRequests().get(usuarioId) ?? null;
  }

  async enviarSolicitud(usuario: RegisteredUser) {
    if (this.estaEnviando(usuario.id)) {
      return;
    }

    this.sendingRequests.update(actual => {
      const nuevo = new Set(actual);
      nuevo.add(usuario.id);
      return nuevo;
    });

    try {
      await this.friendsService.sendFriendRequest(usuario.id);
    } catch (error) {
      console.error('No se pudo enviar la solicitud:', error);
      alert('No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      this.sendingRequests.update(actual => {
        const nuevo = new Set(actual);
        nuevo.delete(usuario.id);
        return nuevo;
      });
    }
  }

  async aceptarSolicitud(usuario: RegisteredUser) {
    if (this.estadoProcesando(usuario.id)) {
      return;
    }

    this.processingRequests.update(actual => {
      const nuevo = new Map(actual);
      nuevo.set(usuario.id, 'accept');
      return nuevo;
    });

    try {
      await this.friendsService.acceptFriendRequest(usuario.id);
    } catch (error) {
      console.error('No se pudo aceptar la solicitud:', error);
      alert('No se pudo aceptar la solicitud. Intenta nuevamente.');
    } finally {
      this.processingRequests.update(actual => {
        const nuevo = new Map(actual);
        nuevo.delete(usuario.id);
        return nuevo;
      });
    }
  }

  async rechazarSolicitud(usuario: RegisteredUser) {
    if (this.estadoProcesando(usuario.id)) {
      return;
    }

    this.processingRequests.update(actual => {
      const nuevo = new Map(actual);
      nuevo.set(usuario.id, 'reject');
      return nuevo;
    });

    try {
      await this.friendsService.rejectFriendRequest(usuario.id);
    } catch (error) {
      console.error('No se pudo rechazar la solicitud:', error);
      alert('No se pudo rechazar la solicitud. Intenta nuevamente.');
    } finally {
      this.processingRequests.update(actual => {
        const nuevo = new Map(actual);
        nuevo.delete(usuario.id);
        return nuevo;
      });
    }
  }
}

