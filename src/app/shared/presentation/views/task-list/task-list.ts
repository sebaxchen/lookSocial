import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogActions, MatDialogContent, MatDialog } from '@angular/material/dialog';
import { TaskStore } from '../../../../learning/application/task.store';
import { Task, CreateTaskRequest, TaskStatus } from '../../../../learning/domain/model/task.entity';
import { StatusSelector } from '../../components/status-selector/status-selector';
import { AssigneeSelector } from '../../components/assignee-selector/assignee-selector';
import { MultiAssigneeSelector } from '../../components/multi-assignee-selector/multi-assignee-selector';
import { ConfirmDeleteTaskModal } from '../../components/confirm-delete-task-modal/confirm-delete-task-modal';
import { LottieAnimationComponent } from '../../components/lottie-animation/lottie-animation.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { GroupsService } from '../../../application/groups.service';
import { TeamService } from '../../../application/team.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButton,
    MatIcon,
    MatInput,
    MatFormField,
    MatLabel,
    MatHint,
    MatSelect,
    MatOption,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatDialogContent,
    StatusSelector,
    AssigneeSelector,
    MultiAssigneeSelector,
    LottieAnimationComponent,
    EmptyStateComponent,
    MatCheckboxModule
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskList {
  isAddDialogOpen = signal(false);
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
  disabledSignal = signal(false);
  enabledSignal = signal(false);

  private groupsService = inject(GroupsService);
  private teamService = inject(TeamService);

  constructor(
    public taskStore: TaskStore
  ) {}

  private dialog = inject(MatDialog);
  
  get groups() {
    return this.groupsService.getAllGroups();
  }

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

  /**
   * Removes a task from all groups it might be assigned to
   */
  private removeTaskFromAllGroups(taskId: string): void {
    const allGroups = this.groups();
    allGroups.forEach(group => {
      if (group.tasks && group.tasks.some(t => t.id === taskId)) {
        const updatedTasks = group.tasks.filter(t => t.id !== taskId);
        this.groupsService.updateGroup(group.id!, { tasks: updatedTasks });
      }
    });
  }

  /**
   * Assigns a task to a specific group, removing it from any other groups first
   */
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
        status: task.status,
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

  isTaskAssigned(task: any): boolean {
    // Check if task has an individual assignee
    if (task.assignee && task.assignee.trim() !== '') {
      return true;
    }
    
    // Check if task has multiple assignees
    if (task.assignees && task.assignees.length > 0) {
      return true;
    }
    
    // Check if task belongs to any group
    const taskGroup = this.getTaskGroup(task.id);
    if (taskGroup) {
      return true;
    }
    
    return false;
  }
  
  updateSelectedGroup(groupName: string): void {
    if (!groupName || groupName === '') {
      this.selectedGroup.set('');
      this.newTaskAssigneesSignal.set([]);
      this.newTask.update(task => ({ ...task, assignees: [] }));
      return;
    }

    this.selectedGroup.set(groupName);
    // Find the group and add its members to assignees
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

  clearGroupSelection(): void {
    this.selectedGroup.set('');
    this.newTaskAssigneesSignal.set([]);
    this.newTask.update(task => ({ ...task, assignees: [] }));
  }

  openAddDialog(): void {
    this.isAddDialogOpen.set(true);
  }

  closeAddDialog(): void {
    this.isAddDialogOpen.set(false);
    this.resetNewTask();
  }

  addTask(): void {
    if (this.newTask().title.trim()) {
      const task = this.taskStore.addTask(this.newTask());
      
      // If a group was selected, assign the task to that group
      const selectedGroupName = this.selectedGroup();
      if (selectedGroupName) {
        this.assignTaskToGroup(task, selectedGroupName);
      }
      
      this.closeAddDialog();
    }
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
        // Remove task from all groups before deleting
        this.removeTaskFromAllGroups(id);
        this.taskStore.deleteTask(id);
      }
    });
  }

  updateStatus(id: string, status: TaskStatus): void {
    this.taskStore.updateStatus(id, status);
  }

  updateNewTaskStatus(status: TaskStatus): void {
    this.newTask.update(task => ({ ...task, status }));
    this.newTaskStatusSignal.set(status);
  }

  updateNewTaskAssignee(assignee: string): void {
    this.newTask.update(task => ({ ...task, assignee }));
    this.newTaskAssigneeSignal.set(assignee);
  }

  updateNewTaskAssignees(assignees: string[]): void {
    this.newTask.update(task => ({ ...task, assignees }));
    this.newTaskAssigneesSignal.set(assignees);
  }

  updateNewTaskDueDate(dueDate: string): void {
    const dueDateObj = dueDate ? new Date(dueDate) : undefined;
    this.newTask.update(task => ({ ...task, dueDate: dueDateObj }));
    this.newTaskDueDateSignal.set(dueDate);
  }

  getTaskStatusSignal(taskId: string) {
    const task = this.taskStore.getTaskById(taskId);
    return signal(task?.status || 'not-started');
  }

  getTaskDisabledSignal(status: TaskStatus) {
    return signal(status === 'completed');
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }

  private resetNewTask(): void {
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
  }

  isFormValid(): boolean {
    const task = this.newTask();
    return !!(task.title && task.title.trim().length > 0);
  }

  // Método para obtener el color de un miembro
  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }

  // Método para obtener el color de un grupo
  getGroupColor(groupName: string): string {
    return this.groupsService.getGroupColor(groupName);
  }

  // Método para obtener el icono según la prioridad
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'keyboard_arrow_up'; // Flecha hacia arriba para alta prioridad
      case 'medium':
        return 'remove'; // Línea horizontal para media prioridad
      case 'low':
        return 'keyboard_arrow_down'; // Flecha hacia abajo para baja prioridad
      default:
        return 'assignment';
    }
  }

  // Método para formatear la fecha
  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Método para verificar si una tarea está vencida
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
}
