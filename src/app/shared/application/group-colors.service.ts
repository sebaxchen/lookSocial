import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupColorsService {
  // Paleta de 40 colores distintos para grupos
  private readonly colorPalette = [
    '#10b981', // Verde esmeralda
    '#8b5cf6', // Púrpura violeta
    '#f59e0b', // Naranja ámbar
    '#06b6d4', // Cian
    '#ec4899', // Rosa
    '#eab308', // Amarillo
    '#ef4444', // Rojo
    '#84cc16', // Verde lima
    '#f97316', // Naranja
    '#6366f1', // Índigo
    '#14b8a6', // Turquesa
    '#a855f7', // Púrpura
    '#f43f5e', // Rosa rojo
    '#22c55e', // Verde
    '#3b82f6', // Azul
    '#d946ef', // Fucsia
    '#0ea5e9', // Azul cielo
    '#64748b', // Gris azulado
    '#fbbf24', // Amarillo dorado
    '#fb7185', // Rosa salmón
    '#34d399', // Verde menta
    '#a78bfa', // Lavanda
    '#60a5fa', // Azul claro
    '#f472b6', // Rosa chicle
    '#818cf8', // Índigo claro
    '#38bdf8', // Cian claro
    '#fb923c', // Naranja claro
    '#c084fc', // Púrpura claro
    '#2dd4bf', // Turquesa claro
    '#9333ea', // Púrpura oscuro
    '#dc2626', // Rojo oscuro
    '#16a34a', // Verde oscuro
    '#0284c7', // Azul oscuro
    '#c2410c', // Naranja oscuro
    '#7c2d12', // Marrón
    '#1e40af', // Azul marino
    '#581c87', // Púrpura oscuro
    '#991b1b', // Rojo vino
    '#0891b2', // Cian oscuro
    '#be185d', // Rosa oscuro
    '#155e75'  // Cian muy oscuro
  ];

  // Cache para mantener colores asignados por nombre de grupo
  private assignedColors = new Map<string, string>();

  /**
   * Obtiene un color único para un grupo basado en su nombre
   * Si ya tiene un color asignado, lo devuelve; si no, asigna uno nuevo
   */
  getGroupColor(groupName: string): string {
    if (this.assignedColors.has(groupName)) {
      return this.assignedColors.get(groupName)!;
    }

    // Asignar un color basado en el hash del nombre
    const hash = this.hashString(groupName);
    const colorIndex = hash % this.colorPalette.length;
    const color = this.colorPalette[colorIndex];

    this.assignedColors.set(groupName, color);
    return color;
  }

  /**
   * Obtiene el color de un grupo sin asignar uno nuevo si no existe
   */
  getExistingGroupColor(groupName: string): string | null {
    return this.assignedColors.get(groupName) || null;
  }

  /**
   * Asigna un color específico a un grupo
   */
  setGroupColor(groupName: string, color: string): void {
    this.assignedColors.set(groupName, color);
  }

  /**
   * Obtiene todos los colores asignados
   */
  getAllAssignedColors(): Map<string, string> {
    return new Map(this.assignedColors);
  }

  /**
   * Limpia los colores asignados
   */
  clearAssignedColors(): void {
    this.assignedColors.clear();
  }

  /**
   * Genera un hash simple de una cadena
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash);
  }

  /**
   * Obtiene la paleta completa de colores disponibles
   */
  getColorPalette(): string[] {
    return [...this.colorPalette];
  }
}
