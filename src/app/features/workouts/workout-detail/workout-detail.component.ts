import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkoutService } from '../../../core/services/workout.service';
import { WorkoutSessionService } from '../../../core/services/workout-session.service';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './workout-detail.component.html',
  styleUrl: './workout-detail.component.scss'
})
export class WorkoutDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);
  private readonly sessionService = inject(WorkoutSessionService);

  readonly workout = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.workoutService.getById(id) : undefined;
  });

  readonly relatedSessions = computed(() => {
    const w = this.workout();
    return w ? this.sessionService.getSessionsForWorkout(w.id) : [];
  });

  formatDuration(seconds?: number): string {
    if (!seconds) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  totalSets(exercises: { sets: unknown[] }[]): number {
    return exercises.reduce((sum, e) => sum + e.sets.length, 0);
  }

  async startSession(): Promise<void> {
    const w = this.workout();
    if (w) {
      const session = await this.sessionService.startSession(w.id);
      this.router.navigate(['/session', session.id]);
    }
  }

  async markComplete(): Promise<void> {
    const w = this.workout();
    if (w) {
      await this.workoutService.markComplete(w.id);
    }
  }

  async deleteWorkout(): Promise<void> {
    const w = this.workout();
    if (w) {
      await this.workoutService.delete(w.id);
      this.router.navigate(['/workouts']);
    }
  }
}
