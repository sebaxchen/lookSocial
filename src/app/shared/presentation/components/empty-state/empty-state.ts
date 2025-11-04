import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { LottieAnimationComponent } from '../lottie-animation/lottie-animation.component';

export interface EmptyStateFeature {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatButton,
    LottieAnimationComponent
  ],
  template: `
    <div class="empty-state" [class.variant-simple]="variant === 'simple'" [class.variant-minimal]="variant === 'minimal'">
      <div class="empty-state-content">
        @if (animationPath) {
          <div class="empty-animation-container">
            <app-lottie-animation 
              [animationPath]="animationPath"
              [width]="animationWidth || '200px'"
              [height]="animationHeight || '200px'"
              [loop]="true"
              [autoplay]="true">
            </app-lottie-animation>
          </div>
        } @else if (icon) {
          <div class="empty-icon-container">
            <mat-icon class="empty-icon">{{ icon }}</mat-icon>
          </div>
        }

        @if (title) {
          <h2 class="empty-title" [class.h3]="variant === 'simple'">{{ title }}</h2>
        }

        @if (message) {
          <p class="empty-message" [innerHTML]="message"></p>
        }

        @if (features && features.length > 0) {
          <div class="empty-features">
            @for (feature of features; track feature.label) {
              <div class="feature-item">
                <mat-icon class="feature-icon">{{ feature.icon }}</mat-icon>
                <span>{{ feature.label }}</span>
              </div>
            }
          </div>
        }

        @if (ctaText && ctaAction) {
          <button 
            mat-raised-button 
            [color]="ctaColor || 'primary'" 
            class="empty-cta" 
            (click)="ctaAction()">
            @if (ctaIcon) {
              <mat-icon>{{ ctaIcon }}</mat-icon>
            }
            {{ ctaText }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 80px 24px;
      background: #ffffff;
      border-radius: 0;
      margin: 0 auto;
      position: relative;
      border: none;
      width: 100%;
      max-width: 1400px;
      box-sizing: border-box;
      min-height: 500px;
    }

    .empty-state.variant-simple {
      padding: 80px 24px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
      text-align: center;
      min-height: 500px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .empty-state.variant-minimal {
      padding: 12px 6px 6px 6px;
      text-align: center;
      color: #999;
      background: rgba(248, 249, 250, 0.5);
      border-radius: 12px;
      border: 2px dashed #ddd;
      transition: all 0.3s ease;
      width: 90% !important;
      max-width: 90% !important;
      margin: 0 auto !important;
      min-height: 80px;
    }

    .empty-state.variant-minimal:hover {
      background: rgba(248, 249, 250, 0.8);
      border-color: #1a1a1a;
      transform: scale(1.02);
    }

    .empty-state-content {
      text-align: center;
      max-width: 500px;
      width: 100%;
      position: relative;
      z-index: 2;
      padding: 0;
      margin: 0 auto;
    }

    .empty-animation-container {
      position: relative;
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .empty-animation-container app-lottie-animation {
      display: block;
      margin: 0 auto;
    }

    .empty-icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 24px;
    }

    .empty-icon {
      font-size: 5rem;
      width: 5rem;
      height: 5rem;
      color: #d1d5db;
    }

    .empty-state.variant-minimal .empty-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      margin-bottom: 4px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.75rem;
      font-weight: 500;
      color: #2c3e50;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }

    .empty-title.h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 12px 0;
    }

    .empty-state.variant-minimal .empty-title {
      display: none;
    }

    .empty-message {
      font-size: 0.95rem;
      color: #6c757d;
      line-height: 1.5;
      margin: 0 0 32px 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-state.variant-simple .empty-message {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 0 0;
      max-width: 400px;
    }

    .empty-state.variant-minimal .empty-message {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .empty-features {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: all 0.2s ease;
      min-width: 80px;
      border: 1px solid #e5e7eb;
    }

    .feature-item:hover {
      background: #f0f4ff;
      border-color: #667eea;
    }

    .feature-icon {
      font-size: 1.2rem;
      color: #667eea;
      margin-bottom: 2px;
    }

    .feature-item span {
      font-size: 0.8rem;
      font-weight: 500;
      color: #2c3e50;
    }

    .empty-cta {
      background: #ffffff;
      color: #1a1a1a !important;
      padding: 12px 24px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      border: 1px solid #e8eaed;
      margin: 0 auto;
      justify-content: center;
    }

    .empty-cta:hover {
      background: #f8f9fa;
      border-color: #d1d5db;
    }

    @media (max-width: 768px) {
      .empty-state {
        padding: 60px 20px;
        min-height: 400px;
      }

      .empty-state.variant-simple {
        padding: 60px 20px;
        min-height: 400px;
      }

      .empty-title {
        font-size: 1.5rem;
      }

      .empty-title.h3 {
        font-size: 1.25rem;
      }

      .empty-features {
        gap: 16px;
        margin-bottom: 24px;
      }

      .feature-item {
        min-width: 70px;
        padding: 10px 12px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() variant: 'default' | 'simple' | 'minimal' = 'default';
  @Input() icon?: string;
  @Input() animationPath?: string;
  @Input() animationWidth?: string;
  @Input() animationHeight?: string;
  @Input() title?: string;
  @Input() message?: string;
  @Input() features?: EmptyStateFeature[];
  @Input() ctaText?: string;
  @Input() ctaIcon?: string;
  @Input() ctaColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() ctaAction?: () => void;
}

