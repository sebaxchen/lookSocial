import { Component, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TaskStore } from '../../../../learning/application/task.store';
import { TeamService } from '../../../application/team.service';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatProgressBar,
    MatChipsModule,
    EmptyStateComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private taskStore = inject(TaskStore);
  private teamService = inject(TeamService);

  ngOnInit(): void {
    // Component initialization
  }

  // Estadísticas generales
  readonly totalTasks = computed(() => this.taskStore.taskCount());
  readonly completedTasks = computed(() => this.taskStore.completedCount());
  readonly inProgressTasks = computed(() => this.taskStore.inProgressCount());
  readonly notStartedTasks = computed(() => this.taskStore.notStartedCount());
  
  // Porcentajes - optimized to reduce calculations
  readonly completionRate = computed(() => {
    const total = this.totalTasks();
    const completed = this.completedTasks();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  readonly inProgressRate = computed(() => {
    const total = this.totalTasks();
    const inProgress = this.inProgressTasks();
    return total > 0 ? Math.round((inProgress / total) * 100) : 0;
  });

  readonly notStartedRate = computed(() => {
    const total = this.totalTasks();
    const notStarted = this.notStartedTasks();
    return total > 0 ? Math.round((notStarted / total) * 100) : 0;
  });

  // Estadísticas por prioridad - optimized to scan once
  private priorityDistribution = computed(() => {
    const tasks = this.taskStore.allTasks();
    return {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
  });

  readonly highPriorityTasks = computed(() => this.priorityDistribution().high);
  readonly mediumPriorityTasks = computed(() => this.priorityDistribution().medium);
  readonly lowPriorityTasks = computed(() => this.priorityDistribution().low);

  // Estadísticas del equipo
  readonly teamMembers = computed(() => this.teamService.allMembers());
  readonly totalTeamMembers = computed(() => this.teamMembers().length);

  // Tareas recientes
  readonly recentTasks = computed(() => 
    this.taskStore.allTasks().slice(0, 5)
  );

  // Productividad del equipo - optimized to reduce logs in production
  readonly teamProductivity = computed(() => {
    const members = this.teamMembers();
    if (members.length === 0) return [];

    return members.map(member => {
      const memberTasks = this.taskStore.getTasksByAssignee(member.name);
      const completed = memberTasks.filter(task => task.status === 'completed').length;
      const total = memberTasks.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Group by status once for performance
      const byStatus = {
        completed: completed,
        inProgress: memberTasks.filter(task => task.status === 'in-progress').length,
        notStarted: memberTasks.filter(task => task.status === 'not-started').length
      };

      return {
        name: member.name,
        avatar: member.avatar,
        totalTasks: total,
        completedTasks: byStatus.completed,
        completionRate: completionRate,
        inProgress: byStatus.inProgress,
        notStarted: byStatus.notStarted
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  });



  // Métricas de tiempo
  readonly todayTasks = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.taskStore.allTasks().filter(task => 
      task.createdAt >= today
    ).length;
  });

  readonly thisWeekTasks = computed(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.taskStore.allTasks().filter(task => 
      task.createdAt >= weekAgo
    ).length;
  });

  // Función para obtener el color de prioridad
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }

  // Función para obtener el icono de prioridad
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  // Función para obtener el color de estado
  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'primary';
      case 'in-progress': return 'accent';
      case 'not-started': return 'warn';
      default: return 'primary';
    }
  }

  // Función para obtener el icono de estado
  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'in-progress': return 'schedule';
      case 'not-started': return 'play_circle_outline';
      default: return 'help';
    }
  }

  // Función para obtener el texto de estado
  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En Progreso';
      case 'not-started': return 'Sin Iniciar';
      default: return 'Desconocido';
    }
  }

  // Función para obtener el texto de prioridad
  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  }

  // Función para obtener el color único del miembro
  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }
}
