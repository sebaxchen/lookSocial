import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../application/auth.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css'
})
export class SettingsModal {
  @Output() close = new EventEmitter<void>();
  authService = inject(AuthService);

  selectedMenu = 'profile';
  currentPlan = 'free'; // free, basic, premium
  isPaymentModalOpen = false;
  selectedPlanForPayment: any = null;
  isPartnersModalOpen = false;
  selectedCompany: any = null;
  
  coupons = {
    metro: [
      { code: 'METRO15', discount: '15%', description: 'Descuento en compras de más de S/ 100' },
      { code: 'METRO20', discount: '20%', description: 'Descuento en productos seleccionados' },
      { code: 'METROFREESHIP', discount: 'Envío Gratis', description: 'Envío gratis en todas tus compras' }
    ],
    plazavea: [
      { code: 'PLAZA10', discount: '10%', description: 'Descuento en línea blanca' },
      { code: 'PLAZA25', discount: '25%', description: 'Descuento en ropa y accesorios' },
      { code: 'PLAZACASHBACK', discount: '5% Cashback', description: 'Recibe 5% de reembolso en tu compra' }
    ],
    falabella: [
      { code: 'FALA20', discount: '20%', description: 'Descuento en moda y calzado' },
      { code: 'FALA30', discount: '30%', description: 'Descuento en electrónica y tecnología' },
      { code: 'FALACOINS', discount: '50 CMR Puntos', description: 'Obtén 50 puntos gratis' }
    ],
    florafauna: [
      { code: 'FLORA10', discount: '10%', description: 'Descuento en productos orgánicos' },
      { code: 'FLORA15', discount: '15%', description: 'Descuento en alimentos naturales' },
      { code: 'FLORASHIP', discount: 'Envío Express', description: 'Envío express gratis' }
    ]
  };
  
  menuItems = [
    { id: 'profile', label: 'Perfil', icon: 'person' },
    { id: 'plans', label: 'Planes', icon: 'workspace_premium' },
    { id: 'benefits', label: 'Beneficios', icon: 'card_giftcard' },
    { id: 'account', label: 'Cuenta', icon: 'account_circle' },
    { id: 'notifications', label: 'Notificaciones', icon: 'notifications' },
    { id: 'privacy', label: 'Privacidad', icon: 'lock' },
    { id: 'preferences', label: 'Preferencias', icon: 'settings' },
    { id: 'about', label: 'Acerca de', icon: 'info' }
  ];

  plans = [
    {
      id: 'free',
      name: 'Gratis',
      price: '$0',
      features: [
        'Hasta 20 tareas',
        'Hasta 3 colaboradores',
        'Almacenamiento básico',
        'Soporte por email'
      ]
    },
    {
      id: 'basic',
      name: 'Básico',
      price: '$9/mes',
      features: [
        'Tareas ilimitadas',
        'Hasta 10 colaboradores',
        'Almacenamiento expandido',
        'Soporte prioritario',
        'Reportes avanzados'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19/mes',
      features: [
        'Tareas ilimitadas',
        'Colaboradores ilimitados',
        'Almacenamiento ilimitado',
        'Soporte 24/7',
        'Reportes avanzados',
        'Integraciones premium',
        'Analíticas avanzadas'
      ]
    }
  ];

  getUserName(): string {
    return this.authService.getUserName();
  }

  getUserEmail(): string {
    return this.authService.getUserEmail();
  }

  closeModal() {
    this.close.emit();
  }

  selectPlan(plan: any) {
    if (plan.id === this.currentPlan) {
      return; // Do nothing if it's the current plan
    }
    
    // If the plan is free, just set it
    if (plan.id === 'free') {
      this.currentPlan = plan.id;
      return;
    }
    
    // For paid plans, open payment modal
    this.selectedPlanForPayment = plan;
    this.isPaymentModalOpen = true;
  }

  closePaymentModal() {
    this.isPaymentModalOpen = false;
    this.selectedPlanForPayment = null;
  }

  processPayment() {
    // Simulate payment processing
    console.log('Processing payment for plan:', this.selectedPlanForPayment);
    
    // In a real app, this would call a payment service
    // For now, just update the current plan
    if (this.selectedPlanForPayment) {
      this.currentPlan = this.selectedPlanForPayment.id;
    }
    
    // Close payment modal
    this.closePaymentModal();
  }

  openPartnersModal(companyId?: string) {
    this.selectedCompany = companyId;
    this.isPartnersModalOpen = true;
  }

  closePartnersModal() {
    this.isPartnersModalOpen = false;
    this.selectedCompany = null;
  }

  getCompanyCoupons() {
    if (!this.selectedCompany) return [];
    const companyKey = this.selectedCompany as keyof typeof this.coupons;
    return this.coupons[companyKey] || [];
  }

  copyCouponCode(code: string) {
    navigator.clipboard.writeText(code);
    // Optionally show a toast notification
  }
}

