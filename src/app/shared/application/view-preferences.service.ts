import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewPreferencesService {
  private readonly HOME_VISIBILITY_KEY = 'homeVisibility';
  
  // Signal para la visibilidad del home (desactivado por defecto)
  homeVisibility = signal<boolean>(this.getHomeVisibilityFromStorage());

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

  private loadFromStorage(): void {
    const value = this.getHomeVisibilityFromStorage();
    this.homeVisibility.set(value);
  }

  setHomeVisibility(visible: boolean): void {
    this.homeVisibility.set(visible);
    localStorage.setItem(this.HOME_VISIBILITY_KEY, String(visible));
  }

  toggleHomeVisibility(): void {
    const current = this.homeVisibility();
    this.setHomeVisibility(!current);
  }
}

