import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewPreferencesService {
  private readonly HOME_VISIBILITY_KEY = 'homeVisibility';
  private readonly DASHBOARD_VISIBILITY_KEY = 'dashboardVisibility';
  
  // Signal para la visibilidad del home (desactivado por defecto)
  homeVisibility = signal<boolean>(this.getHomeVisibilityFromStorage());
  
  // Signal para la visibilidad del dashboard (desactivado por defecto)
  dashboardVisibility = signal<boolean>(this.getDashboardVisibilityFromStorage());

  constructor() {
    // Cargar preferencia desde localStorage al iniciar
    this.loadFromStorage();
  }

  private getHomeVisibilityFromStorage(): boolean {
    const stored = localStorage.getItem(this.HOME_VISIBILITY_KEY);
    if (stored === null) {
      // Si no hay valor almacenado, por defecto es false (desactivado)
      return false;
    }
    return stored === 'true';
  }

  private getDashboardVisibilityFromStorage(): boolean {
    const stored = localStorage.getItem(this.DASHBOARD_VISIBILITY_KEY);
    if (stored === null) {
      // Si no hay valor almacenado, por defecto es false (desactivado)
      return false;
    }
    return stored === 'true';
  }

  private loadFromStorage(): void {
    const homeValue = this.getHomeVisibilityFromStorage();
    this.homeVisibility.set(homeValue);
    
    const dashboardValue = this.getDashboardVisibilityFromStorage();
    this.dashboardVisibility.set(dashboardValue);
  }

  setHomeVisibility(visible: boolean): void {
    this.homeVisibility.set(visible);
    localStorage.setItem(this.HOME_VISIBILITY_KEY, String(visible));
  }

  toggleHomeVisibility(): void {
    const current = this.homeVisibility();
    this.setHomeVisibility(!current);
  }

  setDashboardVisibility(visible: boolean): void {
    this.dashboardVisibility.set(visible);
    localStorage.setItem(this.DASHBOARD_VISIBILITY_KEY, String(visible));
  }

  toggleDashboardVisibility(): void {
    const current = this.dashboardVisibility();
    this.setDashboardVisibility(!current);
  }
}

