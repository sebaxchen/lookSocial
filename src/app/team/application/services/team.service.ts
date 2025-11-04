import { Injectable, inject } from '@angular/core';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { TeamRepository } from '../../infrastructure/repositories/team.repository';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  teamRepository = inject(TeamRepository);

  get allMembers() {
    return this.teamRepository.getMembersSignal();
  }

  async addMember(member: TeamMember): Promise<TeamMember> {
    return await this.teamRepository.create(member);
  }

  async removeMember(id: string): Promise<void> {
    return await this.teamRepository.delete(id);
  }

  async updateMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    return await this.teamRepository.update(id, updates);
  }

  getMemberById(id: string): TeamMember | undefined {
    return this.teamRepository.getMembersSignal()().find(member => member.id === id);
  }

  getMemberByName(name: string): TeamMember | undefined {
    return this.teamRepository.getMembersSignal()().find(member => member.name === name);
  }

  getMemberColor(memberName: string): string {
    return this.teamRepository.getMemberColor(memberName);
  }

  // Compatibility methods
  removeMemberByName(name: string): void {
    const member = this.getMemberByName(name);
    if (member) {
      this.removeMember(member.id).catch(err => {
        console.error('Error removing member:', err);
      });
    }
  }
}

