import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../application/user.service';
import { AuthService } from '../../../application/auth.service';
import { SettingsModal } from '../settings-modal/settings-modal';
import { PublicarPostModal } from '../publicar-post-modal/publicar-post-modal';
import { TeamService } from '../../../application/team.service';
import { ViewPreferencesService } from '../../../application/view-preferences.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButton,
    MatButtonModule,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    SettingsModal,
    PublicarPostModal
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Header {
  isSettingsOpen = false;
  isModalOpen = false;
  private teamService = inject(TeamService);
  viewPreferencesService = inject(ViewPreferencesService);

  allOptions = [
    { link: '/amigos', label: 'Amigos', icon: 'people', color: '#2563EB' }, // Azul
    { link: '/post', label: 'Post', icon: 'article', color: '#DC2626' }, // Rojo
    { link: '/etiquetas', label: 'Etiquetas', icon: 'label', color: '#059669' } // Verde esmeralda
  ];

  // Las opciones ahora son fijas
  options = computed(() => {
    return this.allOptions;
  });

  constructor(
    public userService: UserService,
    public authService: AuthService
  ) {}

  openSettings() {
    this.isSettingsOpen = true;
  }

  logout() {
    this.authService.logout();
  }

  // Método para obtener el color del usuario
  getUserColor(): string {
    const userName = this.authService.getUserName();
    return this.teamService.getMemberColor(userName);
  }

  publicarPost() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onPostPublished() {
    this.closeModal();
  }
}
