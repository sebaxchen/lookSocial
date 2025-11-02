import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogContent } from '@angular/material/dialog';
import { TaskStore } from '../../../../learning/application/task.store';
import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '../../../../learning/domain/model/task.entity';
import { AssigneeSelector } from '../../components/assignee-selector/assignee-selector';
import { GroupSelector } from '../../components/group-selector/group-selector';
import { ConfirmDeleteTaskModal } from '../../components/confirm-delete-task-modal/confirm-delete-task-modal';
import { TeamService } from '../../../application/team.service';
import { GroupsService } from '../../../application/groups.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatButton,
    MatDialogContent,
    AssigneeSelector,
    GroupSelector
  ],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class About {
  constructor(public taskStore: TaskStore) {}
  
  private dialog = inject(MatDialog);
  private teamService = inject(TeamService);
  private groupsService = inject(GroupsService);
  
  // Signals for add task dialog
  isAddDialogOpen = signal(false);
  editingTaskId = signal<string | null>(null);
  newTask = signal<CreateTaskRequest>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'not-started',
    assignee: '',
    assignees: []
  });
  newTaskStatusSignal = signal<TaskStatus>('not-started');
  newTaskAssigneeSignal = signal<string>('');
  newTaskAssigneesSignal = signal<string[]>([]);
  newTaskDueDateSignal = signal<string>('');
  selectedGroup = signal<string>('');
  
  get groups() {
    return this.groupsService.getAllGroups();
  }

  updateStatus(id: string, status: TaskStatus): void {
    this.taskStore.updateStatus(id, status);
  }

  moveTask(id: string, targetStatus: TaskStatus): void {
    this.taskStore.updateStatus(id, targetStatus);
  }

  // Expand/Collapse state for task cards
  expandedTasks = signal<Set<string>>(new Set());

  toggleTaskExpansion(taskId: string): void {
    // No expandir si se acabó de hacer un drag
    if (this.hasDragged) {
      return;
    }
    const expanded = this.expandedTasks();
    const newExpanded = new Set(expanded);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    this.expandedTasks.set(newExpanded);
  }

  isTaskExpanded(taskId: string): boolean {
    return this.expandedTasks().has(taskId);
  }

  // Drag and Drop handlers
  draggedTaskId: string | null = null;
  dragOverColumn: string | null = null;
  dragOverTrash = false;
  private dragStartPosition: { x: number; y: number } | null = null;
  private hasDragged = false;

  onDragStart(event: DragEvent, taskId: string): void {
    this.draggedTaskId = taskId;
    this.hasDragged = false;
    // Guardar posición inicial del mouse
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId);
    }
    
    // Encontrar la tarjeta padre y el botón
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.task-card') as HTMLElement;
    
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
    const card = button.closest('.task-card') as HTMLElement;
    
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
    
    this.draggedTaskId = null;
    this.dragOverColumn = null;
    this.dragStartPosition = null;
    
    // Reset flag después de un breve delay para prevenir click después del drag
    setTimeout(() => {
      this.hasDragged = false;
    }, 150);
  }

  onDragOver(event: DragEvent, columnStatus: TaskStatus): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn = columnStatus;
  }

  onDragLeave(event: DragEvent): void {
    // Only clear dragOverColumn if we're actually leaving the drop zone
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      this.dragOverColumn = null;
    }
  }

  onDrop(event: DragEvent, targetStatus: TaskStatus): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.draggedTaskId) {
      const task = this.taskStore.getTaskById(this.draggedTaskId);
      if (task && task.status !== targetStatus) {
        this.moveTask(this.draggedTaskId, targetStatus);
      }
    }
    // Marcar que se hizo un drag para prevenir el click
    this.hasDragged = true;
    this.draggedTaskId = null;
    this.dragOverColumn = null;
    this.dragStartPosition = null;
    
    // Reset flag después de un breve delay
    setTimeout(() => {
      this.hasDragged = false;
    }, 200);
  }

  deleteTask(id: string): void {
    const task = this.taskStore.getTaskById(id);
    if (!task) return;

    const dialogRef = this.dialog.open(ConfirmDeleteTaskModal, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: { taskTitle: task.title }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.taskStore.deleteTask(id);
      }
    });
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
    const taskIdToDelete = this.draggedTaskId;
    
    // Resetear variables de drag
    this.draggedTaskId = null;
    this.dragOverTrash = false;
    this.dragStartPosition = null;
    
    setTimeout(() => {
      this.hasDragged = false;
    }, 200);
    
    if (taskIdToDelete) {
      const task = this.taskStore.getTaskById(taskIdToDelete);
      if (task) {
        // Mostrar el modal de confirmación antes de eliminar
        const dialogRef = this.dialog.open(ConfirmDeleteTaskModal, {
          width: '400px',
          maxWidth: '90vw',
          disableClose: false,
          panelClass: 'custom-dialog-container',
          data: { taskTitle: task.title }
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed && taskIdToDelete) {
            this.taskStore.deleteTask(taskIdToDelete);
            // También remover de grupos
            this.removeTaskFromAllGroups(taskIdToDelete);
          }
        });
      }
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getTaskStatusSignal(status: TaskStatus) {
    return signal(status);
  }

  getDisabledSignal() {
    return signal(false);
  }

  updateAssignee(id: string, assignee: string): void {
    const task = this.taskStore.getTaskById(id);
    if (!task) return;

    // Es un miembro individual
    this.taskStore.updateTask({ id, assignee });
    // Ya no removemos el grupo cuando se asigna un miembro
  }

  updateGroup(id: string, groupName: string): void {
    const task = this.taskStore.getTaskById(id);
    if (!task) return;

    if (groupName && groupName.trim() !== '') {
      // Asignar la tarea al grupo
      this.assignTaskToGroup(task, groupName);
    } else {
      // Remover la tarea de todos los grupos
      this.removeTaskFromAllGroups(id);
    }
  }

  getTaskAssigneeSignal(taskId: string) {
    const task = this.taskStore.getTaskById(taskId);
    if (!task) return signal('');
    
    return signal(task?.assignee || '');
  }

  getTaskGroupSignal(taskId: string) {
    const group = this.getTaskGroup(taskId);
    return signal(group?.name || '');
  }

  closeAssigneeSelector(selector: any): void {
    if (selector && selector.closeDropdown) {
      selector.closeDropdown();
    }
  }

  closeGroupSelector(selector: any): void {
    if (selector && selector.closeDropdown) {
      selector.closeDropdown();
    }
  }

  getAssignedTasksCount(): number {
    return this.taskStore.allTasks().filter(task => task.assignee && task.assignee.trim() !== '').length;
  }

  getTotalTasks(): number {
    return this.taskStore.allTasks().length;
  }

  getHighPriorityCount(): number {
    return this.taskStore.allTasks().filter(task => task.priority === 'high').length;
  }

  getTeamMembersCount(): number {
    // This would need to be injected from a team service
    return 5; // Placeholder for now
  }

  getCompletionRate(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.taskStore.completedCount() / total) * 100);
  }

  getProgressPercentage(type: string): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    
    switch (type) {
      case 'not-started':
        return (this.taskStore.notStartedCount() / total) * 100;
      case 'in-progress':
        return (this.taskStore.inProgressCount() / total) * 100;
      case 'completed':
        return (this.taskStore.completedCount() / total) * 100;
      case 'assigned':
        return (this.getAssignedTasksCount() / total) * 100;
      default:
        return 0;
    }
  }

  // Función para obtener el color único del miembro
  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }

  // Método para obtener el grupo de una tarea
  getTaskGroup(taskId: string): any | null {
    const allGroups = this.groups();
    for (const group of allGroups) {
      const taskExists = group.tasks?.some(t => t.id === taskId);
      if (taskExists) {
        return group;
      }
    }
    return null;
  }

  // Método para obtener el color de un grupo
  getGroupColor(groupName: string): string {
    return this.groupsService.getGroupColor(groupName);
  }

  // Método para obtener las iniciales de un grupo
  getGroupInitials(groupName: string): string {
    return groupName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  isOverdue(dueDate: Date, status: TaskStatus): boolean {
    if (status === 'completed') {
      return false; // Las tareas completadas no se consideran vencidas
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  // Methods for adding tasks
  openAddDialog(): void {
    this.resetNewTask(); // Reset before opening to ensure clean state
    this.isAddDialogOpen.set(true);
  }

  openEditDialog(task: Task): void {
    // Guardar el ID de la tarea que estamos editando
    this.editingTaskId.set(task.id);
    this.newTask.set({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignee: task.assignee || '',
      assignees: task.assignees || []
    });
    this.newTaskStatusSignal.set(task.status);
    this.newTaskAssigneeSignal.set(task.assignee || '');
    this.newTaskAssigneesSignal.set(task.assignees || []);
    this.newTaskDueDateSignal.set(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    
    // Buscar el grupo actual de la tarea
    const currentGroup = this.groups().find(group => 
      group.tasks?.some(t => t.id === task.id)
    );
    if (currentGroup) {
      this.selectedGroup.set(currentGroup.name);
    }
    
    this.isAddDialogOpen.set(true);
  }

  closeAddDialog(): void {
    this.isAddDialogOpen.set(false);
    this.resetNewTask();
  }

  updateNewTaskStatus(status: TaskStatus): void {
    this.newTask.update(task => ({ ...task, status }));
    this.newTaskStatusSignal.set(status);
  }

  updateNewTaskAssignee(assignee: string): void {
    this.newTask.update(task => ({ ...task, assignee }));
    this.newTaskAssigneeSignal.set(assignee);
  }

  updateNewTaskDueDate(dueDate: string): void {
    const dueDateObj = dueDate ? new Date(dueDate) : undefined;
    this.newTask.update(task => ({ ...task, dueDate: dueDateObj }));
    this.newTaskDueDateSignal.set(dueDate);
  }

  updateSelectedGroup(groupName: string): void {
    if (!groupName || groupName === '') {
      this.selectedGroup.set('');
      this.newTaskAssigneesSignal.set([]);
      this.newTask.update(task => ({ ...task, assignees: [] }));
      return;
    }

    this.selectedGroup.set(groupName);
    const group = this.groups().find(g => g.name === groupName);
    if (group) {
      const memberNames = group.members.map(m => m.name);
      this.newTaskAssigneesSignal.set(memberNames);
      this.newTask.update(task => ({ ...task, assignees: memberNames }));
    }
  }

  removeMemberFromAssignees(memberName: string): void {
    const currentAssignees = this.newTaskAssigneesSignal();
    const filtered = currentAssignees.filter(m => m !== memberName);
    this.newTaskAssigneesSignal.set(filtered);
    this.newTask.update(task => ({ ...task, assignees: filtered }));
  }

  addTask(): void {
    if (this.newTask().title.trim()) {
      const editingId = this.editingTaskId();
      const newTaskData = this.newTask();
      
      if (editingId) {
        // Modo edición: actualizar la tarea existente
        const updateRequest: UpdateTaskRequest = {
          id: editingId,
          title: newTaskData.title,
          description: newTaskData.description,
          priority: newTaskData.priority,
          status: newTaskData.status,
          assignee: newTaskData.assignee,
          assignees: newTaskData.assignees,
          dueDate: newTaskData.dueDate
        };
        this.taskStore.updateTask(updateRequest);
        
        // Actualizar el grupo si cambió
        const selectedGroupName = this.selectedGroup();
        if (selectedGroupName) {
          this.updateTaskGroup(editingId, selectedGroupName);
        }
      } else {
        // Modo creación: añadir nueva tarea
        const task = this.taskStore.addTask(newTaskData);
        
        // If a group was selected, assign the task to that group
        const selectedGroupName = this.selectedGroup();
        if (selectedGroupName) {
          this.assignTaskToGroup(task, selectedGroupName);
        }
      }
      
      this.closeAddDialog();
    }
  }

  private assignTaskToGroup(task: Task, groupName: string): void {
    // First, remove the task from any other groups
    this.removeTaskFromAllGroups(task.id);
    
    // Then add it to the target group
    const targetGroup = this.groups().find(g => g.name === groupName);
    if (targetGroup) {
      const taskData = {
        id: task.id,
        title: task.title,
        priority: task.priority,
        createdAt: task.createdAt
      };
      
      // Check if task is not already in the group
      const taskExists = targetGroup.tasks?.some(t => t.id === task.id);
      if (!taskExists) {
        const updatedTasks = [...(targetGroup.tasks || []), taskData];
        this.groupsService.updateGroup(targetGroup.id!, { tasks: updatedTasks });
      }
    }
  }

  private removeTaskFromAllGroups(taskId: string): void {
    const allGroups = this.groups();
    allGroups.forEach(group => {
      if (group.tasks && group.tasks.some(t => t.id === taskId)) {
        const updatedTasks = group.tasks.filter(t => t.id !== taskId);
        this.groupsService.updateGroup(group.id!, { tasks: updatedTasks });
      }
    });
  }

  private updateTaskGroup(taskId: string, groupName: string): void {
    // First, remove the task from any other groups
    this.removeTaskFromAllGroups(taskId);
    
    // Then add it to the target group
    const targetGroup = this.groups().find(g => g.name === groupName);
    if (targetGroup) {
      // Get the task data to add to the group
      const allTasks = this.taskStore.allTasks();
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        const taskData = {
          id: task.id,
          title: task.title,
          priority: task.priority,
          createdAt: task.createdAt
        };
        
        // Check if task is not already in the group
        const taskExists = targetGroup.tasks?.some(t => t.id === taskId);
        if (!taskExists) {
          const updatedTasks = [...(targetGroup.tasks || []), taskData];
          this.groupsService.updateGroup(targetGroup.id!, { tasks: updatedTasks });
        }
      }
    }
  }

  isFormValid(): boolean {
    const task = this.newTask();
    return !!(task.title && task.title.trim().length > 0);
  }

  private resetNewTask(): void {
    this.editingTaskId.set(null);
    this.newTask.set({
      title: '',
      description: '',
      priority: 'medium',
      status: 'not-started',
      assignee: '',
      assignees: []
    });
    this.newTaskStatusSignal.set('not-started');
    this.newTaskAssigneeSignal.set('');
    this.newTaskAssigneesSignal.set([]);
    this.newTaskDueDateSignal.set('');
    this.selectedGroup.set('');
  }
}
