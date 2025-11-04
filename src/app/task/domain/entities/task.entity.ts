export type TaskStatus = 'not-started' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  assignee?: string; // Keep for backward compatibility
  assignees?: string[]; // New field for multiple assignees
  dueDate?: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  status?: TaskStatus;
  assignee?: string; // Keep for backward compatibility
  assignees?: string[]; // New field for multiple assignees
  dueDate?: Date;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  assignee?: string; // Keep for backward compatibility
  assignees?: string[]; // New field for multiple assignees
  dueDate?: Date;
}

