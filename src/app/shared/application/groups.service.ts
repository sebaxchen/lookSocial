import { Injectable, signal, inject } from '@angular/core';
import { GroupColorsService } from './group-colors.service';

export interface Group {
  id?: string;
  name: string;
  members: { id: string; name: string }[];
  tasks: { id: string; title: string; priority: string; status?: string; createdAt: Date }[];
  createdAt?: Date;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private groups = signal<Group[]>([]);
  private groupColorsService = inject(GroupColorsService);

  constructor() {
    this.loadGroups();
  }

  private loadGroups(): void {
    // Load groups from localStorage or start empty
    const stored = localStorage.getItem('groups');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.groups.set(parsed);
      } catch (e) {
        this.groups.set([]);
      }
    } else {
      this.groups.set([]);
    }
  }

  private saveGroups(): void {
    localStorage.setItem('groups', JSON.stringify(this.groups()));
  }

  getAllGroups() {
    return this.groups.asReadonly();
  }

  addGroup(group: Group): void {
    // Asignar color automáticamente si no tiene uno
    if (!group.color) {
      group.color = this.groupColorsService.getGroupColor(group.name);
    }
    
    const newGroup = {
      ...group,
      id: this.generateId(),
      createdAt: new Date()
    };
    this.groups.update(groups => [...groups, newGroup]);
    this.saveGroups();
  }

  updateGroup(groupId: string, updates: Partial<Group>): void {
    this.groups.update(groups =>
      groups.map(g => {
        if (g.id === groupId) {
          // Merge arrays for members and tasks if they exist
          const merged: any = { ...g };
          if (updates.members) merged.members = updates.members;
          if (updates.tasks) merged.tasks = updates.tasks;
          return { ...merged, ...updates };
        }
        return g;
      })
    );
    this.saveGroups();
  }

  deleteGroup(groupId: string): void {
    this.groups.update(groups => groups.filter(g => g.id !== groupId));
    this.saveGroups();
  }

  getGroupById(groupId: string): Group | undefined {
    return this.groups().find(g => g.id === groupId);
  }

  // Método para obtener el color de un grupo
  getGroupColor(groupName: string): string {
    const group = this.groups().find(g => g.name === groupName);
    if (group && group.color) {
      return group.color;
    }
    // Si no existe el grupo o no tiene color, obtener uno del servicio
    return this.groupColorsService.getGroupColor(groupName);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
