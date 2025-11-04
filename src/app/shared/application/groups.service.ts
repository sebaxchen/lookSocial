// ADAPTER: Backward compatibility wrapper  
// This file maintains compatibility while migrating to DDD structure
import { Injectable, inject } from '@angular/core';
import { GroupService as GroupServiceDDD } from '../../group/application/services/group.service';
import { Group } from '../../group/domain/entities/group.entity';

// Re-export for backward compatibility
export type { Group } from '../../group/domain/entities/group.entity';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private groupService = inject(GroupServiceDDD);

  getAllGroups() {
    return this.groupService.getAllGroups();
  }

  addGroup(group: Group): void {
    this.groupService.addGroup(group);
  }

  updateGroup(groupId: string, updates: Partial<Group>): void {
    this.groupService.updateGroup(groupId, updates);
  }

  deleteGroup(groupId: string): void {
    this.groupService.deleteGroup(groupId);
  }

  getGroupById(groupId: string): Group | undefined {
    return this.groupService.getGroupById(groupId);
  }

  getGroupColor(groupName: string): string {
    return this.groupService.getGroupColor(groupName);
  }
}
