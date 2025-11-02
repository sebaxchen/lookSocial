import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  currentSlide = signal(0);
  selectedButtonIndex = signal<number | null>(null);
  private autoSlideInterval: any;
  private observer?: IntersectionObserver;

  buttonFeatures = [
    {
      id: 'move',
      title: 'Botón de Mover',
      description: 'Organiza tus tareas arrastrándolas entre diferentes columnas. Cambia el estado de una tarea de forma intuitiva y visual, simplemente agarrándola y moviéndola a donde necesites.',
      icon: 'drag_indicator',
      class: 'move-button',
      color: '#6b7280'
    },
    {
      id: 'edit',
      title: 'Botón de Editar',
      description: 'Modifica cualquier tarea con un solo clic. Actualiza el título, descripción, prioridad, fecha de vencimiento o cualquier detalle importante de tus tareas fácilmente.',
      icon: 'edit',
      class: 'edit-button',
      color: '#1976d2'
    },
    {
      id: 'share',
      title: 'Botón de Compartir',
      description: 'Comparte archivos y documentos con tu equipo. Colabora en tiempo real, asigna permisos específicos y mantén a todos al día con los recursos importantes del proyecto.',
      icon: 'share',
      class: 'share-button',
      color: '#22c55e'
    }
  ];

  views = [
    {
      icon: 'home',
      title: 'Inicio',
      description: 'Tu centro de control principal. Crea y gestiona tus notas de forma rápida y eficiente.',
      tags: ['Crear notas', 'Vista rápida'],
      color: '#047857'
    },
    {
      icon: 'dashboard',
      title: 'Dashboard',
      description: 'Visualiza métricas clave y estadísticas de tu productividad en tiempo real.',
      tags: ['KPIs', 'Estadísticas'],
      color: '#7c3aed'
    },
    {
      icon: 'groups',
      title: 'Grupos',
      description: 'Organiza tu trabajo en grupos temáticos y colabora con tu equipo de manera eficiente.',
      tags: ['Colaboración', 'Organización'],
      color: '#d97706'
    },
    {
      icon: 'task',
      title: 'Gestión de Tareas',
      description: 'Administra todas tus tareas, asigna responsables y sigue el progreso de cada proyecto.',
      tags: ['Tareas', 'Asignaciones'],
      color: '#0891b2'
    },
    {
      icon: 'people',
      title: 'Colaboradores',
      description: 'Gestiona tu equipo, visualiza el rendimiento individual y fomenta el crecimiento profesional.',
      tags: ['Equipo', 'Rendimiento'],
      color: '#be185d'
    },
    {
      icon: 'folder',
      title: 'Archivos',
      description: 'Comparte archivos de forma segura, organiza documentos y mantén todo accesible.',
      tags: ['Archivos', 'Compartir'],
      color: '#ca8a04'
    },
    {
      icon: 'calendar_month',
      title: 'Calendario',
      description: 'Visualiza tus tareas y fechas importantes en un calendario interactivo y fácil de usar.',
      tags: ['Vista mensual', 'Recordatorios'],
      color: '#2563eb'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Auto-avanzar cada 4 segundos
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupScrollAnimations() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, options);

    // Observar todas las secciones
    const sections = document.querySelectorAll('.scroll-animation');
    sections.forEach(section => {
      this.observer?.observe(section);
    });
  }

  enterApp() {
    this.router.navigate(['/auth/login']);
  }

  nextSlide() {
    this.currentSlide.set((this.currentSlide() + 1) % this.views.length);
  }

  prevSlide() {
    this.currentSlide.set((this.currentSlide() - 1 + this.views.length) % this.views.length);
  }

  getVisibleViews() {
    const current = this.currentSlide();
    const total = this.views.length;
    const prevIndex = (current - 1 + total) % total;
    const nextIndex = (current + 1) % total;
    
    return [
      { index: prevIndex, view: this.views[prevIndex], position: 'prev' },
      { index: current, view: this.views[current], position: 'active' },
      { index: nextIndex, view: this.views[nextIndex], position: 'next' }
    ];
  }

  getTotalViews() {
    return this.views.length;
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    // Reiniciar el intervalo cuando el usuario navega manualmente
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  selectButton(index: number) {
    if (this.selectedButtonIndex() === index) {
      this.selectedButtonIndex.set(null);
    } else {
      this.selectedButtonIndex.set(index);
    }
  }

  getSelectedButton() {
    const index = this.selectedButtonIndex();
    return index !== null ? this.buttonFeatures[index] : null;
  }
}

