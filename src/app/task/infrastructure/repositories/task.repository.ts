import { Injectable, signal, computed, inject } from '@angular/core';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskRepository implements ITaskRepository {
  private tasks = signal<Task[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  // Repository Interface Implementation
  async findAll(): Promise<Task[]> {
    return Promise.resolve(this.tasks());
  }

  async findById(id: string): Promise<Task | null> {
    const task = this.tasks().find(t => t.id === id);
    return Promise.resolve(task || null);
  }

  async findByStatus(status: string): Promise<Task[]> {
    return Promise.resolve(this.tasks().filter(t => t.status === status));
  }

  async findByAssignee(assignee: string): Promise<Task[]> {
    return Promise.resolve(this.tasks().filter(t => t.assignee === assignee));
  }

  async create(request: CreateTaskRequest): Promise<Task> {
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
      this.saveToStorage(newTasks);
      return newTasks;
    });
    
    return Promise.resolve(newTask);
  }

  async update(request: UpdateTaskRequest): Promise<Task> {
    let updatedTask: Task | null = null;
    
    this.tasks.update(tasks => {
      const updated = tasks.map(task =>
        task.id === request.id
          ? {
              ...task,
              ...request,
              updatedAt: new Date()
            }
          : task
      );
      
      updatedTask = updated.find(t => t.id === request.id) || null;
      this.saveToStorage(updated);
      return updated;
    });

    if (!updatedTask) {
      throw new Error(`Task with id ${request.id} not found`);
    }
    
    return Promise.resolve(updatedTask);
  }

  async delete(id: string): Promise<void> {
    this.tasks.update(tasks => {
      const filtered = tasks.filter(task => task.id !== id);
      this.saveToStorage(filtered);
      return filtered;
    });
  }

  // Additional methods for compatibility and sample data
  getTasksSignal() {
    return this.tasks.asReadonly();
  }

  getSortedTasks() {
    return computed(() => [...this.tasks()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  }

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
    this.saveToStorage(sampleTasks);
  }

  // Private methods
  private loadFromStorage(): void {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const tasks = parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
        this.tasks.set(tasks);
      } catch (e) {
        this.tasks.set([]);
      }
    }
  }

  saveToStorage(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

