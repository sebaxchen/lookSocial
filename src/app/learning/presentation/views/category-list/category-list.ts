import {Component, inject, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {TaskStore} from '../../../application/task.store';
import {AddMemberModal} from '../../../../shared/presentation/components/add-member-modal/add-member-modal';
import {ConfirmDeleteModal} from '../../../../shared/presentation/components/confirm-delete-modal/confirm-delete-modal';
import {WorkerProfileModal} from '../../../../shared/presentation/components/worker-profile-modal/worker-profile-modal';
import {TeamService, TeamMember} from '../../../../shared/application/team.service';
import {LottieAnimationComponent} from '../../../../shared/presentation/components/lottie-animation/lottie-animation.component';


@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule,
    MatIcon,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatButton,
    LottieAnimationComponent
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css'
})
export class CategoryList {
  readonly taskStore = inject(TaskStore);
  private dialog = inject(MatDialog);
  private teamService = inject(TeamService);

  // Usar el servicio de equipo en lugar de un signal local
  get teamMembers() {
    return this.teamService.allMembers;
  }

 getMemberStats(memberName: string) {
   const tasks = this.taskStore.getTasksByAssignee(memberName);
   const completed = tasks.filter(task => task.status === 'completed').length;
   const inProgress = tasks.filter(task => task.status === 'in-progress').length;
   const notStarted = tasks.filter(task => task.status === 'not-started').length;
   
   return {
     total: tasks.length,
     completed,
     inProgress,
     notStarted,
     completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
   };
 }

 getRecentTasks(memberName: string, limit: number = 3) {
   const tasks = this.taskStore.getTasksByAssignee(memberName);
   // Ordenar por fecha de creación (más recientes primero)
   const sortedTasks = [...tasks].sort((a, b) => {
     const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
     const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
     return dateB - dateA;
   });
   return sortedTasks.slice(0, limit);
 }

 getTrafficLightClass(totalTasks: number): string {
   if (totalTasks < 5) {
     return 'traffic-green';
   } else if (totalTasks < 10) {
     return 'traffic-yellow';
   } else {
     return 'traffic-red';
   }
 }

  openAddMemberModal() {
    const dialogRef = this.dialog.open(AddMemberModal, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((newMember: TeamMember) => {
      if (newMember) {
        this.teamService.addMember(newMember);
      }
    });
  }

  openDeleteMemberModal(memberName: string) {
    const dialogRef = this.dialog.open(ConfirmDeleteModal, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: { memberName }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.teamService.removeMemberByName(memberName);
        // También eliminar las tareas asignadas a este miembro
        this.taskStore.allTasks().forEach(task => {
          if (task.assignee === memberName) {
            this.taskStore.deleteTask(task.id);
          }
        });
      }
    });
  }

  openWorkerProfileModal(member: any) {
    console.log('Opening profile modal for member:', member);
    const stats = this.getMemberStats(member.name);
    console.log('Member stats:', stats);
    
    try {
      const dialogRef = this.dialog.open(WorkerProfileModal, {
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        disableClose: false,
        panelClass: 'custom-dialog-container',
        data: {
          member: member,
          stats: stats
        }
      });
      
      console.log('Dialog opened successfully');
    } catch (error) {
      console.error('Error opening dialog:', error);
    }
  }

  getTotalTasks(): number {
    return this.taskStore.allTasks().length;
  }

  getAverageCompletion(): number {
    const members = this.teamMembers();
    if (members.length === 0) return 0;
    
    const totalCompletion = members.reduce((sum, member) => {
      return sum + this.getMemberStats(member.name).completionRate;
    }, 0);
    
    return Math.round(totalCompletion / members.length);
  }

  getMemberStatusClass(completionRate: number): string {
    if (completionRate >= 80) return 'status-excellent';
    if (completionRate >= 60) return 'status-good';
    if (completionRate >= 40) return 'status-average';
    return 'status-poor';
  }

  getMemberStatusIcon(completionRate: number): string {
    if (completionRate >= 80) return 'star';
    if (completionRate >= 60) return 'thumb_up';
    if (completionRate >= 40) return 'trending_flat';
    return 'trending_down';
  }

  getMemberStatusText(completionRate: number): string {
    if (completionRate >= 80) return 'Excelente';
    if (completionRate >= 60) return 'Bueno';
    if (completionRate >= 40) return 'Regular';
    return 'Necesita Mejora';
  }

  viewMemberTasks(memberName: string): void {
    // Implementar navegación a tareas del miembro
    console.log('Ver tareas de:', memberName);
  }

  editMemberProfile(member: TeamMember): void {
    // Implementar edición de perfil
    console.log('Editar perfil de:', member.name);
  }

  // Método para obtener el color de un miembro
  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }

  // Drag and Drop handlers
  draggedMemberId: string | null = null;
  dragOverTrash = false;
  private dragStartPosition: { x: number; y: number } | null = null;
  private hasDragged = false;

  onDragStart(event: DragEvent, memberId: string): void {
    this.draggedMemberId = memberId;
    this.hasDragged = false;
    // Guardar posición inicial del mouse
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', memberId);
    }
    
    // Encontrar la tarjeta padre y el botón
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.member-card') as HTMLElement;
    
    if (card) {
      // Agregar clase para animación de agarre
      card.classList.add('dragging');
      // Aplicar opacidad reducida
      card.style.opacity = '0.85';
      // Agregar z-index alto para que aparezca por encima
      card.style.zIndex = '1000';
    }
    
    if (button) {
      // Agregar clase al botón para animación
      button.classList.add('dragging-handle');
      button.style.opacity = '1';
    }
    
    event.stopPropagation();
  }

  onDragEnd(event: DragEvent): void {
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.member-card') as HTMLElement;
    
    // Verificar si realmente hubo movimiento significativo
    if (this.dragStartPosition) {
      const deltaX = Math.abs(event.clientX - this.dragStartPosition.x);
      const deltaY = Math.abs(event.clientY - this.dragStartPosition.y);
      this.hasDragged = deltaX > 5 || deltaY > 5;
    }
    
    if (card) {
      // Agregar clase para animación de soltar
      card.classList.remove('dragging');
      card.classList.add('dropped');
      
      // Restaurar estilos después de la animación
      setTimeout(() => {
        card.classList.remove('dropped');
        card.style.opacity = '1';
        card.style.zIndex = '';
        card.style.transform = '';
      }, 300);
    }
    
    if (button) {
      // Remover clase y restaurar opacidad del botón
      button.classList.remove('dragging-handle');
      button.style.opacity = '';
      setTimeout(() => {
        button.style.opacity = '';
      }, 200);
    }
    
    this.draggedMemberId = null;
    this.dragStartPosition = null;
    
    // Reset flag después de un breve delay para prevenir click después del drag
    setTimeout(() => {
      this.hasDragged = false;
    }, 150);
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
    
    // Guardar el ID antes de resetear las variables
    const memberIdToDelete = this.draggedMemberId;
    
    // Resetear variables de drag
    this.draggedMemberId = null;
    this.dragOverTrash = false;
    this.dragStartPosition = null;
    
    setTimeout(() => {
      this.hasDragged = false;
    }, 200);
    
    if (memberIdToDelete) {
      const member = this.teamService.allMembers().find(m => m.id === memberIdToDelete);
      if (member) {
        // Mostrar el modal de confirmación antes de eliminar
        this.openDeleteMemberModal(member.name);
      }
    }
  }

}
