import { Injectable, inject } from '@angular/core';
import { Group } from '../../domain/entities/group.entity';
import { GroupRepository } from '../../infrastructure/repositories/group.repository';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  groupRepository = inject(GroupRepository);

  getAllGroups() {
    return this.groupRepository.getAllGroups();
  }

  addGroup(group: Group): void {
    this.groupRepository.addGroup(group);
  }

  updateGroup(groupId: string, updates: Partial<Group>): void {
    this.groupRepository.updateGroup(groupId, updates);
  }

  deleteGroup(groupId: string): void {
    this.groupRepository.deleteGroup(groupId);
  }

  getGroupById(groupId: string): Group | undefined {
    return this.groupRepository.getGroupById(groupId);
  }

  getGroupColor(groupName: string): string {
    return this.groupRepository.getGroupColor(groupName);
  }
}

