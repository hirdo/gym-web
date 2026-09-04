import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutSessionService } from '../../core/services/workout-session.service';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './session-history.component.html',
  styleUrl: './session-history.component.scss'
})
export class SessionHistoryComponent {
  readonly sessionService = inject(WorkoutSessionService);

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
}
