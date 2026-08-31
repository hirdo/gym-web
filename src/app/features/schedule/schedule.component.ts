import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  private readonly workoutService = inject(WorkoutService);

  readonly weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  readonly currentWeekStart = signal(this.getMonday(new Date()));

  readonly weekDates = computed(() => {
    const start = this.currentWeekStart();
    return this.weekDays.map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  });

  readonly scheduledWorkouts = computed(() => {
    const workouts = this.workoutService.workouts();
    return workouts.filter(w => w.scheduledDate);
  });

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getWorkoutsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.scheduledWorkouts().filter(w => w.scheduledDate?.startsWith(dateStr));
  }

  previousWeek(): void {
    const current = this.currentWeekStart();
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 7);
    this.currentWeekStart.set(prev);
  }

  nextWeek(): void {
    const current = this.currentWeekStart();
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    this.currentWeekStart.set(next);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
