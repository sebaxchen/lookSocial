import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { TaskStore } from '../../../../learning/application/task.store';

interface DayInfo {
  day: number;
  isCurrentMonth: boolean;
  tasks: any[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatIconButton,
    MatButton
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  private taskStore = inject(TaskStore);

  // Modal state
  isDayModalOpen = signal(false);
  selectedDay = signal<DayInfo | null>(null);

  // Get all tasks with due dates
  readonly tasksWithDueDates = computed(() => 
    this.taskStore.allTasks().filter(task => task.dueDate)
  );

  getDaysInMonth() {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, isCurrentMonth: false, tasks: [] });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const tasksForDay = this.getTasksForDay(day);
      days.push({ day, isCurrentMonth: true, tasks: tasksForDay });
    }

    return days;
  }

  getTasksForDay(day: number) {
    const tasks = this.tasksWithDueDates();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return (
        dueDate.getDate() === day &&
        dueDate.getMonth() === this.currentMonth &&
        dueDate.getFullYear() === this.currentYear
      );
    });
  }

  isOverdue(taskDueDate: Date, status: string): boolean {
    if (status === 'completed') {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(taskDueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getMonthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[this.currentMonth];
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  today() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  isToday(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() &&
      this.currentMonth === today.getMonth() &&
      this.currentYear === today.getFullYear()
    );
  }

  // Modal methods
  openDayModal(dayInfo: DayInfo): void {
    this.selectedDay.set(dayInfo);
    this.isDayModalOpen.set(true);
  }

  closeDayModal(): void {
    this.isDayModalOpen.set(false);
    this.selectedDay.set(null);
  }

  // Helper methods for task display
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'keyboard_arrow_up';
      case 'medium':
        return 'remove';
      case 'low':
        return 'keyboard_arrow_down';
      default:
        return 'assignment';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in-progress':
        return 'En Progreso';
      case 'not-started':
        return 'Sin Iniciar';
      default:
        return 'Desconocido';
    }
  }
}

