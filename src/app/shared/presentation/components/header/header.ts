import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../application/user.service';
import { AuthService } from '../../../application/auth.service';
import { SettingsModal } from '../settings-modal/settings-modal';
import { TeamService } from '../../../application/team.service';
import { SessionTimerService } from '../../../application/session-timer.service';
import { BreakModalComponent } from '../break-modal/break-modal.component';
import { ViewPreferencesService } from '../../../application/view-preferences.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatToolbarRow,
    MatButton,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    SettingsModal,
    BreakModalComponent
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  isMenuOpen = false;
  isSettingsOpen = false;
  private teamService = inject(TeamService);
  private sessionTimerService = inject(SessionTimerService);
  viewPreferencesService = inject(ViewPreferencesService);

  allOptions = [
    { link: '/home', label: 'Inicio', icon: 'home', color: '#047857' },
    { link: '/dashboard', label: 'Dashboard', icon: 'dashboard', color: '#7c3aed' },
    { link: '/groups', label: 'Grupos', icon: 'groups', color: '#d97706' },
    { link: '/about', label: 'Gestión de Tareas', icon: 'task', color: '#0891b2' },
    { link: '/learning/categories', label: 'Colaboradores', icon: 'people', color: '#be185d' },
    { link: '/shared-files', label: 'Archivos', icon: 'folder', color: '#ca8a04' },
    { link: '/calendar', label: 'Calendario', icon: 'calendar_month', color: '#2563eb' }
  ];

  // Filtrar opciones basado en la visibilidad del home
  options = computed(() => {
    if (this.viewPreferencesService.homeVisibility()) {
      return this.allOptions;
    }
    return this.allOptions.filter(opt => opt.link !== '/home');
  });

  constructor(
    public userService: UserService,
    public authService: AuthService
  ) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

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

  // Session Timer Methods
  getFormattedTime(): string {
    return this.sessionTimerService.formatTime(this.sessionTimerService.sessionState().elapsedTime);
  }

  getTimerColor(): string {
    return this.sessionTimerService.getTimerColor(this.sessionTimerService.sessionState().status);
  }
}
