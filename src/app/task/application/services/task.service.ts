import { Injectable, computed, inject } from '@angular/core';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../../domain/entities/task.entity';
import { TaskRepository } from '../../infrastructure/repositories/task.repository';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  taskRepository = inject(TaskRepository); // Made public for adapter access

  // Computed values for reactive state
  private sortedTasks = computed(() => {
    const tasks = this.taskRepository.getTasksSignal()();
    return [...tasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  readonly allTasks = computed(() => this.sortedTasks());
  
  readonly notStartedTasks = computed(() => 
    this.sortedTasks().filter(task => task.status === 'not-started')
  );
  
  readonly inProgressTasks = computed(() => 
    this.sortedTasks().filter(task => task.status === 'in-progress')
  );
  
  readonly completedTasks = computed(() => 
    this.sortedTasks().filter(task => task.status === 'completed')
  );
  
  readonly taskCount = computed(() => this.taskRepository.getTasksSignal()().length);
  readonly completedCount = computed(() => this.completedTasks().length);
  readonly inProgressCount = computed(() => this.inProgressTasks().length);
  readonly notStartedCount = computed(() => this.notStartedTasks().length);

  // Use case methods
  async createTask(request: CreateTaskRequest): Promise<Task> {
    return await this.taskRepository.create(request);
  }

  async updateTask(request: UpdateTaskRequest): Promise<Task> {
    return await this.taskRepository.update(request);
  }

  async deleteTask(id: string): Promise<void> {
    return await this.taskRepository.delete(id);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return await this.taskRepository.findById(id);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return await this.taskRepository.findByStatus(status);
  }

  async getTasksByAssignee(assignee: string): Promise<Task[]> {
    return await this.taskRepository.findByAssignee(assignee);
  }

  // Helper methods for compatibility
  getTasksSignal() {
    return this.taskRepository.getTasksSignal();
  }

  getTaskByIdSync(id: string): Task | undefined {
    return this.taskRepository.getTasksSignal()().find(task => task.id === id);
  }

  getTasksByCategory(category: string): Task[] {
    return this.taskRepository.getTasksSignal()().filter(task => task.category === category);
  }

  getTasksByPriority(priority: 'low' | 'medium' | 'high'): Task[] {
    return this.taskRepository.getTasksSignal()()
      .filter(task => task.priority === priority)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

