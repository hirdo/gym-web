import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProgramService } from '../../core/services/program.service';
import { WorkoutSessionService } from '../../core/services/workout-session.service';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './program-detail.component.html',
  styleUrl: './program-detail.component.scss'
})
export class ProgramDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly programService = inject(ProgramService);
  private readonly sessionService = inject(WorkoutSessionService);

  readonly program = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.programService.getById(id) : undefined;
  });

  readonly progressPercent = computed(() => {
    const p = this.program();
    if (!p || p.totalDays === 0) return 0;
    return Math.round(((p.currentDay || 0) / p.totalDays) * 100);
  });

  async setActive(): Promise<void> {
    const p = this.program();
    if (p) await this.programService.setActive(p.id);
  }

  async startDay(): Promise<void> {
    const p = this.program();
    if (!p) return;
    const dayIndex = p.currentDay || 0;
    const day = p.days[dayIndex];
    if (!day) return;

    const session = await this.sessionService.startSession(undefined, p.id, day.dayNumber);
    this.router.navigate(['/session', session.id]);
  }

  async deleteProgram(): Promise<void> {
    const p = this.program();
    if (p) {
      await this.programService.delete(p.id);
      this.router.navigate(['/programs']);
    }
  }
}
