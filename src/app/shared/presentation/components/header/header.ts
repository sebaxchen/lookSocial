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
    { link: '/home', label: 'Inicio', icon: 'home', color: '#2563EB' }, // Azul
    { link: '/dashboard', label: 'Dashboard', icon: 'dashboard', color: '#DC2626' }, // Rojo
    { link: '/groups', label: 'Grupos', icon: 'groups', color: '#059669' }, // Verde esmeralda
    { link: '/tasks', label: 'Gestión de Tareas', icon: 'task', color: '#7C2D12' }, // Marrón
    { link: '/learning/collaborators', label: 'Colaboradores', icon: 'people', color: '#1E40AF' }, // Azul índigo
    { link: '/shared-files', label: 'Archivos', icon: 'folder', color: '#BE185D' }, // Rosa fucsia
    { link: '/calendar', label: 'Calendario', icon: 'calendar_month', color: '#0891B2' } // Azul cian
  ];

  // Filtrar opciones basado en la visibilidad del home y dashboard
  options = computed(() => {
    let filtered = this.allOptions;
    
    if (!this.viewPreferencesService.homeVisibility()) {
      filtered = filtered.filter(opt => opt.link !== '/home');
    }
    
    if (!this.viewPreferencesService.dashboardVisibility()) {
      filtered = filtered.filter(opt => opt.link !== '/dashboard');
    }
    
    return filtered;
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
