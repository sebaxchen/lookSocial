import { Injectable, computed, inject } from '@angular/core';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../../domain/entities/task.entity';
import { TaskService } from '../../application/services/task.service';

/**
 * Adapter for backward compatibility with TaskStore
 * This maintains the old interface while using the new DDD structure
 */
@Injectable({
  providedIn: 'root'
})
export class TaskStore {
  private taskService = inject(TaskService);

  // Computed values - delegate to TaskService
  readonly allTasks = computed(() => this.taskService.allTasks());
  
  readonly notStartedTasks = computed(() => this.taskService.notStartedTasks());
  
  readonly inProgressTasks = computed(() => this.taskService.inProgressTasks());
  
  readonly completedTasks = computed(() => this.taskService.completedTasks());
  
  readonly taskCount = computed(() => this.taskService.taskCount());
  readonly completedCount = computed(() => this.taskService.completedCount());
  readonly inProgressCount = computed(() => this.taskService.inProgressCount());
  readonly notStartedCount = computed(() => this.taskService.notStartedCount());

  initializeSampleData(): void {
    // This will be handled by the repository
    const repository = (this.taskService as any).taskRepository;
    if (repository && repository.initializeSampleData) {
      repository.initializeSampleData();
    }
  }

  // Actions - delegate to TaskService
  addTask(request: CreateTaskRequest): Task {
    // For synchronous compatibility, we'll need to handle this differently
    // Since TaskService uses async, we'll create a sync version
    const repository = (this.taskService as any).taskRepository;
    if (repository) {
      const newTask: Task = {
        id: this.generateId(),
        title: request.title,
        description: request.description || '',
        status: request.status || 'not-started',
        priority: request.priority || 'medium',
        category: request.category,
        assignee: request.assignee || '',
        assignees: request.assignees || [],
        dueDate: request.dueDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const tasksSignal = repository.getTasksSignal();
      tasksSignal.update((currentTasks: Task[]) => {
        const newTasks = [...currentTasks, newTask];
        (repository as any).saveToStorage(newTasks);
        return newTasks;
      });
      
      return newTask;
    }
    throw new Error('Repository not available');
  }

  updateTask(request: UpdateTaskRequest): void {
    this.taskService.updateTask(request).catch(err => {
      console.error('Error updating task:', err);
    });
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).catch(err => {
      console.error('Error deleting task:', err);
    });
  }

  updateStatus(id: string, status: TaskStatus): void {
    this.updateTask({ id, status });
  }

  clearCompleted(): void {
    const tasks = this.allTasks();
    const completedIds = tasks.filter(t => t.status === 'completed').map(t => t.id);
    completedIds.forEach(id => this.deleteTask(id));
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getTaskById(id: string): Task | undefined {
    return this.taskService.getTaskByIdSync(id);
  }

  getTasksByCategory(category: string): Task[] {
    return this.taskService.getTasksByCategory(category);
  }

  getTasksByPriority(priority: 'low' | 'medium' | 'high'): Task[] {
    return this.taskService.getTasksByPriority(priority);
  }

  getTasksByAssignee(assignee: string): Task[] {
    return this.taskService.getTasksSignal()()
      .filter(task => task.assignee === assignee)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

