import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupModal } from '../../components/create-group-modal/create-group-modal';
import { ConfirmDeleteTaskModal } from '../../components/confirm-delete-task-modal/confirm-delete-task-modal';
import { GroupProfileModal } from '../../components/group-profile-modal/group-profile-modal';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { GroupsService } from '../../../application/groups.service';
import { TeamService } from '../../../application/team.service';
import { TaskStore } from '../../../../learning/application/task.store';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatButton,
    CreateGroupModal,
    EmptyStateComponent
  ],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsComponent {
  isModalOpen = signal(false);
  editingGroup = signal<any>(null);
  
  private dialog = inject(MatDialog);
  private groupsService = inject(GroupsService);
  private teamService = inject(TeamService);
  private taskStore = inject(TaskStore);
  
  // Computed signal que combina grupos con estado actualizado de tareas
  // Esto asegura que Angular detecte cambios cuando el TaskStore se actualice
  groups = computed(() => {
    // Leer taskStore.allTasks() para forzar reactividad cuando cambien las tareas
    this.taskStore.allTasks();
    // Devolver el array directamente del signal de grupos
    return this.groupsService.getAllGroups()();
  });


  createGroup() {
    if (this.groups().length >= 9) {
      return;
    }
    this.editingGroup.set(null);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingGroup.set(null);
  }

  onCreateGroup(groupData: any) {
    const currentGroup = this.editingGroup();
    if (currentGroup && currentGroup.id) {
      this.groupsService.updateGroup(currentGroup.id, groupData);
    } else {
      this.groupsService.addGroup(groupData);
    }
    this.closeModal();
  }

  editGroup(group: any) {
    // Reload fresh data for the group
    const updatedGroup = this.groups().find(g => g.id === group.id);
    if (updatedGroup) {
      this.editingGroup.set(updatedGroup);
    } else {
      this.editingGroup.set(group);
    }
    this.isModalOpen.set(true);
  }

  deleteGroup(groupName: string) {
    const group = this.groups().find(g => g.name === groupName);
    if (!group || !group.id) return;

    const dialogRef = this.dialog.open(ConfirmDeleteTaskModal, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: { taskTitle: `el grupo "${groupName}"` }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.groupsService.deleteGroup(group.id!);
      }
    });
  }

  getInitials(name: string): string {
    return name.substring(0, 2).toUpperCase();
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'horizontal_rule';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  }

  getTaskStatus(taskId: string): string | undefined {
    // Obtener el estado actual desde TaskStore para reflejar cambios en tiempo real
    const task = this.taskStore.getTaskById(taskId);
    return task?.status;
  }

  getStatusText(taskId: string, storedStatus?: string): string {
    // Priorizar el estado desde TaskStore, si no existe usar el almacenado
    const currentStatus = this.getTaskStatus(taskId) || storedStatus;
    if (!currentStatus) return 'Sin iniciar';
    switch (currentStatus) {
      case 'completed': return 'Terminada';
      case 'in-progress': return 'En progreso';
      case 'not-started': return 'Sin iniciar';
      default: return 'Sin iniciar';
    }
  }

  getStatusClass(taskId: string, storedStatus?: string): string {
    // Priorizar el estado desde TaskStore, si no existe usar el almacenado
    const currentStatus = this.getTaskStatus(taskId) || storedStatus;
    if (!currentStatus) return 'status-not-started';
    switch (currentStatus) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'not-started': return 'status-not-started';
      default: return 'status-not-started';
    }
  }

  getElapsedTime(createdAt: Date): string {
    const now = new Date();
    const elapsed = now.getTime() - new Date(createdAt).getTime();
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor(elapsed / (1000 * 60));

    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Recién';
    }
  }

  openGroupProfile(group: any): void {
    this.dialog.open(GroupProfileModal, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: 'none',
      disableClose: false,
      panelClass: 'group-profile-modal',
      data: { group }
    });
  }

  // Método para obtener el color de un miembro
  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }

  // Método para obtener el color de un grupo
  getGroupColor(groupName: string): string {
    return this.groupsService.getGroupColor(groupName);
  }

  // Drag and Drop handlers
  draggedGroupName: string | null = null;
  dragOverTrash = false;
  private dragStartPosition: { x: number; y: number } | null = null;

  onDragStart(event: DragEvent, groupName: string): void {
    this.draggedGroupName = groupName;
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', groupName);
    }
    
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.group-card') as HTMLElement;
    
    if (card) {
      card.classList.add('dragging');
      card.style.opacity = '0.85';
      card.style.zIndex = '1000';
    }
    
    if (button) {
      button.classList.add('dragging-handle');
      button.style.opacity = '1';
    }
    
    event.stopPropagation();
  }

  onDragEnd(event: DragEvent): void {
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.group-card') as HTMLElement;
    
    if (card) {
      card.classList.remove('dragging');
      card.classList.add('dropped');
      
      setTimeout(() => {
        card.classList.remove('dropped');
        card.style.opacity = '1';
        card.style.zIndex = '';
        card.style.transform = '';
      }, 300);
    }
    
    if (button) {
      button.classList.remove('dragging-handle');
      button.style.opacity = '';
    }
    
    this.draggedGroupName = null;
    this.dragStartPosition = null;
  }

  // Trash button drag and drop handlers
  onTrashDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverTrash = true;
  }

  onTrashDragLeave(event: DragEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      this.dragOverTrash = false;
    }
  }

  onTrashDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Guardar el nombre antes de resetear las variables
    const groupNameToDelete = this.draggedGroupName;
    
    // Resetear variables de drag
    this.draggedGroupName = null;
    this.dragOverTrash = false;
    this.dragStartPosition = null;
    
    if (groupNameToDelete) {
      // Eliminar el grupo
      this.deleteGroup(groupNameToDelete);
    }
  }
}

