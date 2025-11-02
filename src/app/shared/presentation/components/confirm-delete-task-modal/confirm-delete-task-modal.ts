import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButton,
    MatIcon
  ],
  template: `
    <div class="confirm-modal">
      <div class="modal-header">
        <div class="warning-icon">
          <mat-icon>delete_outline</mat-icon>
        </div>
        <h2 class="modal-title">Eliminar {{ itemType }}</h2>
      </div>
      
      <div class="modal-content">
        <p class="warning-text">
          ¿Estás seguro de que quieres eliminar {{ itemType.toLowerCase() }} <strong>"{{ taskTitle }}"</strong>?
        </p>
        <p class="sub-warning">
          Esta acción no se puede deshacer y se perderá toda la información de {{ itemType.toLowerCase() }}.
        </p>
      </div>
      
      <div class="modal-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()" class="confirm-btn">
          <mat-icon>delete</mat-icon>
          Eliminar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-modal {
      padding: 0;
      max-width: 400px;
      width: 100%;
    }

    .modal-header {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      padding: 24px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }

    .warning-icon {
      margin-bottom: 12px;
    }

    .warning-icon mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: white;
      animation: pulse 2s infinite;
    }

    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .modal-content {
      padding: 24px;
      text-align: center;
    }

    .warning-text {
      font-size: 1.1rem;
      color: #333;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .sub-warning {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    .modal-actions {
      padding: 16px 24px 24px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #eee;
    }

    .cancel-btn {
      color: #666;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cancel-btn:hover {
      background-color: #f5f5f5;
      color: #333;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .confirm-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .modal-actions {
        flex-direction: column;
        gap: 10px;
      }
      
      .cancel-btn, .confirm-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ConfirmDeleteTaskModal {
  dialogRef = inject(MatDialogRef<ConfirmDeleteTaskModal>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { taskTitle: string; itemType?: string }) {}

  get taskTitle(): string {
    return this.data?.taskTitle || '';
  }

  get itemType(): string {
    return this.data?.itemType || 'Nota';
  }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
