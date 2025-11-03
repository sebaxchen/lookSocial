import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SessionTimerService } from '../../../application/session-timer.service';

@Component({
  selector: 'app-break-modal',
  standalone: true,
  imports: [CommonModule, MatIcon],
  template: `
    @if (sessionTimerService.sessionState().shouldShowBreakModal) {
      <div class="break-modal-overlay" (click)="onOverlayClick($event)">
        <div class="break-modal" (click)="$event.stopPropagation()">
          <div class="break-modal-content">
            <div class="break-icon">
              <mat-icon>coffee</mat-icon>
            </div>
            <h2 class="break-title">¡Es hora de tomar un descanso!</h2>
            <p class="break-description">
              Has estado trabajando por más de 10 minutos. 
              Es importante tomar descansos regulares para mantener tu productividad y bienestar.
            </p>
            <div class="break-suggestions">
              <div class="suggestion-item">
                <mat-icon>visibility</mat-icon>
                <span>Mira por la ventana</span>
              </div>
              <div class="suggestion-item">
                <mat-icon>directions_walk</mat-icon>
                <span>Camina un poco</span>
              </div>
              <div class="suggestion-item">
                <mat-icon>water_drop</mat-icon>
                <span>Bebe agua</span>
              </div>
              <div class="suggestion-item">
                <mat-icon>self_improvement</mat-icon>
                <span>Respira profundamente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .break-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .break-modal {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: none;
      border: 1px solid #e5e7eb;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .break-modal-content {
      padding: 40px 32px;
      text-align: center;
    }

    .break-icon {
      width: 64px;
      height: 64px;
      background: #1a1a1a;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .break-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .break-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }

    .break-description {
      font-size: 0.9375rem;
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 32px 0;
    }

    .break-suggestions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 0;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .suggestion-item:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .suggestion-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280;
    }

    .suggestion-item span {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }


    /* Responsive */
    @media (max-width: 480px) {
      .break-modal {
        width: 95%;
        margin: 20px;
      }

      .break-modal-content {
        padding: 32px 24px;
      }

      .break-suggestions {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `]
})
export class BreakModalComponent {
  sessionTimerService = inject(SessionTimerService);

  onOverlayClick(event: Event): void {
    // Solo cerrar si se hace click en el overlay, no en el modal
    if (event.target === event.currentTarget) {
      this.continueWorking();
    }
  }

  continueWorking(): void {
    this.sessionTimerService.dismissBreakModal();
    this.sessionTimerService.resetSession();
  }
}
