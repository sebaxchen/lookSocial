import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../../../../learning/domain/model/task.entity';

export interface TaskDetailData {
  tasks: Task[];
  memberName: string;
}

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="task-title-section">
          <h1>Tareas de {{ memberName }}</h1>
          <span class="task-count">{{ tasks.length }} tarea{{ tasks.length !== 1 ? 's' : '' }}</span>
        </div>
        <button mat-icon-button (click)="closeModal()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        @if (tasks.length === 0) {
          <div class="empty-state">
            <mat-icon>inbox</mat-icon>
            <h3>No hay tareas</h3>
            <p>Este miembro no tiene tareas asignadas</p>
          </div>
        } @else {
          <div class="tasks-list">
            @for (task of tasks; track task.id) {
              <div class="task-card" [class]="'task-status-' + task.status">
                <div class="task-card-header">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <mat-chip [class]="'status-' + task.status">
                    {{ getStatusLabel(task.status) }}
                  </mat-chip>
                </div>
                
                @if (task.description) {
                  <p class="task-description">{{ task.description }}</p>
                }

                <div class="task-details">
                  <div class="detail-row">
                    <span class="detail-label">
                      <mat-icon>flag</mat-icon>
                      Prioridad:
                    </span>
                    <span class="detail-value priority-{{ task.priority }}">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>

                  @if (task.category) {
                    <div class="detail-row">
                      <span class="detail-label">
                        <mat-icon>folder</mat-icon>
                        Categoría:
                      </span>
                      <span class="detail-value">{{ task.category }}</span>
                    </div>
                  }

                  @if (task.dueDate) {
                    <div class="detail-row">
                      <span class="detail-label">
                        <mat-icon>event</mat-icon>
                        Vencimiento:
                      </span>
                      <span class="detail-value">{{ task.dueDate | date:'short' }}</span>
                    </div>
                  }

                  <div class="detail-row">
                    <span class="detail-label">
                      <mat-icon>schedule</mat-icon>
                      Creada:
                    </span>
                    <span class="detail-value">{{ task.createdAt | date:'short' }}</span>
                  </div>
                </div>
                
                @if (!$last) {
                  <mat-divider></mat-divider>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-container {
      width: 100%;
      max-width: 700px;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e5e9;
    }

    .modal-header {
      background: #f8f9fa;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #e1e5e9;
    }

    .task-title-section {
      flex: 1;
    }

    .task-title-section h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.3;
    }

    .task-count {
      display: inline-block;
      padding: 4px 12px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .close-button {
      color: #6c757d;
      background: transparent;
      border-radius: 8px;
      width: 36px;
      height: 36px;
      border: none;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: #fee;
      color: #f44336;
    }

    .modal-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      max-height: 70vh;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #adb5bd;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #495057;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
      color: #6c757d;
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .task-card {
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #e1e5e9;
      background: #ffffff;
      transition: all 0.2s ease;
    }

    .task-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-color: #667eea;
    }

    .task-card.task-status-completed {
      background: #f1f8f4;
      border-left: 4px solid #10b981;
    }

    .task-card.task-status-in-progress {
      background: #fffbf0;
      border-left: 4px solid #f59e0b;
    }

    .task-card.task-status-not-started {
      background: #f9fafb;
      border-left: 4px solid #6b7280;
    }

    .task-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 12px;
    }

    .task-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      flex: 1;
      line-height: 1.3;
    }

    .task-description {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #6c757d;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .task-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #6c757d;
      font-size: 12px;
    }

    .detail-label mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #667eea;
    }

    .detail-value {
      font-size: 13px;
      font-weight: 500;
      color: #2c3e50;
    }

    mat-divider {
      margin: 16px 0 0 0;
    }

    .detail-value.priority-high {
      background: #ffebee;
      color: #c62828;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
      border: 1px solid #ffcdd2;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
    }

    .detail-value.priority-medium {
      background: #fff8e1;
      color: #e65100;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
      border: 1px solid #ffecb3;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
    }

    .detail-value.priority-low {
      background: #e8f5e8;
      color: #2e7d32;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
      border: 1px solid #c8e6c9;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
    }

    .status-completed {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
      border: 1px solid #c8e6c9 !important;
    }

    .status-in-progress {
      background: #fff8e1 !important;
      color: #f57c00 !important;
      border: 1px solid #ffecb3 !important;
    }

    .status-not-started {
      background: #f5f5f5 !important;
      color: #6c757d !important;
      border: 1px solid #e0e0e0 !important;
    }

    @media (max-width: 768px) {
      .details-grid {
        grid-template-columns: 1fr;
      }

      .task-title-section h1 {
        font-size: 20px;
      }
    }
  `]
})
export class TaskDetailModal {
  dialogRef = inject(MatDialogRef<TaskDetailModal>);
  tasks: Task[];
  memberName: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TaskDetailData) {
    this.tasks = data.tasks;
    this.memberName = data.memberName;
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'completed': 'Completada',
      'in-progress': 'En Progreso',
      'not-started': 'Sin Iniciar'
    };
    return statusLabels[status.toLowerCase()] || status;
  }

  getPriorityLabel(priority: string): string {
    const priorityLabels: { [key: string]: string } = {
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return priorityLabels[priority.toLowerCase()] || priority;
  }

  closeModal() {
    this.dialogRef.close();
  }
}

