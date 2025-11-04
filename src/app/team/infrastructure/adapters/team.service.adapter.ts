import { Injectable, inject } from '@angular/core';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { TeamService } from '../../application/services/team.service';

/**
 * Adapter for backward compatibility with TeamService
 */
@Injectable({
  providedIn: 'root'
})
export class TeamServiceAdapter {
  private teamService = inject(TeamService);

  get allMembers() {
    return this.teamService.allMembers;
  }

  addMember(member: TeamMember): void {
    this.teamService.addMember(member).catch(err => {
      console.error('Error adding member:', err);
    });
  }

  removeMember(id: string): void {
    this.teamService.removeMember(id).catch(err => {
      console.error('Error removing member:', err);
    });
  }

  removeMemberByName(name: string): void {
    this.teamService.removeMemberByName(name);
  }

  updateMember(id: string, updates: Partial<TeamMember>): void {
    this.teamService.updateMember(id, updates).catch(err => {
      console.error('Error updating member:', err);
    });
  }

  getMemberById(id: string): TeamMember | undefined {
    return this.teamService.getMemberById(id);
  }

  getMemberByName(name: string): TeamMember | undefined {
    return this.teamService.getMemberByName(name);
  }

  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }
}

