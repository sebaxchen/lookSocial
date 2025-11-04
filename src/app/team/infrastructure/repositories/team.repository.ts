import { Injectable, signal, inject } from '@angular/core';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { ITeamRepository } from '../../domain/repositories/team.repository.interface';
import { MemberColorsService } from '../../../shared/infrastructure/services/member-colors.service';

@Injectable({
  providedIn: 'root'
})
export class TeamRepository implements ITeamRepository {
  private memberColorsService = inject(MemberColorsService);
  private teamMembers = signal<TeamMember[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  async findAll(): Promise<TeamMember[]> {
    return Promise.resolve(this.teamMembers());
  }

  async findById(id: string): Promise<TeamMember | null> {
    const member = this.teamMembers().find(m => m.id === id);
    return Promise.resolve(member || null);
  }

  async findByName(name: string): Promise<TeamMember | null> {
    const member = this.teamMembers().find(m => m.name === name);
    return Promise.resolve(member || null);
  }

  async create(member: TeamMember): Promise<TeamMember> {
    if (!member.color) {
      member.color = this.memberColorsService.getMemberColor(member.name);
    }
    
    this.teamMembers.update(members => {
      const newMembers = [...members, member];
      this.saveToStorage(newMembers);
      return newMembers;
    });
    
    return Promise.resolve(member);
  }

  async update(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    let updatedMember: TeamMember | null = null;
    
    this.teamMembers.update(members => {
      const updated = members.map(member =>
        member.id === id ? { ...member, ...updates } : member
      );
      
      updatedMember = updated.find(m => m.id === id) || null;
      this.saveToStorage(updated);
      return updated;
    });

    if (!updatedMember) {
      throw new Error(`Team member with id ${id} not found`);
    }
    
    return Promise.resolve(updatedMember);
  }

  async delete(id: string): Promise<void> {
    this.teamMembers.update(members => {
      const filtered = members.filter(member => member.id !== id);
      this.saveToStorage(filtered);
      return filtered;
    });
  }

  // Additional methods for compatibility
  getMembersSignal() {
    return this.teamMembers.asReadonly();
  }

  getMemberColor(memberName: string): string {
    const member = this.teamMembers().find(m => m.name === memberName);
    if (member && member.color) {
      return member.color;
    }
    return this.memberColorsService.getMemberColor(memberName);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('teamMembers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.teamMembers.set(parsed);
      } catch (e) {
        this.teamMembers.set([]);
      }
    }
  }

  private saveToStorage(members: TeamMember[]): void {
    localStorage.setItem('teamMembers', JSON.stringify(members));
  }
}

