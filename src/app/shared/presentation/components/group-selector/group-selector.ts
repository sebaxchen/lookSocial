import { Component, Input, Output, EventEmitter, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { GroupsService } from '../../../application/groups.service';

@Component({
  selector: 'app-group-selector',
  standalone: true,
  imports: [CommonModule, MatIcon, MatButton],
  template: `
    <div class="group-selector" (mouseleave)="closeDropdown()">
      <button 
        mat-button 
        (click)="toggleDropdown(); $event.stopPropagation()"
        class="group-button"
        [class.assigned]="currentGroup">
        <div class="group-content">
          @if (currentGroup) {
            <div class="group-avatar" [style.background-color]="getGroupColor(currentGroup)">
              <mat-icon class="group-icon-small">groups</mat-icon>
            </div>
            <span class="group-name">{{ currentGroup }}</span>
          } @else {
            <mat-icon class="assign-icon">group_add</mat-icon>
            <span class="assign-text">Grupo...</span>
          }
          <mat-icon class="dropdown-icon" [class.rotated]="isDropdownOpen()">keyboard_arrow_down</mat-icon>
        </div>
      </button>
      
      @if (isDropdownOpen()) {
        <div class="group-dropdown" (click)="$event.stopPropagation()">
          <button class="dropdown-item clear-option" (click)="selectGroup(''); $event.stopPropagation()">
            <mat-icon>group_off</mat-icon>
            <span>Sin grupo</span>
          </button>
          @for (group of groups(); track group.id || group.name) {
            <button class="dropdown-item" (click)="selectGroup(group.name); $event.stopPropagation()">
              <div class="group-option">
                <div class="group-avatar-item" [style.background-color]="getGroupColor(group.name)">
                  <mat-icon class="group-icon">groups</mat-icon>
                </div>
                <div class="group-info">
                  <span class="group-name-item">{{ group.name }}</span>
                </div>
                @if (currentGroup === group.name) {
                  <mat-icon class="check-icon">check</mat-icon>
                }
              </div>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .group-selector {
      width: 100%;
      position: relative;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .group-button {
      width: 100%;
      padding: 4px 10px !important;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #f8f9fa;
      color: #666;
      font-weight: 500;
      transition: all 0.3s ease;
      text-align: left;
      font-size: 0.75rem;
      min-height: 28px !important;
      height: 28px !important;
      line-height: 1;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    .group-button:hover {
      border-color: #1a1a1a;
      background: #f8f9fa;
      color: #1a1a1a;
    }

    .group-button.assigned {
      border: 1px solid #1a1a1a;
      background: #f8f9fa;
      color: #1a1a1a;
    }

    .group-content {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
    }

    .group-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .group-icon-small {
      color: white;
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .group-name {
      flex: 1;
      font-weight: 500;
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .assign-icon {
      color: #999;
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .assign-text {
      flex: 1;
      color: #666;
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-icon {
      color: #999;
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .group-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10003;
      margin-top: 4px;
      max-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
      min-width: 100%;
      pointer-events: auto;
    }

    .group-dropdown::-webkit-scrollbar {
      width: 6px;
    }

    .group-dropdown::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .group-dropdown::-webkit-scrollbar-thumb {
      background: #1a1a1a;
      border-radius: 3px;
      transition: all 0.3s ease;
    }

    .group-dropdown::-webkit-scrollbar-thumb:hover {
      background: #333333;
    }

    .group-dropdown {
      scrollbar-width: thin;
      scrollbar-color: #1a1a1a #f1f1f1;
    }

    .dropdown-item {
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dropdown-item:hover {
      background: #f5f5f5;
    }

    .clear-option {
      color: #f44336;
      border-bottom: 1px solid #eee;
    }

    .clear-option mat-icon {
      color: #f44336;
    }

    .group-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 4px 0;
    }

    .group-avatar-item {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .group-icon {
      color: white;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .group-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .group-name-item {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .group-members {
      font-size: 0.8rem;
      color: #666;
    }

    .check-icon {
      color: #4caf50;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class GroupSelector {
  @Input() selectedGroup = signal<string>('');
  @Input() disabled = signal(false);
  @Output() groupChange = new EventEmitter<string>();
  @Output() groupDropdownOpen = new EventEmitter<void>();

  isDropdownOpen = signal(false);
  private groupsService = inject(GroupsService);

  // Getter to always read the latest value from input signal
  get currentGroup(): string {
    return this.selectedGroup();
  }

  get groups() {
    return this.groupsService.getAllGroups();
  }

  toggleDropdown(): void {
    if (!this.disabled()) {
      const willOpen = !this.isDropdownOpen();
      this.isDropdownOpen.set(willOpen);
      if (willOpen) {
        this.groupDropdownOpen.emit();
      }
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  selectGroup(groupName: string): void {
    if (!this.disabled()) {
      this.selectedGroup.set(groupName);
      this.groupChange.emit(groupName);
      this.isDropdownOpen.set(false);
    }
  }

  getGroupColor(groupName: string): string {
    return this.groupsService.getGroupColor(groupName);
  }
}

