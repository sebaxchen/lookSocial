import { Injectable, signal, computed } from '@angular/core';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../domain/model/task.entity';

@Injectable({
  providedIn: 'root'
})
export class TaskStore {
  private tasks = signal<Task[]>([]);

  // Precompute sorted tasks once for better performance
  private sortedTasks = computed(() => [...this.tasks()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  
  // Computed values - using cached sorted tasks for better performance
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
  
  readonly taskCount = computed(() => this.tasks().length);
  readonly completedCount = computed(() => this.completedTasks().length);
  readonly inProgressCount = computed(() => this.inProgressTasks().length);
  readonly notStartedCount = computed(() => this.notStartedTasks().length);

  // Initialize with sample data
  initializeSampleData(): void {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Configurar base de datos',
        description: 'Configurar la base de datos del proyecto',
        status: 'completed',
        priority: 'high',
        assignee: 'Martín García',
        category: 'Desarrollo',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        title: 'Diseñar interfaz de usuario',
        description: 'Crear mockups y wireframes',
        status: 'completed',
        priority: 'medium',
        assignee: 'Ana López',
        category: 'Diseño',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: '3',
        title: 'Implementar autenticación',
        description: 'Sistema de login y registro',
        status: 'in-progress',
        priority: 'high',
        assignee: 'Carlos Ruiz',
        category: 'Desarrollo',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-22')
      },
      {
        id: '4',
        title: 'Escribir documentación',
        description: 'Documentar APIs y componentes',
        status: 'not-started',
        priority: 'low',
        assignee: 'María Fernández',
        category: 'Documentación',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '5',
        title: 'Configurar CI/CD',
        description: 'Pipeline de integración continua',
        status: 'completed',
        priority: 'medium',
        assignee: 'David Sánchez',
        category: 'DevOps',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-28')
      },
      {
        id: '6',
        title: 'Optimizar rendimiento',
        description: 'Mejorar velocidad de carga',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Martín García',
        category: 'Desarrollo',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-30')
      },
      {
        id: '7',
        title: 'Testing de integración',
        description: 'Pruebas end-to-end',
        status: 'not-started',
        priority: 'high',
        assignee: 'Ana López',
        category: 'Testing',
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-28')
      },
      {
        id: '8',
        title: 'Revisar código',
        description: 'Code review de funcionalidades',
        status: 'completed',
        priority: 'medium',
        assignee: 'Carlos Ruiz',
        category: 'Desarrollo',
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date('2024-02-02')
      },
      {
        id: '9',
        title: 'Implementar componentes UI',
        description: 'Crear componentes reutilizables',
        status: 'completed',
        priority: 'high',
        assignee: 'Laura Martínez',
        category: 'Desarrollo',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-05')
      },
      {
        id: '10',
        title: 'Diseñar mockups',
        description: 'Crear diseños para nuevas funcionalidades',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Roberto Silva',
        category: 'Diseño',
        createdAt: new Date('2024-02-03'),
        updatedAt: new Date('2024-02-08')
      },
      {
        id: '11',
        title: 'Ejecutar pruebas unitarias',
        description: 'Testing de componentes críticos',
        status: 'completed',
        priority: 'high',
        assignee: 'Elena Vargas',
        category: 'Testing',
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: '12',
        title: 'Configurar monitoreo',
        description: 'Sistema de alertas y métricas',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Javier Morales',
        category: 'DevOps',
        createdAt: new Date('2024-02-07'),
        updatedAt: new Date('2024-02-12')
      },
      {
        id: '13',
        title: 'Definir historias de usuario',
        description: 'Documentar requerimientos del producto',
        status: 'not-started',
        priority: 'low',
        assignee: 'Carmen Díaz',
        category: 'Producto',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: '14',
        title: 'Optimizar consultas SQL',
        description: 'Mejorar rendimiento de base de datos',
        status: 'completed',
        priority: 'high',
        assignee: 'Laura Martínez',
        category: 'Desarrollo',
        createdAt: new Date('2024-02-12'),
        updatedAt: new Date('2024-02-15')
      },
      {
        id: '15',
        title: 'Crear guía de estilo',
        description: 'Documentar patrones de diseño',
        status: 'completed',
        priority: 'low',
        assignee: 'Roberto Silva',
        category: 'Diseño',
        createdAt: new Date('2024-02-14'),
        updatedAt: new Date('2024-02-18')
      }
    ];
    
    this.tasks.set(sampleTasks);
  }

  // Actions
  addTask(request: CreateTaskRequest): Task {
    console.log('Adding task:', request);
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

    this.tasks.update(tasks => {
      const newTasks = [...tasks, newTask];
      console.log('Updated tasks:', newTasks);
      return newTasks;
    });
    
    return newTask;
  }

  updateTask(request: UpdateTaskRequest): void {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === request.id
          ? {
              ...task,
              ...request,
              updatedAt: new Date()
            }
          : task
      )
    );
  }

  deleteTask(id: string): void {
    this.tasks.update(tasks => tasks.filter(task => task.id !== id));
  }

  updateStatus(id: string, status: TaskStatus): void {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { 
              ...task, 
              status: status,
              updatedAt: new Date() 
            }
          : task
      )
    );
  }

  clearCompleted(): void {
    this.tasks.update(tasks => tasks.filter(task => task.status !== 'completed'));
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks().find(task => task.id === id);
  }

  getTasksByCategory(category: string): Task[] {
    return this.tasks().filter(task => task.category === category);
  }

  getTasksByPriority(priority: 'low' | 'medium' | 'high'): Task[] {
    return this.tasks().filter(task => task.priority === priority).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getTasksByAssignee(assignee: string): Task[] {
    return this.tasks().filter(task => task.assignee === assignee).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
