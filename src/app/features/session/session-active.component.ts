import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { WorkoutSessionService } from '../../core/services/workout-session.service';
import { WorkoutService } from '../../core/services/workout.service';
import { SetRecord } from '../../core/models/workout.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-session-active',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe, LoadingSpinnerComponent],
  templateUrl: './session-active.component.html',
  styleUrl: './session-active.component.scss'
})
export class SessionActiveComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(WorkoutSessionService);
  private readonly workoutService = inject(WorkoutService);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  readonly currentExerciseIndex = signal(0);
  readonly weightInput = signal<number>(0);
  readonly repsInput = signal<number>(0);
  readonly restSeconds = signal(0);
  readonly isResting = signal(false);
  readonly elapsedSeconds = signal(0);
  readonly completing = signal(false);

  readonly session = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.sessionService.sessions().find(s => s.id === id);
  });

  readonly currentExercise = computed(() => {
    const s = this.session();
    if (!s) return undefined;
    return s.exercises[this.currentExerciseIndex()];
  });

  readonly totalExercises = computed(() => this.session()?.exercises.length || 0);

  readonly hasLoggedAnySet = computed(() => {
    const s = this.session();
    return s ? s.exercises.some(e => e.sets.length > 0) : false;
  });

  readonly currentExerciseHistory = computed(() => {
    const ex = this.currentExercise();
    return ex ? this.sessionService.getExerciseHistory(ex.exerciseName).slice(0, 5) : [];
  });

  readonly overallProgress = computed(() => {
    const s = this.session();
    if (!s) return 0;
    const totalSets = s.exercises.reduce((sum, e) => sum + e.targetSets, 0);
    const completedSets = s.exercises.reduce((sum, e) => sum + e.sets.length, 0);
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  });

  constructor() {
    this.startElapsedTimer();
    const ex = this.currentExercise();
    if (ex) {
      this.weightInput.set(ex.targetWeight || 0);
      this.repsInput.set(ex.targetReps || 10);
    }
  }

  ngOnDestroy(): void {
    this.stopTimers();
  }

  navigateExercise(index: number): void {
    this.currentExerciseIndex.set(index);
    this.stopRestTimer();
    const ex = this.session()?.exercises[index];
    if (ex) {
      const lastSet = ex.sets[ex.sets.length - 1];
      this.weightInput.set(lastSet?.weight ?? ex.targetWeight ?? 0);
      this.repsInput.set(lastSet?.reps ?? ex.targetReps ?? 10);
    }
  }

  prevExercise(): void {
    if (this.currentExerciseIndex() > 0) {
      this.navigateExercise(this.currentExerciseIndex() - 1);
    }
  }

  nextExercise(): void {
    if (this.currentExerciseIndex() < this.totalExercises() - 1) {
      this.navigateExercise(this.currentExerciseIndex() + 1);
    }
  }

  async logSet(): Promise<void> {
    const s = this.session();
    const ex = this.currentExercise();
    if (!s || !ex) return;

    const setRecord: SetRecord = {
      setNumber: ex.sets.length + 1,
      weight: this.weightInput(),
      reps: this.repsInput(),
      completedAt: new Date().toISOString()
    };

    await this.sessionService.logSet(s.id, this.currentExerciseIndex(), setRecord);

    if (ex.restTime && ex.sets.length + 1 < ex.targetSets) {
      this.startRestTimer(ex.restTime);
    }
  }

  async completeSession(): Promise<void> {
    const s = this.session();
    if (!s || !this.hasLoggedAnySet()) return;
    this.completing.set(true);
    await this.sessionService.completeSession(s.id);
    if (s.workoutId) {
      await this.workoutService.markComplete(s.workoutId);
      this.router.navigate(['/workouts', s.workoutId]);
    } else {
      this.router.navigate(['/session/history']);
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  formatHistoryDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  skipRest(): void {
    this.stopRestTimer();
  }

  private startRestTimer(seconds: number): void {
    this.stopRestTimer();
    this.restSeconds.set(seconds);
    this.isResting.set(true);
    this.timerInterval = setInterval(() => {
      const remaining = this.restSeconds() - 1;
      if (remaining <= 0) {
        this.stopRestTimer();
      } else {
        this.restSeconds.set(remaining);
      }
    }, 1000);
  }

  private stopRestTimer(): void {
    this.isResting.set(false);
    this.restSeconds.set(0);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private elapsedInterval: ReturnType<typeof setInterval> | null = null;

  private startElapsedTimer(): void {
    this.elapsedInterval = setInterval(() => {
      const s = this.session();
      if (s && !s.completedAt) {
        const started = new Date(s.startedAt).getTime();
        this.elapsedSeconds.set(Math.round((Date.now() - started) / 1000));
      }
    }, 1000);
  }

  private stopTimers(): void {
    this.stopRestTimer();
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
  }
}
