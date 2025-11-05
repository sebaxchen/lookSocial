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
      icon: 'people',
      title: 'Amigos',
      description: 'Gestiona tus amigos y conexiones. Mantén un registro de tus contactos y relaciones.',
      tags: ['Amigos', 'Conexiones'],
      color: '#2563EB'
    },
    {
      icon: 'article',
      title: 'Post',
      description: 'Gestiona y visualiza tus publicaciones. Crea, edita y comparte tus posts.',
      tags: ['Publicaciones', 'Compartir'],
      color: '#DC2626'
    },
    {
      icon: 'label',
      title: 'Etiquetas',
      description: 'Organiza y gestiona tus etiquetas. Categoriza y encuentra contenido fácilmente.',
      tags: ['Organización', 'Categorías'],
      color: '#059669'
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

