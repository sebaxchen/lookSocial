import { Injectable, signal, inject } from '@angular/core';
import { Group } from '../../domain/entities/group.entity';
import { GroupColorsService } from '../../../shared/infrastructure/services/group-colors.service';

@Injectable({
  providedIn: 'root'
})
export class GroupRepository {
  private groupColorsService = inject(GroupColorsService);
  private groups = signal<Group[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  getAllGroups() {
    return this.groups.asReadonly();
  }

  addGroup(group: Group): void {
    if (!group.color) {
      group.color = this.groupColorsService.getGroupColor(group.name);
    }
    
    const newGroup = {
      ...group,
      id: this.generateId(),
      createdAt: new Date()
    };
    this.groups.update(groups => {
      const updated = [...groups, newGroup];
      this.saveToStorage(updated);
      return updated;
    });
  }

  updateGroup(groupId: string, updates: Partial<Group>): void {
    this.groups.update(groups => {
      const updated = groups.map(g => {
        if (g.id === groupId) {
          const merged: any = { ...g };
          if (updates.members) merged.members = updates.members;
          if (updates.tasks) merged.tasks = updates.tasks;
          return { ...merged, ...updates };
        }
        return g;
      });
      this.saveToStorage(updated);
      return updated;
    });
  }

  deleteGroup(groupId: string): void {
    this.groups.update(groups => {
      const filtered = groups.filter(g => g.id !== groupId);
      this.saveToStorage(filtered);
      return filtered;
    });
  }

  getGroupById(groupId: string): Group | undefined {
    return this.groups().find(g => g.id === groupId);
  }

  getGroupColor(groupName: string): string {
    const group = this.groups().find(g => g.name === groupName);
    if (group && group.color) {
      return group.color;
    }
    return this.groupColorsService.getGroupColor(groupName);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('groups');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.groups.set(parsed);
      } catch (e) {
        this.groups.set([]);
      }
    }
  }

  private saveToStorage(groups: Group[]): void {
    localStorage.setItem('groups', JSON.stringify(groups));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

