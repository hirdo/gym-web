import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExerciseLibraryService } from '../../core/services/exercise-library.service';
import { ExerciseLogService } from '../../core/services/exercise-log.service';
import { AuthService } from '../../core/services/auth.service';
import { parseLocalDate } from '../../core/utils/date.util';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.scss'
})
export class ExerciseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exerciseService = inject(ExerciseLibraryService);
  private readonly exerciseLogService = inject(ExerciseLogService);
  readonly auth = inject(AuthService);

  readonly exercise = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.exerciseService.getById(id) : undefined;
  });

  readonly history = computed(() => {
    const ex = this.exercise();
    if (!ex) return [];
    return this.exerciseLogService.getExerciseHistory(ex.name, ex.id).slice(0, 10);
  });

  readonly alternatives = computed(() => {
    const ex = this.exercise();
    if (!ex) return [];
    return this.exerciseService.getAlternatives(ex.id).slice(0, 6);
  });

  readonly lastWeight = computed(() => {
    const ex = this.exercise();
    if (!ex) return undefined;
    return this.exerciseLogService.getLastWeight(ex.name, ex.id);
  });

  formatDate(dateStr: string): string {
    return parseLocalDate(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  async deleteExercise(): Promise<void> {
    const ex = this.exercise();
    if (ex) {
      await this.exerciseService.deleteExercise(ex.id);
      this.router.navigate(['/exercises']);
    }
  }
}
