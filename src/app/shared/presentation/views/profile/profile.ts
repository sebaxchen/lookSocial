import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PostService } from '../../../application/post.service';
import { AuthService } from '../../../application/auth.service';
import { TeamService } from '../../../application/team.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private teamService = inject(TeamService);

  readonly currentUser = computed(() => this.authService.getCurrentUser()());

  readonly posts = computed(() => {
    const user = this.currentUser();
    const userId = user?.id ?? this.authService.getUserEmail();
    if (!userId) {
      return [];
    }
    return this.postService.posts().filter(post => post.autorId === userId);
  });

  getUserColor(nombre: string): string {
    return this.teamService.getMemberColor(nombre);
  }

  getUserInitials(nombre: string): string {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
}
