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
      const sessions = this.sessionService.sessions().filter(s => s.workoutId === w.id);
      for (const s of sessions) {
        await this.sessionService.deleteSession(s.id);
      }
      await this.workoutService.delete(w.id);
      this.router.navigate(['/workouts']);
    }
  }
}
