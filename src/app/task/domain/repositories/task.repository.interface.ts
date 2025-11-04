import { Task, CreateTaskRequest, UpdateTaskRequest } from '../entities/task.entity';

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  findByStatus(status: string): Promise<Task[]>;
  findByAssignee(assignee: string): Promise<Task[]>;
  create(task: CreateTaskRequest): Promise<Task>;
  update(task: UpdateTaskRequest): Promise<Task>;
  delete(id: string): Promise<void>;
}

