import { Component, Input, Output, EventEmitter, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TeamService, TeamMember } from '../../../application/team.service';

export interface Person {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  role?: string;
}

@Component({
  selector: 'app-assignee-selector',
  standalone: true,
  imports: [CommonModule, MatIcon, MatButton],
  template: `
    <div class="assignee-selector" (mouseleave)="closeDropdown()">
      <button 
        mat-button 
        (click)="toggleDropdown(); $event.stopPropagation()"
        class="assignee-button"
        [class.assigned]="currentAssignee">
        <div class="assignee-content">
          @if (currentAssignee) {
            <div class="assignee-avatar" [style.background-color]="getMemberColor(currentAssignee)">
              <span class="assignee-initials">{{ getAssigneeInitials() }}</span>
            </div>
            <span class="assignee-name">{{ currentAssignee }}</span>
          } @else {
            <mat-icon class="assign-icon">person_add</mat-icon>
            <span class="assign-text">Asignar a...</span>
          }
          <mat-icon class="dropdown-icon" [class.rotated]="isDropdownOpen()">keyboard_arrow_down</mat-icon>
        </div>
      </button>
      
      @if (isDropdownOpen()) {
        <div class="assignee-dropdown" (click)="$event.stopPropagation()">
          <button class="dropdown-item clear-option" (click)="selectAssignee(''); $event.stopPropagation()">
            <mat-icon>person_off</mat-icon>
            <span>Sin asignar</span>
          </button>
          @for (person of people; track person.id) {
            <button class="dropdown-item" (click)="selectAssignee(person.name); $event.stopPropagation()">
              <div class="person-option">
                <div class="person-avatar" [style.background-color]="getMemberColor(person.name)">
                  <span class="person-initials">{{ person.initials }}</span>
                </div>
                <div class="person-info">
                  <span class="person-name">{{ person.name }}</span>
                  @if (person.role) {
                    <span class="person-role">{{ person.role }}</span>
                  }
                </div>
                @if (currentAssignee === person.name) {
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
    .assignee-selector {
      width: 100%;
      position: relative;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .assignee-button {
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

    .assignee-button:hover {
      border-color: #1a1a1a;
      background: #f8f9fa;
      color: #1a1a1a;
    }

    .assignee-button.assigned {
      border: 1px solid #1a1a1a;
      background: #f8f9fa;
      color: #1a1a1a;
    }

    .assignee-content {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
    }

    .assignee-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .assignee-initials {
      color: white;
      font-weight: 600;
      font-size: 0.7rem;
    }

    .assignee-name {
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

    .assignee-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      margin-top: 4px;
      max-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
      min-width: 100%;
      pointer-events: auto;
      padding-right: 4px;
    }

    /* Custom scrollbar for the dropdown - más visible */
    .assignee-dropdown::-webkit-scrollbar {
      width: 8px;
    }

    .assignee-dropdown::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
      margin: 4px 0;
    }

    .assignee-dropdown::-webkit-scrollbar-thumb {
      background: #9ca3af;
      border-radius: 4px;
      transition: all 0.3s ease;
      border: 1px solid #f1f1f1;
    }

    .assignee-dropdown::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }

    /* Firefox scrollbar */
    .assignee-dropdown {
      scrollbar-width: thin;
      scrollbar-color: #9ca3af #f1f1f1;
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

    .person-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 4px 0;
    }

    .person-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .person-initials {
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .person-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .person-name {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .person-role {
      font-size: 0.8rem;
      color: #666;
    }

    .check-icon {
      color: #4caf50;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .assignee-button {
        padding: 10px 12px;
      }
      
      .assignee-content {
        gap: 8px;
      }
      
      .assignee-avatar,
      .person-avatar {
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class AssigneeSelector {
  @Input() selectedAssignee = signal<string>('');
  @Input() disabled = signal(false);
  @Output() assigneeChange = new EventEmitter<string>();
  @Output() assigneeDropdownOpen = new EventEmitter<void>();

  isDropdownOpen = signal(false);
  private teamService = inject(TeamService);

  // Getter to always read the latest value from input signal
  get currentAssignee(): string {
    return this.selectedAssignee();
  }

  // Convertir TeamMember a Person para compatibilidad
  get people(): Person[] {
    return this.teamService.allMembers().map(member => ({
      id: member.id,
      name: member.name,
      initials: member.avatar,
      role: member.role
    }));
  }

  toggleDropdown(): void {
    if (!this.disabled()) {
      const willOpen = !this.isDropdownOpen();
      this.isDropdownOpen.set(willOpen);
      if (willOpen) {
        this.assigneeDropdownOpen.emit();
      }
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  selectAssignee(assignee: string): void {
    if (!this.disabled()) {
      this.selectedAssignee.set(assignee);
      this.assigneeChange.emit(assignee);
      this.isDropdownOpen.set(false);
    }
  }

  getAssigneeInitials(): string {
    const assignee = this.currentAssignee;
    if (!assignee) return '';
    
    const person = this.people.find(p => p.name === assignee);
    return person?.initials || assignee.substring(0, 2).toUpperCase();
  }

  // Método para obtener el color de un miembro
  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }
}
